import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import type { CreateUserDto, UpdateUserDto } from '../../dto/user.dto.js';
import { UserBranch } from '../../user-branch.model.js';
import type { User } from '../../user.model.js';

type Dto = CreateUserDto | UpdateUserDto;

/** Keeps the branches a user may work in (`user_branches`) in step with the home branch and chosen branches. */
@Injectable()
export default class SyncBranchAccess implements Step<User, object, Dto> {
  constructor(@InjectModel(UserBranch) private readonly userBranches: typeof UserBranch) {}

  async after({ row, before, dto, t, user }: OpContext<User, object, Dto>): Promise<void> {
    if (before && !dto.branchIds && dto.branchId === undefined) return;
    const userId = row.id as number;

    const keep = new Set(dto.branchIds ?? []);
    if (row.branchId) keep.add(row.branchId);
    if (before && !dto.branchIds) {
      // Only the home branch changed: keep the extra branches the user already had.
      for (const link of await this.userBranches.findAll({ where: { userId }, transaction: t })) keep.add(link.branchId);
    }

    await this.userBranches.destroy({ where: { userId }, transaction: t });
    await this.userBranches.bulkCreate([...keep].map((branchId) => ({ companyId: user.companyId, userId, branchId })), { transaction: t });
  }
}
