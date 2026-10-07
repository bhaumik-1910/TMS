import type { Transaction } from 'sequelize';
import { checkLimits, type LimitDef } from '../acl/limits.js';
import type { ReqCtx } from '../auth/auth-user.js';
import type { TenantModel } from '../db/tenant.model.js';
import { PeriodLockService, PERIOD_UNLOCK } from '../period/period-lock.service.js';
import type { PeriodLocks } from '../period/period-locks.js';
import type { EntityAction } from './entity-action.js';
import type { Issues } from './issues.js';
import type { Attrs, OpContext } from './op-context.js';

/** The reason a record is not in a state the action starts from, or null. */
export function startStateReason<M extends TenantModel>(action: Pick<EntityAction<M>, 'from' | 'label' | 'onDeleted'>, row: M): string | null {
  for (const [field, allowed] of Object.entries(action.from ?? {})) {
    const current = String(row.get(field) ?? '');
    if (!allowed.includes(current)) return `${action.label} is not possible while ${field} is "${current}"`;
  }
  if (action.onDeleted && !row.get('deletedAt')) return `${action.label} works on deleted records only`;
  return null;
}

/** What the framework checks of one operation before any check step runs. */
export interface BuiltInChecks<M extends TenantModel> {
  /** Shown in messages: "Approve", "Edit". */
  label: string;
  limits?: readonly LimitDef<M>[];
  /** The service's `periodField`; set unless the operation opts out. */
  periodField?: string | null;
}

/** Locks of one company per transaction: a bulk action asks once. */
const lockCache = new WeakMap<Transaction, Promise<PeriodLocks>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function locksFor(c: OpContext<TenantModel, Attrs, any>): Promise<PeriodLocks> {
  const root = c.t;
  let hit = lockCache.get(root);
  if (!hit) {
    hit = c.get(PeriodLockService).load(c.user.companyId, c.t);
    lockCache.set(root, hit);
  }
  return hit;
}

/** The dates that decide the period: stored and new on update, the one that exists otherwise. */
export function periodDates(op: string, row: TenantModel, before: Attrs | null, field: string): unknown[] {
  if (op === 'update') return [before?.[field], row.get(field)];
  return [row.get(field)];
}

/** Blocks when a record is in a locked period, or above the caller's limit. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runBuiltInChecks<M extends TenantModel>(c: OpContext<M, Attrs, any>, spec: BuiltInChecks<M>): Promise<void> {
  if (spec.periodField) await checkPeriod(c, spec.periodField, c.issues);
  checkLimits(c.issues, c.ctx, c.row, spec.limits, spec.label);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkPeriod(c: OpContext<TenantModel, Attrs, any>, field: string, issues: Issues): Promise<void> {
  const locks = await locksFor(c);
  const branch = (c.row.get('branchId') ?? c.before?.branchId ?? null) as number | null;
  for (const date of periodDates(c.op, c.row, c.before, field)) {
    const reason = locks.blocks(date, branch);
    if (!reason) continue;
    if ((await c.can(PERIOD_UNLOCK)) !== null) return;
    issues.block('period_locked', reason);
    return;
  }
}

/** Limits that apply to an operation: the service's `limits` map, or the action's own. */
export function limitsFor<M extends TenantModel>(
  op: string,
  declared: Partial<Record<string, readonly LimitDef<M>[]>>,
  action?: EntityAction<M>,
): readonly LimitDef<M>[] | undefined {
  return action?.limits ?? declared[op];
}

export type { ReqCtx };
