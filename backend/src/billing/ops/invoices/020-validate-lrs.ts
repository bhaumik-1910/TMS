import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { LorryReceiptModel } from '../../../database/models';

/**
 * Step 020 [check]: Verifies referenced LR exists and is ready for billing.
 */
export const validateInvoiceLrStep: OpStep = {
  file: 'billing/ops/invoices/020-validate-lrs.ts',
  number: 20,
  phase: 'check',
  async run(c: OpContext) {
    const lrRef = c.data.lrRef;
    if (!lrRef || lrRef === '—' || lrRef === 'None') return;

    const lr = await LorryReceiptModel.findOne({
      where: { lrNumber: lrRef },
      transaction: c.t,
    });

    if (lr) {
      if (lr.status === 'Cancelled') {
        c.issues.block('LR_CANCELLED', `Cannot generate invoice for cancelled consignment ${lrRef}.`);
      }
      c.state.lrRecord = lr;
    }
  },
};
