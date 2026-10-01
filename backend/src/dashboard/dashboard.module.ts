import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  InvoiceModel,
  AuditLogModel,
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
      AuditLogModel,
      CustomerModel,
      DriverModel,
      LocationModel,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
