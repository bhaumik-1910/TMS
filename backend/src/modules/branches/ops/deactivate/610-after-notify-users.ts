import { Injectable } from '@nestjs/common';
import { Notifier } from '../../../../framework/notify/notifier.service.js';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { UsersService } from '../../../users/users.service.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Shared-service example. `Notifier` comes from the global CoreModule, injected like any provider.
 * `c.get(UsersService)` reaches another entity's service without importing its module, and
 * `c.can()` asks whether this caller may see users at all, with which scope.
 */
@Injectable()
export default class NotifyBranchUsers implements Step<Branch, DeactivateState> {
  constructor(private readonly notifier: Notifier) {}

  async after(c: OpContext<Branch, DeactivateState>): Promise<void> {
    const scope = await c.can('user.view');
    if (!scope) return;

    const { rows } = await c.get(UsersService).list({ ...c.ctx, scope }, { filters: JSON.stringify({ 'branch.name': c.row.name }), limit: 20 });
    const userIds = rows.map((u) => u.id as number);
    if (userIds.length === 0) return;
    c.afterCommit(() => this.notifier.send(c.user.companyId, { userIds, title: `${c.row.name} was deactivated by ${c.state.deactivatedBy}` }));
  }
}
