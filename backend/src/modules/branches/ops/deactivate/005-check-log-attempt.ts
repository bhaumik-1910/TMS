import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EntityEvent } from '../../../../framework/audit/entity-event.model.js';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Transaction example: `c.separate` writes in its OWN transaction, committed on the spot. The
 * attempt stays in the branch history even when a later check blocks and the operation rolls back.
 * (Checks never write to `c.t`; a separate transaction is the way to keep a record of a refusal.)
 */
@Injectable()
export default class LogAttempt implements Step<Branch, DeactivateState> {
  constructor(@InjectModel(EntityEvent) private readonly events: typeof EntityEvent) {}

  async check({ separate, user, row }: OpContext<Branch, DeactivateState>): Promise<void> {
    await separate((t) =>
      this.events.create(
        { companyId: user.companyId, entityType: 'Branch', entityId: row.id as number, event: 'attempt:deactivate', userId: user.id, data: { by: user.name } },
        { transaction: t },
      ),
    );
  }
}
