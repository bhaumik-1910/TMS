import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import {
  ShipmentModel,
  TransportOrderModel,
  CustomerModel,
  DriverModel,
  VehicleModel,
  CarrierModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
  DispatchModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ShipmentModel,
      TransportOrderModel,
      CustomerModel,
      DriverModel,
      VehicleModel,
      CarrierModel,
      UserModel,
      AuditLogModel,
      NotificationModel,
      DispatchModel,
    ]),
  ],
  providers: [AssignmentService],
  controllers: [AssignmentController],
  exports: [AssignmentService],
})
export class AssignmentModule {}
