import { step } from '../../../../framework/crud/op-context.js';
import type { CreateRoleDto, UpdateRoleDto } from '../../dto/role.dto.js';
import type { Role } from '../../../../framework/acl/role.model.js';

/** A system role keeps its code and always holds every permission. */
export default step<Role, object, CreateRoleDto | UpdateRoleDto>({
  async check({ row, before, dto, changed, issues }) {
    if (!row.isSystem || !before) return;
    if (changed('code')) issues.field('code', 'System role code is fixed');
    if (dto.permissions) issues.field('permissions', 'System role always has every permission');
  },
});
