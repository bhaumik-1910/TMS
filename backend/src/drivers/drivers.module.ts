import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import {
  DriverModel,
  DriverDocumentModel,
  DriverAssignmentModel,
  VehicleModel,
  DispatchModel,
  ShipmentModel,
  CustomerModel,
  TransportOrderModel,
  LocationModel,
  ShipmentItemModel,
  RouteModel,
  RouteStopModel,
  ProofOfDeliveryModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DriverModel,
      DriverDocumentModel,
      DriverAssignmentModel,
      VehicleModel,
      DispatchModel,
      ShipmentModel,
      CustomerModel,
      TransportOrderModel,
      LocationModel,
      ShipmentItemModel,
      RouteModel,
      RouteStopModel,
      ProofOfDeliveryModel,
    ]),
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
