import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { TyreEventsService } from './tyre-events.service';
import { TyreEventsController } from './tyre-events.controller';
import { JobCardsService } from './job-cards.service';
import { JobCardsController } from './job-cards.controller';
import {
  VehicleModel,
  VehicleTypeModel,
  VehicleMaintenanceModel,
  VehicleDocumentModel,
  DriverModel,
  DriverAssignmentModel,
  FuelEntryModel,
  TyreEventModel,
  TyreInventoryModel,
  JobCardModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VehicleModel,
      VehicleTypeModel,
      VehicleMaintenanceModel,
      VehicleDocumentModel,
      DriverModel,
      DriverAssignmentModel,
      FuelEntryModel,
      TyreEventModel,
      TyreInventoryModel,
      JobCardModel,
    ]),
  ],
  controllers: [VehiclesController, FuelController, TyreEventsController, JobCardsController],
  providers: [VehiclesService, FuelService, TyreEventsService, JobCardsService],
  exports: [VehiclesService, FuelService, TyreEventsService, JobCardsService],
})
export class VehiclesModule {}
