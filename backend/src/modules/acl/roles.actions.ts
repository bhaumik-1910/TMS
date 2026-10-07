import type { EntityAction } from '../../framework/crud/entity-action.js';
import { statusActions } from '../../framework/crud/status-actions.js';
import type { Role } from '../../framework/acl/role.model.js';

/** What can be done to a role besides editing. Checks and effects are in `role-ops/<name>/`. */
export const roleActions: EntityAction<Role>[] = statusActions<Role>({ noun: 'role' });
