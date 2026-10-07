import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { ExceptionModel } from '../../../database/models';

/**
 * Step 020 [check]: Verifies trip settlement figures and flags unexpected negative balances or high shortage.
 */
export const validateSettlementBalanceStep: OpStep = {
  file: 'billing/ops/settlements/020-validate-trip-balance.ts',
  number: 20,
  phase: 'check',
  async run(c: OpContext) {
    const parseNum = (val: any) =>
      parseFloat(String(val || '0').replace(/[^0-9.-]/g, '')) || 0;

    const gross = parseNum(c.data.grossAmt);
    const advance = parseNum(c.data.advance);
    const shortage = parseNum(c.data.shortage);
    const net = parseNum(c.data.netPayable || gross - advance - shortage);

    if (shortage > 5000) {
      await ExceptionModel.create(
        {
          organizationId: c.organizationId,
          branchId: c.data.branchId || c.user.branchId || null,
          type: 'settlement_shortage',
          severity: 'high',
          title: `Excessive shortage deduction in settlement: ₹${shortage}`,
          detail: `Party: ${c.data.party || '—'}, Trip Ref: ${c.data.tripRef || '—'}. Shortage deduction of ₹${shortage} flagged for manager verification.`,
          refType: 'Settlement',
          refId: 0,
          occurredOn: c.data.date || new Date().toISOString().split('T')[0],
        },
        { transaction: c.t },
      );

      c.issues.warn(
        'HIGH_SHORTAGE_DEDUCTION',
        `High shortage deduction of ₹${shortage} detected. Exception record created in Control Tower.`,
      );
    }

    if (net < 0) {
      c.issues.warn(
        'NEGATIVE_SETTLEMENT',
        `Settlement net payable is negative (-₹${Math.abs(net)}). Advance exceeds gross freight.`,
      );
    }
  },
};
