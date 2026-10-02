import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { DriverAdvancesService } from './driver-advances.service';
import { DriverAdvancesController } from './driver-advances.controller';
import {
  DispatchModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  CarrierModel,
  TransportOrderModel,
  LocationModel,
  CustomerModel,
  TripExpenseModel,
  AuditLogModel,
  DriverAdvanceModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DispatchModel,
      ShipmentModel,
      VehicleModel,
      DriverModel,
      CarrierModel,
      TransportOrderModel,
      LocationModel,
      CustomerModel,
      TripExpenseModel,
      AuditLogModel,
      DriverAdvanceModel,
    ]),
  ],
  controllers: [DispatchController, DriverAdvancesController],
  providers: [DispatchService, DriverAdvancesService],
  exports: [DispatchService, DriverAdvancesService],
})
export class DispatchModule {}
