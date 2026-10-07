import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/** Judges what 010 found. Reads `state`; does not query again. */
export default step<Branch, DeactivateState>({
  async check({ state, issues }) {
    if (state.isHeadOffice) issues.block('head_office', 'The head office cannot be deactivated');
    const users = state.activeUsers ?? 0;
    if (users > 0) issues.block('active_users', `${users} active user(s) have this as their home branch`, { count: users, refType: 'users' });
  },
});
