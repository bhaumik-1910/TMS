import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  UserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  UserRoleModel,
  AuditLogModel,
  OrganizationModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      RoleModel,
      PermissionModel,
      RolePermissionModel,
      UserRoleModel,
      AuditLogModel,
      OrganizationModel,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
