import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { BranchModel } from '../database/models/foundation/branch.model';
import { DocumentSequenceModel } from '../database/models/foundation/document-sequence.model';
import { PeriodLockModel } from '../database/models/foundation/period-lock.model';
import { CompanySettingModel } from '../database/models/foundation/company-setting.model';
import { EntityEventModel } from '../database/models/foundation/entity-event.model';
import { ExceptionModel } from '../database/models/foundation/exception.model';
import { UserBranchModel } from '../database/models/foundation/user-branch.model';
import { BillingInvoiceModel, PurchaseBillModel, SettlementModel } from '../database/models';

import { DocumentSequenceService } from './document-sequences/document-sequence.service';
import { PeriodLockService } from './period-locks/period-lock.service';
import { CompanySettingsService } from './company-settings/company-settings.service';
import { BranchesService } from './branches/branches.service';
import { EntityEventService } from './entity-events/entity-event.service';
import { ExceptionsService } from './exceptions/exceptions.service';
import { ErpSyncService } from './erp/erp-sync.service';
import { FoundationController } from './foundation.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      BranchModel,
      DocumentSequenceModel,
      PeriodLockModel,
      CompanySettingModel,
      EntityEventModel,
      ExceptionModel,
      UserBranchModel,
      BillingInvoiceModel,
      PurchaseBillModel,
      SettlementModel,
    ]),
  ],
  controllers: [FoundationController],
  providers: [
    DocumentSequenceService,
    PeriodLockService,
    CompanySettingsService,
    BranchesService,
    EntityEventService,
    ExceptionsService,
    ErpSyncService,
  ],
  exports: [
    DocumentSequenceService,
    PeriodLockService,
    CompanySettingsService,
    BranchesService,
    EntityEventService,
    ExceptionsService,
    ErpSyncService,
  ],
})
export class FoundationModule {}
