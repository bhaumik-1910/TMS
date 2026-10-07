import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/**
 * A `bulk` action runs its steps once per chosen branch. All branches are checked first and every
 * blocker comes back together, each naming its branch; nothing changes unless none is blocked.
 * (`c.rows` holds the whole selection if a step needs to compare records.)
 */
export default step<Branch>({
  async check({ row, issues, count }) {
    if (row.isHeadOffice) issues.block('head_office', 'The head office cannot be deactivated');
    const users = await count(`users WHERE branch_id = :id AND status = 'active'`, { id: row.id });
    if (users > 0) issues.block('active_users', `${users} active user(s) have this as their home branch`, { count: users, refType: 'users' });
  },
});
