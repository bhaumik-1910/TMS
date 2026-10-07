import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AclService } from '../../framework/acl/acl.service.js';
import { Permission } from '../../framework/acl/permission.model.js';
import { UserPermissionOverride } from '../../framework/acl/user-permission-override.model.js';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { fieldErrors } from '../../framework/errors.js';
import { TenantDb } from '../../framework/tenancy/tenant-db.js';
import { RolePermissionsService } from '../acl/role-permissions.service.js';
import type { UserOverrideItemDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

/** Per-user grants and denies on top of the role. */
@Injectable()
export class UserOverridesService {
  constructor(
    @InjectModel(UserPermissionOverride) private readonly overrides: typeof UserPermissionOverride,
    @InjectModel(Permission) private readonly permissions: typeof Permission,
    private readonly db: TenantDb,
    private readonly users: UsersService,
    private readonly acl: AclService,
    private readonly grants: RolePermissionsService,
  ) {}

  async list(ctx: ReqCtx, userId: number) {
    await this.users.findOne(ctx, userId);
    const rows = await this.overrides.findAll({
      where: { userId },
      include: [{ model: Permission, attributes: ['code', 'label', 'groupName'] }],
      order: [['id', 'ASC']],
    });
    return rows.map((row) => ({ code: row.permission?.code, label: row.permission?.label, effect: row.effect, scope: row.scope, limits: row.limits ?? {} }));
  }

  async replace(ctx: ReqCtx, userId: number, items: UserOverrideItemDto[]) {
    const problems = this.grants.problems(items.filter((item) => item.effect === 'grant'));
    if (problems.length) throw fieldErrors({ items: problems });
    await this.db.tx(async (t) => {
      await this.users.findOne(ctx, userId, t, true);
      const codes = items.map((item) => item.code);
      const found = await this.permissions.findAll({ where: { code: { [Op.in]: codes } }, transaction: t });
      const ids = new Map(found.map((row) => [row.code, row.id as number]));
      const unknown = codes.find((code) => !ids.has(code));
      if (unknown) throw fieldErrors({ items: [`Unknown permission ${unknown}`] });
      await this.overrides.destroy({ where: { userId }, transaction: t });
      await this.overrides.bulkCreate(
        items.map((item) => ({
          companyId: ctx.user.companyId,
          userId,
          permissionId: ids.get(item.code),
          effect: item.effect,
          scope: item.scope,
          limits: item.limits ?? {},
        })),
        { transaction: t },
      );
    });
    this.acl.forgetUser(ctx.user.companyId, userId);
    return this.list(ctx, userId);
  }
}
