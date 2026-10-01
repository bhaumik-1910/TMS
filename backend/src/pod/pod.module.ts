import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PodService } from './pod.service';
import { PodController } from './pod.controller';
import {
  ProofOfDeliveryModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  InvoiceModel,
  InvoiceItemModel,
  NotificationModel,
  CustomerModel,
  TransportOrderModel,
  LocationModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProofOfDeliveryModel,
      ShipmentModel,
      VehicleModel,
      DriverModel,
      InvoiceModel,
      InvoiceItemModel,
      NotificationModel,
      CustomerModel,
      TransportOrderModel,
      LocationModel,
    ]),
  ],
  controllers: [PodController],
  providers: [PodService],
  exports: [PodService],
})
export class PodModule {}
