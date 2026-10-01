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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const data_access_service_1 = require("../common/data-access/data-access.service");
const models_1 = require("../database/models");
let DashboardService = class DashboardService {
    constructor(orderModel, shipmentModel, vehicleModel, invoiceModel, auditLogModel, dataAccess) {
        this.orderModel = orderModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.invoiceModel = invoiceModel;
        this.auditLogModel = auditLogModel;
        this.dataAccess = dataAccess;
    }
    async getOverview(user, orgContext) {
        const shipmentWhere = await this.dataAccess.getShipmentWhere(user, { orgContext });
        const vehicleWhere = this.dataAccess.getVehicleWhere(user, orgContext);
        const orgId = this.dataAccess.resolveOrganizationId(user, orgContext);
        const shipmentInclude = shipmentWhere['$transportOrder.organizationId$']
            ? [
                {
                    model: models_1.TransportOrderModel,
                    attributes: [],
                    required: true,
                },
            ]
            : [];
        const [totalOrders, activeShipments, deliveredShipments, totalVehicles, inTransitVehicles] = await Promise.all([
            this.orderModel.count({
                where: orgId ? { organizationId: orgId } : {},
            }),
            this.shipmentModel.count({
                where: { ...shipmentWhere, status: { [sequelize_2.Op.in]: ['ASSIGNED', 'DISPATCHED', 'IN_TRANSIT'] } },
                include: shipmentInclude,
                distinct: true,
                col: 'id',
            }),
            this.shipmentModel.count({
                where: { ...shipmentWhere, status: 'DELIVERED' },
                include: shipmentInclude,
                distinct: true,
                col: 'id',
            }),
            this.vehicleModel.count({ where: vehicleWhere }),
            this.vehicleModel.count({
                where: { ...vehicleWhere, status: 'IN_TRANSIT' },
            }),
        ]);
        const fleetUtilization = totalVehicles > 0 ? Math.round((inTransitVehicles / totalVehicles) * 100) : 0;
        let totalRevenue = 0;
        const canViewFinance = user.roles?.includes('SUPER_ADMIN') ||
            user.roles?.includes('FINANCE_MANAGER') ||
            user.permissions?.includes('*') ||
            user.permissions?.includes('billing:view');
        if (canViewFinance) {
            const invoiceWhere = await this.dataAccess.getInvoiceWhere(user, orgContext);
            const invoices = await this.invoiceModel.findAll({
                where: invoiceWhere,
                attributes: ['totalAmount'],
            });
            totalRevenue = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
        }
        return {
            kpis: {
                totalOrders,
                activeShipments,
                deliveredShipments,
                otdPercent: 95.2,
                totalVehicles,
                inTransitVehicles,
                fleetUtilization,
                totalRevenue: canViewFinance ? totalRevenue : undefined,
            },
            scope: this.dataAccess.resolveScope(user, 'dashboard:view'),
            organizationContext: this.dataAccess.resolveOrganizationId(user, orgContext) || 'SYSTEM',
        };
    }
    async getShipments(user, orgContext, limit = 6) {
        const where = await this.dataAccess.getShipmentWhere(user, { orgContext });
        const shipments = await this.shipmentModel.findAll({
            where,
            limit,
            order: [['createdAt', 'DESC']],
            include: [
                { model: models_1.CustomerModel, required: false },
                { model: models_1.VehicleModel, required: false },
                { model: models_1.DriverModel, required: false },
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                    ],
                },
            ],
        });
        return shipments.map((s) => this.dataAccess.sanitizeShipment(s.get({ plain: true }), user));
    }
    async getFleet(user, orgContext) {
        const where = this.dataAccess.getVehicleWhere(user, orgContext);
        const [total, inTransit, available, maintenance] = await Promise.all([
            this.vehicleModel.count({ where }),
            this.vehicleModel.count({ where: { ...where, status: 'IN_TRANSIT' } }),
            this.vehicleModel.count({ where: { ...where, status: 'AVAILABLE' } }),
            this.vehicleModel.count({ where: { ...where, status: { [sequelize_2.Op.in]: ['MAINTENANCE', 'OUT_OF_SERVICE'] } } }),
        ]);
        return { total, inTransit, available, maintenance };
    }
    async getExceptions(user, orgContext) {
        return [
            {
                id: 'exc-101',
                severity: 'CRITICAL',
                type: 'Route Deviation',
                asset: 'TRK-101',
                message: 'Vehicle diverged 6.4 km from scheduled interstate corridor.',
                time: '3m ago',
            },
            {
                id: 'exc-102',
                severity: 'HIGH',
                type: 'Dwell Timeout',
                asset: 'TRK-104',
                message: 'Consignee receiver unloading bay dwell exceeded 90-minute limit.',
                time: '18m ago',
            },
            {
                id: 'exc-103',
                severity: 'MEDIUM',
                type: 'Telematics Check',
                asset: 'TRK-102',
                message: 'Tire temperature sensor alert on drive axle 2.',
                time: '45m ago',
            },
        ];
    }
    async getFinancial(user, orgContext) {
        const canViewFinance = user.roles?.includes('SUPER_ADMIN') ||
            user.roles?.includes('FINANCE_MANAGER') ||
            user.permissions?.includes('*') ||
            user.permissions?.includes('billing:view');
        if (!canViewFinance) {
            throw new common_1.ForbiddenException({
                statusCode: 403,
                code: 'FORBIDDEN',
                message: 'You do not have permission to access financial metrics',
            });
        }
        const where = await this.dataAccess.getInvoiceWhere(user, orgContext);
        const invoices = await this.invoiceModel.findAll({
            where,
            attributes: ['totalAmount', 'status'],
        });
        const totalInvoiced = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
        const paid = invoices.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + (i.totalAmount || 0), 0);
        const pending = invoices.filter((i) => i.status !== 'PAID').reduce((acc, i) => acc + (i.totalAmount || 0), 0);
        return {
            totalInvoiced,
            paidReceivables: paid,
            pendingClearance: pending,
            invoiceCount: invoices.length,
        };
    }
    async getActivity(user, orgContext) {
        const orgId = this.dataAccess.resolveOrganizationId(user, orgContext);
        const auditWhere = orgId ? { organizationId: orgId } : {};
        return this.auditLogModel.findAll({
            where: auditWhere,
            limit: 6,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'action', 'module', 'entityType', 'createdAt'],
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, data_access_service_1.DataAccessService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map