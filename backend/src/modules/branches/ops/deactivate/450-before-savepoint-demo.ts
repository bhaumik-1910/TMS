import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Transaction example: optional work that must not fail the deactivation. The query below fails
 * (the table does not exist); `c.savepoint` rolls back just that part, the step catches the error,
 * and the operation carries on in the same transaction.
 */
export default step<Branch, DeactivateState>({
  async before({ savepoint, sql, state }) {
    try {
      await savepoint((t) => sql('SELECT count(*) FROM branch_optional_stats', {}, t));
    } catch {
      state.statsSkipped = true;
    }
  },
});
