import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { PeriodLockService } from '../../../foundation/period-locks/period-lock.service';

/**
 * Step 010 [check]: Asserts that the LR booking date is not on or before a locked period.
 */
export const checkPeriodLockStep: OpStep = {
  file: 'save/010-check-period-lock.ts',
  number: 10,
  phase: 'check',
  async run(c: OpContext) {
    const periodLockService = c.get<PeriodLockService>(PeriodLockService);
    const dateStr = c.data.lrDate || new Date().toISOString().split('T')[0];
    const branchId = c.data.branchId || c.user.branchId || null;

    try {
      await periodLockService.checkAllowed(
        c.organizationId,
        branchId,
        dateStr,
        'Issue Lorry Receipt',
      );
    } catch (err: any) {
      c.issues.block('PERIOD_LOCKED', err.message);
    }
  },
};
