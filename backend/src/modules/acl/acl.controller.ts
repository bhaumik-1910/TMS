import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { PermissionCatalogService } from '../../framework/acl/permission-catalog.service.js';
import { TenantDb } from '../../framework/tenancy/tenant-db.js';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { Ctx, RequirePermission } from '../../framework/auth/decorators.js';
import { crudController } from '../../framework/crud/crud-controller.js';
import { fieldError } from '../../framework/errors.js';
import { CreateRoleDto, ReplacePermissionsDto, UpdateRoleDto } from './dto/role.dto.js';
import { RolePermissionsService } from './role-permissions.service.js';
import { RolesService } from './roles.service.js';

/** The permission catalog, grouped for the role matrix. */
@Controller(['permissions', 'api/permissions', 'api/v1/permissions'])
export class PermissionsController {
  constructor(private readonly catalog: PermissionCatalogService) {}

  @Get()
  @RequirePermission('role', 'view')
  list() {
    return this.catalog.grouped();
  }
}

@Controller(['roles', 'api/roles', 'api/v1/roles'])
export class RolesController extends crudController({
  resource: 'role',
  service: RolesService,
  create: CreateRoleDto,
  update: UpdateRoleDto,
}) {
  constructor(
    private readonly grants: RolePermissionsService,
    private readonly db: TenantDb,
  ) {
    super();
  }

  @Put(':id/permissions')
  @RequirePermission('role', 'update')
  async replacePermissions(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number, @Body() dto: ReplacePermissionsDto) {
    await this.db.tx(async (t) => {
      const role = await this.service.findOne(ctx, id, t, true);
      if (role.isSystem) throw fieldError('permissions', 'System role always has every permission');
      await this.grants.replace(role, dto.items, t);
    });
    return this.service.get(ctx, id);
  }
}
