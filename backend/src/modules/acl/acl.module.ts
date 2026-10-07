import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from '../../framework/acl/permission.model.js';
import { RolePermission } from '../../framework/acl/role-permission.model.js';
import { Role } from '../../framework/acl/role.model.js';
import { UserPermissionOverride } from '../../framework/acl/user-permission-override.model.js';
import { PermissionsController, RolesController } from './acl.controller.js';
import { RolePermissionsService } from './role-permissions.service.js';
import { RolesService } from './roles.service.js';

/** TMS side of access control: role management and the default roles. The ACL core is in `framework/acl`. */
@Module({
  imports: [SequelizeModule.forFeature([Permission, Role, RolePermission, UserPermissionOverride])],
  controllers: [PermissionsController, RolesController],
  providers: [RolePermissionsService, RolesService],
  exports: [RolePermissionsService, RolesService],
})
export class AclModule {}
