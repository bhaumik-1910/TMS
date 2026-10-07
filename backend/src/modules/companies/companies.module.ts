import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AclModule } from '../acl/acl.module.js';
import { Branch } from '../branches/branch.model.js';
import { PlatformModule } from '../platform/platform.module.js';
import { UserBranch } from '../users/user-branch.model.js';
import { User } from '../users/user.model.js';
import { Company } from './company.model.js';
import { CompanyProvisioner } from './company.provisioner.js';

import { CompaniesController } from './companies.controller.js';
import { TenantRouting } from '../../framework/tenancy/control/tenant-routing.model.js';

@Module({
  imports: [SequelizeModule.forFeature([Company, Branch, User, UserBranch, TenantRouting]), AclModule, PlatformModule],
  controllers: [CompaniesController],
  providers: [CompanyProvisioner],
  exports: [CompanyProvisioner],
})
export class CompaniesModule {}
