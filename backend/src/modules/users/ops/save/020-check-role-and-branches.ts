import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { Role } from '../../../../framework/acl/role.model.js';
import { Branch } from '../../../branches/branch.model.js';
import type { CreateUserDto, UpdateUserDto } from '../../dto/user.dto.js';
import type { User } from '../../user.model.js';

type Dto = CreateUserDto | UpdateUserDto;

/** The role and branches a user is given must belong to the same company. */
@Injectable()
export default class CheckRoleAndBranches implements Step<User, object, Dto> {
  constructor(
    @InjectModel(Role) private readonly roles: typeof Role,
    @InjectModel(Branch) private readonly branches: typeof Branch,
  ) {}

  async check({ ctx, dto, t, issues }: OpContext<User, object, Dto>): Promise<void> {
    const companyId = ctx.user.companyId;
    if (dto.roleId && !(await this.roles.count({ where: { id: dto.roleId, companyId }, transaction: t }))) {
      issues.field('roleId', 'Role not found');
    }
    const branchIds = [...new Set([...(dto.branchIds ?? []), ...(dto.branchId ? [dto.branchId] : [])])];
    if (branchIds.length) {
      const found = await this.branches.count({ where: { id: { [Op.in]: branchIds }, companyId }, transaction: t });
      if (found !== branchIds.length) issues.field('branchIds', 'Branch not found');
    }
  }
}
