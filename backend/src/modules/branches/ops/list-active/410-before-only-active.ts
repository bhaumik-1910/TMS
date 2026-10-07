import { listStep } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/** `GET /branches?view=active`: a named list. Runs the shared `list/` steps too, in number order. */
export default listStep<Branch>({
  async before({ where }) {
    where.push({ status: 'active' });
  },
});
