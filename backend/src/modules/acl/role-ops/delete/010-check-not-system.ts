import { step } from '../../../../framework/crud/op-context.js';
import type { Role } from '../../../../framework/acl/role.model.js';

export default step<Role>({
  async check({ row, issues }) {
    if (row.isSystem) issues.block('system_role', 'A system role cannot be deleted');
  },
});
