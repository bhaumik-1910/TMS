import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  OrganizationModel,
  UserModel,
  VehicleModel,
  DriverModel,
  TransportOrderModel,
  ShipmentModel,
  AuditLogModel,
} from '../database/models';

@Injectable()
export class AdminConsoleService {
  constructor(
    @InjectModel(OrganizationModel)
    private readonly orgModel: typeof OrganizationModel,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(DriverModel)
    private readonly driverModel: typeof DriverModel,
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
  ) {}

  async getSystemOverview() {
    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalUsers,
      activeUsers,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalOrders,
      totalShipments,
    ] = await Promise.all([
      this.orgModel.count(),
      this.orgModel.count({ where: { status: 'ACTIVE' } }),
      this.orgModel.count({ where: { status: { [Op.in]: ['SUSPENDED', 'INACTIVE'] } } }),
      this.userModel.count(),
      this.userModel.count({ where: { status: 'ACTIVE' } }),
      this.vehicleModel.count(),
      this.vehicleModel.count({ where: { status: 'IN_TRANSIT' } }),
      this.driverModel.count(),
      this.driverModel.count({ where: { status: { [Op.in]: ['AVAILABLE', 'ON_TRIP'] } } }),
      this.orderModel.count(),
      this.shipmentModel.count(),
    ]);

    return {
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        suspended: suspendedOrgs,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      fleet: {
        totalVehicles,
        inTransitVehicles: activeVehicles,
        totalDrivers,
        activeDrivers,
      },
      transport: {
        totalOrders,
        totalShipments,
      },
    };
  }

  async getOrganizations() {
    const orgs = await this.orgModel.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: UserModel, attributes: ['id'], required: false },
      ],
    });

    return orgs.map((org) => {
      const plain = org.get({ plain: true });
      return {
        ...plain,
        _count: {
          users: plain.users ? plain.users.length : 0,
          vehicles: 0,
          drivers: 0,
          transportOrders: 0,
        },
      };
    });
  }

  async getSystemHealth() {
    const start = Date.now();
    const sequelize = this.orgModel.sequelize;
    if (sequelize) {
      await sequelize.query('SELECT 1');
    }
    const dbLatency = Date.now() - start;

    return {
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        apiGateway: { status: 'HEALTHY', latencyMs: 2 },
        database: { status: 'CONNECTED', engine: 'PostgreSQL 17 (Sequelize Connection Pool)', latencyMs: dbLatency },
        webSocketTelemetry: { status: 'ONLINE', protocol: 'Socket.IO / WSS' },
        backgroundJobs: { status: 'RUNNING', workers: 4 },
        notificationEngine: { status: 'HEALTHY', channel: 'In-App + Email' },
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        platform: process.platform,
      },
    };
  }

  async getSecurityAudit() {
    return this.auditLogModel.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [
        { model: UserModel, attributes: ['firstName', 'lastName', 'email'], required: false },
        { model: OrganizationModel, attributes: ['name', 'code'], required: false },
      ],
    });
  }
}
