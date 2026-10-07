import type { EntityAction } from '../../framework/crud/entity-action.js';
import { statusActions } from '../../framework/crud/status-actions.js';
import type { User } from './user.model.js';

/** What can be done to a user besides editing. Checks and effects are in `ops/<name>/`. */
export const userActions: EntityAction<User>[] = [
  {
    name: 'approve',
    label: 'Approve',
    from: { status: ['pending'] },
    confirm: 'Approve this user and let them sign in?',
    effect: 'status -> active',
    async run({ row, ctx, t }) {
      await row.update({ status: 'active', updatedById: ctx.user.id }, { transaction: t });
    },
  },
  ...statusActions<User>({ noun: 'user', deactivateFrom: ['active'], activateFrom: ['inactive', 'suspended'] }),
];
