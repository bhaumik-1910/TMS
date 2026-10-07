import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { PeriodLockService } from '../../../foundation/period-locks/period-lock.service';

/**
 * Step 010 [check]: Validates that the purchase bill date is not in a locked financial period.
 */
export const checkPurchaseBillPeriodLockStep: OpStep = {
  file: 'billing/ops/purchase-bills/010-check-period-lock.ts',
  number: 10,
  phase: 'check',
  async run(c: OpContext) {
    const periodLockService = c.get<PeriodLockService>(PeriodLockService);
    const dateStr = c.data.date || new Date().toISOString().split('T')[0];
    const branchId = c.data.branchId || c.user.branchId || null;

    try {
      await periodLockService.checkAllowed(
        c.organizationId,
        branchId,
        dateStr,
        'Create Vendor Purchase Bill',
      );
    } catch (err: any) {
      c.issues.block('PERIOD_LOCKED', err.message);
    }
  },
};
