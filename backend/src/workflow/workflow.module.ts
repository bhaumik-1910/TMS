import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import {
  TransportOrderModel,
  ShipmentModel,
  DispatchModel,
  CustomerModel,
  DriverModel,
  VehicleModel,
  CarrierModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransportOrderModel,
      ShipmentModel,
      DispatchModel,
      CustomerModel,
      DriverModel,
      VehicleModel,
      CarrierModel,
      UserModel,
      AuditLogModel,
      NotificationModel,
    ]),
  ],
  providers: [WorkflowService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
