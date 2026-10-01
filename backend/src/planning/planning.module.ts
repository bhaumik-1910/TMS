import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import {
  TransportOrderModel,
  CustomerModel,
  LocationModel,
  OrderItemModel,
  VehicleModel,
  VehicleTypeModel,
  DriverAssignmentModel,
  DriverModel,
  ShipmentModel,
  LoadPlanModel,
  LoadPlanItemModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransportOrderModel,
      CustomerModel,
      LocationModel,
      OrderItemModel,
      VehicleModel,
      VehicleTypeModel,
      DriverAssignmentModel,
      DriverModel,
      ShipmentModel,
      LoadPlanModel,
      LoadPlanItemModel,
    ]),
  ],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}
