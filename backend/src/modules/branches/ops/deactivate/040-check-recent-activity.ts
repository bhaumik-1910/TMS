import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { User } from '../../../users/user.model.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

/**
 * Service-injection example: a class step receives Nest providers through its constructor (here a
 * model; globally available services such as Notifier or DocumentNumberService work the same way,
 * with no change to BranchesModule). Queries pass `{ transaction: c.t }` to stay in the operation.
 */
@Injectable()
export default class CheckRecentActivity implements Step<Branch, DeactivateState> {
  constructor(@InjectModel(User) private readonly users: typeof User) {}

  async check({ row, t, state }: OpContext<Branch, DeactivateState>): Promise<void> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    state.recentLogins = await this.users.count({ where: { branchId: row.id as number, lastLoginAt: { [Op.gt]: since } }, transaction: t });
  }
}
