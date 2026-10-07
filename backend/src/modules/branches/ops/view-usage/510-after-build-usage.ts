import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/** `GET /branches/:id/views/usage`: a read-only view. The step builds `c.result` instead of returning the row. */
export default step<Branch>({
  async after(c) {
    const [active, all] = await Promise.all([
      c.count(`users WHERE branch_id = :id AND status = 'active'`, { id: c.row.id }),
      c.count(`users WHERE branch_id = :id`, { id: c.row.id }),
    ]);
    c.result = { id: c.row.id, name: c.row.name, activeUsers: active, allUsers: all, canDeactivate: !c.row.isHeadOffice && active === 0 };
  },
});
