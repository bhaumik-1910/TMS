import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Example of refreshing the row for the steps after this one. Raw SQL or another service may have
 * changed the stored branch inside `c.t`; `c.reload()` re-reads it into the same `c.row` object,
 * so 600 and 610 see the stored values. `state` carries anything that is not a column.
 */
export default step<Branch, DeactivateState>({
  async after({ reload, state }) {
    const row = await reload();
    state.statusAfter = row.status;
  },
});
