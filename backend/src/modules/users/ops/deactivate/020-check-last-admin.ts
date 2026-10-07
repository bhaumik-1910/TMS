import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { Role } from '../../../../framework/acl/role.model.js';
import type { User } from '../../user.model.js';

/** The company must keep at least one active user with a system (admin) role. */
@Injectable()
export default class CheckLastAdmin implements Step<User> {
  constructor(@InjectModel(Role) private readonly roles: typeof Role) {}

  async check({ row, t, count, issues }: OpContext<User>): Promise<void> {
    const role = row.roleId ? await this.roles.findByPk(row.roleId, { transaction: t }) : null;
    if (!role?.isSystem) return;
    const others = await count(`users WHERE role_id = :roleId AND status = 'active' AND id <> :id`, { roleId: role.id, id: row.id });
    if (others === 0) issues.block('last_admin', `This is the only active ${role.name} user`);
  }
}
