import { execute } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/**
 * The main change of `deactivate-many`, run once per chosen branch. The action declares no `run`,
 * so `original()` would do nothing; this file is the whole write.
 */
export default execute<Branch>({
  describe: 'sets status inactive',
  async run({ row, user, t }) {
    await row.update({ status: 'inactive', updatedById: user.id }, { transaction: t });
  },
});
