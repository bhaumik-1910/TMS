import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WorkQueuesService } from './work-queues.service';
import { WorkQueuesController } from './work-queues.controller';
import { DataAccessModule } from '../common/data-access/data-access.module';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  CustomerModel,
  LocationModel,
  InvoiceModel,
  VehicleDocumentModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransportOrderModel,
      ShipmentModel,
      VehicleModel,
      DriverModel,
      CustomerModel,
      LocationModel,
      InvoiceModel,
      VehicleDocumentModel,
    ]),
    DataAccessModule,
  ],
  providers: [WorkQueuesService],
  controllers: [WorkQueuesController],
  exports: [WorkQueuesService],
})
export class WorkQueuesModule {}
