import { step } from '../../../../framework/crud/op-context.js';
import type { Role } from '../../../../framework/acl/role.model.js';

export default step<Role>({
  async check({ unique }) {
    await unique('code');
  },
});
