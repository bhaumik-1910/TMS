import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import {
  InvoiceModel,
  InvoiceItemModel,
  PaymentModel,
  CustomerModel,
  ShipmentModel,
  TransportOrderModel,
  LocationModel,
  ProofOfDeliveryModel,
  CarrierRateModel,
  ClaimModel,
  ClaimItemModel,
  CarrierModel,
  BillingInvoiceModel,
  PurchaseBillModel,
  SettlementModel,
} from '../database/models';

import { FoundationModule } from '../foundation/foundation.module';
import { OpsModule } from '../framework/ops/ops.module';

@Module({
  imports: [
    FoundationModule,
    OpsModule,
    SequelizeModule.forFeature([
      InvoiceModel,
      InvoiceItemModel,
      PaymentModel,
      CustomerModel,
      ShipmentModel,
      TransportOrderModel,
      LocationModel,
      ProofOfDeliveryModel,
      CarrierRateModel,
      ClaimModel,
      ClaimItemModel,
      CarrierModel,
      BillingInvoiceModel,
      PurchaseBillModel,
      SettlementModel,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
