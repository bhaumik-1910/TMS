import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  InvoiceModel,
  CarrierModel,
  CustomerModel,
  DriverModel,
  LocationModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransportOrderModel,
      ShipmentModel,
      VehicleModel,
      InvoiceModel,
      CarrierModel,
      CustomerModel,
      DriverModel,
      LocationModel,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
