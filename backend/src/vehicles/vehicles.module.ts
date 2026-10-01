import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import {
  VehicleModel,
  VehicleTypeModel,
  VehicleMaintenanceModel,
  VehicleDocumentModel,
  DriverModel,
  DriverAssignmentModel,
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
    ]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
