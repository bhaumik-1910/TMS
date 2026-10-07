import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/** Branch codes are unique within the company. */
export default step<Branch>({
  async check({ unique }) {
    await unique('code');
  },
});
