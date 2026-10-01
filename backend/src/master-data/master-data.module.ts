import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';
import {
  LocationModel,
  LocationTypeModel,
  VehicleTypeModel,
  CargoTypeModel,
  PackageTypeModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LocationModel,
      LocationTypeModel,
      VehicleTypeModel,
      CargoTypeModel,
      PackageTypeModel,
    ]),
  ],
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
