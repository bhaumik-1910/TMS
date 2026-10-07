import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Gathers the facts the later steps need. Decides nothing itself.
 * `c.user` is the signed-in user; `c.count` queries inside the running transaction `c.t`.
 */
export default step<Branch, DeactivateState>({
  async check({ row, user, count, state }) {
    state.isHeadOffice = row.isHeadOffice;
    state.statusBefore = row.status;
    state.deactivatedBy = user.name;
    state.activeUsers = await count(`users WHERE branch_id = :id AND status = 'active'`, { id: row.id });
  },
});
