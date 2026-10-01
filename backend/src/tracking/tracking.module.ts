import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';
import {
  ShipmentModel,
  VehicleModel,
  TransportOrderModel,
  LocationModel,
  TrackingEventModel,
  GeofenceModel,
  GeofenceEventModel,
  CustomerModel,
  DriverModel,
  RouteModel,
  VehicleTypeModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ShipmentModel,
      VehicleModel,
      TransportOrderModel,
      LocationModel,
      TrackingEventModel,
      GeofenceModel,
      GeofenceEventModel,
      CustomerModel,
      DriverModel,
      RouteModel,
      VehicleTypeModel,
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
