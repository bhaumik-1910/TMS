import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import {
  TransportOrderModel,
  OrderItemModel,
  CustomerModel,
  LocationModel,
  ShipmentModel,
  ShipmentItemModel,
  CarrierModel,
  VehicleModel,
  DriverModel,
  DispatchModel,
  UserModel,
  AuditLogModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransportOrderModel,
      OrderItemModel,
      CustomerModel,
      LocationModel,
      ShipmentModel,
      ShipmentItemModel,
      CarrierModel,
      VehicleModel,
      DriverModel,
      DispatchModel,
      UserModel,
      AuditLogModel,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
