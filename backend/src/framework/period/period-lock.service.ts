import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';
import { recordEvent } from '../audit/record.js';
import { AclService } from '../acl/acl.service.js';
import type { ReqCtx } from '../auth/auth-user.js';
import { fieldError } from '../errors.js';
import { TenantDb } from '../tenancy/tenant-db.js';
import { PeriodLock } from './period-lock.model.js';
import { dayOf, PeriodLocks } from './period-locks.js';

export const PERIOD_UNLOCK = 'period.unlock';

/** Reads and sets the period locks of the signed-in company. */
@Injectable()
export class PeriodLockService {
  constructor(
    @InjectModel(PeriodLock) private readonly locks: typeof PeriodLock,
    private readonly acl: AclService,
    private readonly db: TenantDb,
  ) {}

  async load(companyId: number, t?: Transaction): Promise<PeriodLocks> {
    const rows = await this.locks.findAll({ where: { companyId }, attributes: ['branchId', 'lockedUntil'], ...(t ? { transaction: t } : {}) });
    return new PeriodLocks(rows);
  }

  list(ctx: ReqCtx) {
    return this.locks.findAll({ where: { companyId: ctx.user.companyId }, order: [['branchId', 'ASC']] });
  }

  /**
   * Sets the lock of a branch (0 = all) to a day, or clears it with `null`. Moving a lock earlier
   * or clearing it re-opens closed periods, so it needs `period.unlock`.
   */
  async set(ctx: ReqCtx, branchId: number, lockedUntil: string | null): Promise<PeriodLock | null> {
    const day = lockedUntil === null ? null : dayOf(lockedUntil);
    if (lockedUntil !== null && !day) throw fieldError('lockedUntil', 'Enter a date as YYYY-MM-DD');
    return this.db.tx(async (t) => {
      const current = await this.locks.findOne({ where: { companyId: ctx.user.companyId, branchId }, transaction: t, lock: t.LOCK.UPDATE });
      const reopens = current !== null && (day === null || day < (dayOf(current.lockedUntil) as string));
      if (reopens && !(await this.acl.effective(ctx.user)).has(PERIOD_UNLOCK)) {
        throw new ForbiddenException(`You do not have permission: ${PERIOD_UNLOCK}`);
      }
      if (day === null) {
        if (current) {
          await current.destroy({ transaction: t });
          await recordEvent(t, ctx, 'PeriodLock', current.id as number, 'delete', { branchId, lockedUntil: [current.lockedUntil, null] });
        }
        return null;
      }
      if (current) {
        const before = current.lockedUntil;
        await current.update({ lockedUntil: day, updatedById: ctx.user.id }, { transaction: t });
        await recordEvent(t, ctx, 'PeriodLock', current.id as number, 'update', { lockedUntil: [before, day] });
        return current;
      }
      const created = await this.locks.create({ branchId, lockedUntil: day, createdById: ctx.user.id, updatedById: ctx.user.id } as never, { transaction: t });
      await recordEvent(t, ctx, 'PeriodLock', created.id as number, 'create', { branchId, lockedUntil: day });
      return created;
    });
  }
}
