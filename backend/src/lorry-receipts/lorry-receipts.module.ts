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

import { FoundationModule } from '../foundation/foundation.module';
import { OpsModule } from '../framework/ops/ops.module';

@Module({
  imports: [
    FoundationModule,
    OpsModule,
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
