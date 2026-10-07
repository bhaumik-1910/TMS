import { step } from '../../../../framework/crud/op-context.js';
import type { User } from '../../user.model.js';

export default step<User>({
  async check({ row, ctx, issues }) {
    if (row.id === ctx.user.id) issues.block('self', 'You cannot delete yourself');
  },
});
