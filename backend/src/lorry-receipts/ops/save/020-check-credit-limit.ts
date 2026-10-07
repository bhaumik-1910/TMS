import type { OpStep, OpContext } from '../../../framework/ops/op-context';
import { CustomerModel, ExceptionModel } from '../../../database/models';

/**
 * Step 020 [check]: Checks party credit limit and logs an Exception if breached.
 */
export const checkCreditLimitStep: OpStep = {
  file: 'save/020-check-credit-limit.ts',
  number: 20,
  phase: 'check',
  async run(c: OpContext) {
    if (!c.data.customerId && !c.data.consignorId) return;
    const customerId = c.data.customerId || c.data.consignorId;

    const customer = await CustomerModel.findByPk(customerId, { transaction: c.t });
    if (!customer) return;

    const creditLimit = Number((customer as any).creditLimit) || 0;
    const currentOutstanding = Number((customer as any).currentBalance) || 0;
    const orderFreight = Number(c.data.totalFreightAmount || c.data.totalFreight) || 0;

    if (creditLimit > 0 && currentOutstanding + orderFreight > creditLimit) {
      // Auto-raise ExceptionRecord in exceptions table (Ankpal pattern)
      await ExceptionModel.create(
        {
          organizationId: c.organizationId,
          branchId: c.data.branchId || c.user.branchId || null,
          type: 'credit_limit',
          severity: 'high',
          title: `Credit limit exceeded for customer ${customer.companyName || customerId}`,
          detail: `Exposure: ${(currentOutstanding + orderFreight).toFixed(2)} exceeds limit of ${creditLimit.toFixed(2)}`,
          refType: 'Customer',
          refId: customerId,
          occurredOn: new Date().toISOString().split('T')[0],
        },
        { transaction: c.t },
      );

      c.issues.warn(
        'CREDIT_LIMIT_EXCEEDED',
        `Consignor credit limit of ₹${creditLimit} is exceeded by ₹${currentOutstanding + orderFreight - creditLimit}. Exception logged to Control Tower.`,
      );
    }
  },
};
