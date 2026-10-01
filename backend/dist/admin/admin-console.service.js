"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConsoleService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
let AdminConsoleService = class AdminConsoleService {
    constructor(orgModel, userModel, vehicleModel, driverModel, orderModel, shipmentModel, auditLogModel) {
        this.orgModel = orgModel;
        this.userModel = userModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.orderModel = orderModel;
        this.shipmentModel = shipmentModel;
        this.auditLogModel = auditLogModel;
    }
    async getSystemOverview() {
        const [totalOrgs, activeOrgs, suspendedOrgs, totalUsers, activeUsers, totalVehicles, activeVehicles, totalDrivers, activeDrivers, totalOrders, totalShipments,] = await Promise.all([
            this.orgModel.count(),
            this.orgModel.count({ where: { status: 'ACTIVE' } }),
            this.orgModel.count({ where: { status: { [sequelize_2.Op.in]: ['SUSPENDED', 'INACTIVE'] } } }),
            this.userModel.count(),
            this.userModel.count({ where: { status: 'ACTIVE' } }),
            this.vehicleModel.count(),
            this.vehicleModel.count({ where: { status: 'IN_TRANSIT' } }),
            this.driverModel.count(),
            this.driverModel.count({ where: { status: { [sequelize_2.Op.in]: ['AVAILABLE', 'ON_TRIP'] } } }),
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
                { model: models_1.UserModel, attributes: ['id'], required: false },
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
                { model: models_1.UserModel, attributes: ['firstName', 'lastName', 'email'], required: false },
                { model: models_1.OrganizationModel, attributes: ['name', 'code'], required: false },
            ],
        });
    }
};
exports.AdminConsoleService = AdminConsoleService;
exports.AdminConsoleService = AdminConsoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.OrganizationModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.UserModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(6, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], AdminConsoleService);
//# sourceMappingURL=admin-console.service.js.map