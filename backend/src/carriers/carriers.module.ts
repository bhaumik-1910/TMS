import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CarriersService } from './carriers.service';
import { CarriersController } from './carriers.controller';
import {
  CarrierModel,
  CarrierContractModel,
  CarrierRateModel,
  CarrierDocumentModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CarrierModel,
      CarrierContractModel,
      CarrierRateModel,
      CarrierDocumentModel,
    ]),
  ],
  controllers: [CarriersController],
  providers: [CarriersService],
  exports: [CarriersService],
})
export class CarriersModule {}
