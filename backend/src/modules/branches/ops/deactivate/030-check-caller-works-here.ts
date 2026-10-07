import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Conditional step + warning: `when` skips the step unless the caller has access to this branch.
 * A warning does not block; the user is asked to confirm (`confirm: true`) and may go ahead.
 */
export default step<Branch, DeactivateState>({
  describe: 'only when the caller has access to this branch',
  when: ({ user, row }) => user.branchIds.includes(row.id as number),
  async check({ issues, row }) {
    issues.warn('own_branch', `You work in ${row.name} too; you will no longer see its data after this.`);
  },
});
