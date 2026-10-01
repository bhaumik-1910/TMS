import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RouteModel, RouteStopModel, LocationModel, ShipmentModel } from '../database/models';

@Module({
  imports: [SequelizeModule.forFeature([RouteModel, RouteStopModel, LocationModel, ShipmentModel])],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
