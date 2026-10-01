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
} from '../database/models';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
