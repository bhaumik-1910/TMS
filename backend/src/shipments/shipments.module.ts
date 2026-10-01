import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import {
  ShipmentModel,
  ShipmentItemModel,
  TransportOrderModel,
  CustomerModel,
  CarrierModel,
  VehicleModel,
  DriverModel,
  RouteModel,
  RouteStopModel,
  TrackingEventModel,
  ProofOfDeliveryModel,
  DispatchModel,
  NotificationModel,
  AuditLogModel,
  LocationModel,
  InvoiceModel,
  ClaimModel,
  GeofenceEventModel,
  VehicleTypeModel,
  OrderItemModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ShipmentModel,
      ShipmentItemModel,
      TransportOrderModel,
      CustomerModel,
      CarrierModel,
      VehicleModel,
      DriverModel,
      RouteModel,
      RouteStopModel,
      TrackingEventModel,
      ProofOfDeliveryModel,
      DispatchModel,
      NotificationModel,
      AuditLogModel,
      LocationModel,
      InvoiceModel,
      ClaimModel,
      GeofenceEventModel,
      VehicleTypeModel,
      OrderItemModel,
    ]),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
