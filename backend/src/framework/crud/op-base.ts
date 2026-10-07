import type { Logger } from '@nestjs/common';
import type { ModuleRef } from '@nestjs/core';
import { QueryTypes, type Transaction } from 'sequelize';
import { AclService } from '../acl/acl.service.js';
import type { ReqCtx } from '../auth/auth-user.js';
import { SettingsService } from '../settings/settings.service.js';
import { sequelizeOf } from '../tenancy/guards.js';
import { ControlPlane } from '../tenancy/tenant-db.js';
import { tenantSavepoint, tenantTransaction } from '../tenancy/transaction.js';
import { Issues } from './issues.js';
import type { OpBase } from './op-context.js';

export interface OpBaseEnv {
  resource: string;
  moduleRef: ModuleRef;
  logger: Logger;
}

/** The outermost transaction of `t` (a savepoint's parent chain). */
function rootOf(t: Transaction): Transaction {
  let top = t;
  for (let up = (top as unknown as { parent?: Transaction }).parent; up; up = (top as unknown as { parent?: Transaction }).parent) top = up;
  return top;
}

/** Counts rows in another table: `SELECT count(*) FROM <sql>`, in `t`. */
export async function countRows(t: Transaction, sql: string, replacements: Record<string, unknown>): Promise<number> {
  const rows = await sequelizeOf(t).query<{ n: number }>(`SELECT count(*)::int AS n FROM ${sql}`, { replacements, type: QueryTypes.SELECT, transaction: t });
  return rows[0]?.n ?? 0;
}

/** What every kind of operation shares: who, the transaction and its helpers, services, state. */
export function makeOpBase(env: OpBaseEnv, op: string, ctx: ReqCtx, t: Transaction): OpBase {
  let settings: Promise<Record<string, unknown>> | null = null;
  return {
    op,
    ctx,
    user: ctx.user,
    scope: ctx.scope,
    limits: ctx.limits,
    t,
    state: {},
    issues: new Issues(),
    result: undefined,
    count: (sql, replacements) => countRows(t, sql, replacements),
    sql: <T>(sql: string, replacements: Record<string, unknown> | unknown[] = {}, on: Transaction = t) =>
      sequelizeOf(on).query(sql, { replacements, type: QueryTypes.SELECT, transaction: on }) as Promise<T[]>,
    can: async (permission) => {
      if (ctx.user.id === 0) return 'all';
      return (await env.moduleRef.get(AclService, { strict: false }).effective(ctx.user)).get(permission)?.scope ?? null;
    },
    get: (token) => env.moduleRef.get(token as never, { strict: false }),
    savepoint: (work) => tenantSavepoint(t, work),
    separate: (work) => tenantTransaction(work),
    control: (work) => env.moduleRef.get(ControlPlane, { strict: false }).tx(work),
    setting: async <T>(key: string): Promise<T> => {
      settings ??= env.moduleRef.get(SettingsService, { strict: false }).all(ctx.user.companyId, t);
      return (await settings)[key] as T;
    },
    afterCommit: (work) => {
      rootOf(t).afterCommit(async () => {
        try {
          await work();
        } catch (error) {
          env.logger.error(`afterCommit work of ${env.resource}.${op} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    },
  };
}
