import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
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
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
