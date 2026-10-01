import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import {
  ShipmentModel,
  TransportOrderModel,
  CustomerModel,
  VehicleModel,
  DriverModel,
  LocationModel,
  CarrierModel,
  DocumentModel,
  DocumentTypeModel,
  VehicleTypeModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ShipmentModel,
      TransportOrderModel,
      CustomerModel,
      VehicleModel,
      DriverModel,
      LocationModel,
      CarrierModel,
      DocumentModel,
      DocumentTypeModel,
      VehicleTypeModel,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
