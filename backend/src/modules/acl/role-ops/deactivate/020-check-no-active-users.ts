import { step } from '../../../../framework/crud/op-context.js';
import type { Role } from '../../../../framework/acl/role.model.js';

export default step<Role>({
  async check({ row, count, issues }) {
    const users = await count(`users WHERE role_id = :id AND status = 'active'`, { id: row.id });
    if (users > 0) issues.block('active_users', `${users} active user(s) have this role`, { count: users, refType: 'users' });
  },
});
