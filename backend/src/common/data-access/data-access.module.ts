import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataAccessService } from './data-access.service';
import { DriverModel, CustomerModel, CarrierModel } from '../../database/models';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([DriverModel, CustomerModel, CarrierModel])],
  providers: [DataAccessService],
  exports: [DataAccessService],
})
export class DataAccessModule {}
