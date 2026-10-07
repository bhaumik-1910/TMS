import { step } from '../../../../framework/crud/op-context.js';
import type { User } from '../../user.model.js';

export default step<User>({
  async check({ unique }) {
    await unique('email');
    await unique('code');
  },
});
