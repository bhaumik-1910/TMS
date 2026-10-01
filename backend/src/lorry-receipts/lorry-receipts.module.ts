import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LorryReceiptsService } from './lorry-receipts.service';
import { LorryReceiptsController } from './lorry-receipts.controller';
import {
  LorryReceiptModel,
  ShipmentModel,
  CustomerModel,
  VehicleModel,
  DriverModel,
  CarrierModel,
  TransportOrderModel,
  LocationModel,
  ShipmentItemModel,
  DispatchModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LorryReceiptModel,
      ShipmentModel,
      CustomerModel,
      VehicleModel,
      DriverModel,
      CarrierModel,
      TransportOrderModel,
      LocationModel,
      ShipmentItemModel,
      DispatchModel,
    ]),
  ],
  controllers: [LorryReceiptsController],
  providers: [LorryReceiptsService],
  exports: [LorryReceiptsService],
})
export class LorryReceiptsModule {}
