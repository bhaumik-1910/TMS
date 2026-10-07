import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { PeriodLockService } from '../../../foundation/period-locks/period-lock.service';
import { ExceptionModel } from '../../../database/models';

/**
 * Step 010 [check]: Validates period lock and verifies maximum driver trip advance threshold.
 */
export const checkAdvanceLimitStep: OpStep = {
  file: 'advances/010-check-advance-limit.ts',
  number: 10,
  phase: 'check',
  async run(c: OpContext) {
    const periodLockService = c.get<PeriodLockService>(PeriodLockService);
    const dateStr = c.data.date || new Date().toISOString().split('T')[0];
    const branchId = c.data.branchId || c.user.branchId || null;

    // 1. Period Lock check
    try {
      await periodLockService.checkAllowed(
        c.organizationId,
        branchId,
        dateStr,
        'Issue Driver Advance',
      );
    } catch (err: any) {
      c.issues.block('PERIOD_LOCKED', err.message);
    }

    // 2. Advance threshold check
    const amount = parseFloat(String(c.data.amount || '0').replace(/[^0-9.]/g, '')) || 0;
    const MAX_SINGLE_ADVANCE = 15000;

    if (amount > MAX_SINGLE_ADVANCE) {
      await ExceptionModel.create(
        {
          organizationId: c.organizationId,
          branchId,
          type: 'advance_limit',
          severity: 'medium',
          title: `Advance limit exceeded: ₹${amount.toLocaleString('en-IN')} to ${c.data.driver}`,
          detail: `Issued advance of ₹${amount} exceeds ceiling policy of ₹${MAX_SINGLE_ADVANCE} for single trip disbursement.`,
          refType: 'Driver',
          refId: 0,
          occurredOn: dateStr,
        },
        { transaction: c.t },
      );

      c.issues.warn(
        'ADVANCE_LIMIT_EXCEEDED',
        `Disbursement of ₹${amount} exceeds recommended single-advance ceiling of ₹${MAX_SINGLE_ADVANCE}. Exception logged to Control Tower.`,
      );
    }
  },
};
