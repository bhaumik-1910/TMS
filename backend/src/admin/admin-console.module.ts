import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminConsoleController } from './admin-console.controller';
import { AdminConsoleService } from './admin-console.service';
import {
  OrganizationModel,
  UserModel,
  VehicleModel,
  DriverModel,
  TransportOrderModel,
  ShipmentModel,
  AuditLogModel,
} from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      OrganizationModel,
      UserModel,
      VehicleModel,
      DriverModel,
      TransportOrderModel,
      ShipmentModel,
      AuditLogModel,
    ]),
  ],
  controllers: [AdminConsoleController],
  providers: [AdminConsoleService],
  exports: [AdminConsoleService],
})
export class AdminConsoleModule {}
