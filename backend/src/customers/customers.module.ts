import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerModel } from '../database/models';

@Module({
  imports: [SequelizeModule.forFeature([CustomerModel])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
