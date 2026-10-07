import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyLicense } from './company-license.model.js';
import { License } from './license.model.js';
import { MembershipService } from './memberships.service.js';
import { PlatformCompany } from './platform-company.model.js';
import { PlatformUser } from './platform-user.model.js';
import { RefreshToken } from './refresh-token.model.js';
import { UserCompany } from './user-company.model.js';

/** The control plane of TMS: identities, companies, memberships, plans and sessions (schema `platform`). */
export const PLATFORM_MODELS = [PlatformUser, PlatformCompany, UserCompany, RefreshToken, License, CompanyLicense];

@Module({
  imports: [SequelizeModule.forFeature(PLATFORM_MODELS)],
  providers: [MembershipService],
  exports: [MembershipService, SequelizeModule],
})
export class PlatformModule {}
