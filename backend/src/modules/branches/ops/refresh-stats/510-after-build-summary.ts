import { collectionStep } from '../../../../framework/crud/op-context.js';

/** A `collection` action has no record (imports, recalculations). Its steps get the same helpers; the context has no `row`. */
export default collectionStep({
  async after(c) {
    const branches = await c.count('branches WHERE company_id = :company', { company: c.user.companyId });
    c.result = { branches, refreshedBy: c.user.name };
  },
});
