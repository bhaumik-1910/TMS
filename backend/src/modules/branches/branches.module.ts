import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EntityEvent } from '../../framework/audit/entity-event.model.js';
import { AclModule } from '../acl/acl.module.js';
import { User } from '../users/user.model.js';
import { Branch } from './branch.model.js';
import { BranchesController } from './branches.controller.js';
import { BranchesService } from './branches.service.js';

@Module({
  // Models the step classes in ops/ inject. Services of CoreModule need no import.
  imports: [SequelizeModule.forFeature([Branch, User, EntityEvent]), AclModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
