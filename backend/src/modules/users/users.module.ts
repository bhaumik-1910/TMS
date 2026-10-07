import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from '../branches/branch.model.js';
import { AclModule } from '../acl/acl.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { UserBranch } from './user-branch.model.js';
import { User } from './user.model.js';
import { UserOverridesService } from './user-overrides.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [SequelizeModule.forFeature([User, UserBranch, Branch]), AclModule, PlatformModule],
  controllers: [UsersController],
  providers: [UsersService, UserOverridesService],
  exports: [UsersService],
})
export class UsersModule {}
