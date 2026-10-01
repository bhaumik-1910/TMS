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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
let AnalyticsService = class AnalyticsService {
    constructor(orderModel, shipmentModel, vehicleModel, invoiceModel, carrierModel) {
        this.orderModel = orderModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.invoiceModel = invoiceModel;
        this.carrierModel = carrierModel;
    }
    async getRoleDashboard(role, organizationId, userId) {
        const isSystem = !organizationId || organizationId === 'SYSTEM';
        const orderWhere = {};
        if (!isSystem)
            orderWhere.organizationId = organizationId;
        const shipmentWhere = {};
        if (!isSystem)
            shipmentWhere['$transportOrder.organizationId$'] = organizationId;
        const vehicleWhere = {};
        if (!isSystem)
            vehicleWhere.organizationId = organizationId;
        const invoiceWhere = {};
        if (!isSystem)
            invoiceWhere.organizationId = organizationId;
        const totalOrders = await this.orderModel.count({ where: orderWhere });
        const activeShipments = await this.shipmentModel.count({
            where: {
                ...shipmentWhere,
                status: { [sequelize_2.Op.in]: ['PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT'] },
            },
            include: !isSystem ? [{ model: models_1.TransportOrderModel, required: true }] : [],
        });
        const deliveredShipments = await this.shipmentModel.count({
            where: {
                ...shipmentWhere,
                status: 'DELIVERED',
            },
            include: !isSystem ? [{ model: models_1.TransportOrderModel, required: true }] : [],
        });
        const totalVehicles = await this.vehicleModel.count({ where: vehicleWhere });
        const inTransitVehicles = await this.vehicleModel.count({
            where: { ...vehicleWhere, status: 'IN_TRANSIT' },
        });
        const fleetUtilization = totalVehicles > 0 ? Math.round((inTransitVehicles / totalVehicles) * 100) : 0;
        const otdPercent = 94.6;
        const invoices = await this.invoiceModel.findAll({
            where: invoiceWhere,
            attributes: ['totalAmount', 'status'],
        });
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const pendingRevenue = invoices
            .filter((inv) => inv.status === 'UNPAID' || inv.status === 'ISSUED')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const monthlyTrends = [
            { month: 'Jan', orders: 120, delivered: 114, spend: 34200 },
            { month: 'Feb', orders: 145, delivered: 139, spend: 41800 },
            { month: 'Mar', orders: 160, delivered: 152, spend: 48900 },
            { month: 'Apr', orders: 175, delivered: 168, spend: 52400 },
            { month: 'May', orders: 190, delivered: 183, spend: 58100 },
            { month: 'Jun', orders: 210, delivered: 199, spend: 64700 },
        ];
        const carrierWhere = {};
        if (!isSystem)
            carrierWhere.organizationId = organizationId;
        const carriers = await this.carrierModel.findAll({
            where: carrierWhere,
            attributes: ['companyName', 'rating'],
            limit: 5,
        });
        const recentShipments = await this.shipmentModel.findAll({
            where: shipmentWhere,
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
            limit: 6,
            order: [['createdAt', 'DESC']],
        });
        return {
            kpis: {
                totalOrders,
                activeShipments,
                deliveredShipments,
                otdPercent,
                totalVehicles,
                inTransitVehicles,
                fleetUtilization,
                totalRevenue: Math.round(totalRevenue),
                pendingRevenue: Math.round(pendingRevenue),
            },
            monthlyTrends,
            carrierRankings: carriers.map((c) => ({
                companyName: c.companyName,
                rating: c.rating,
                _count: { shipments: 0 },
            })),
            recentShipments,
            roleView: role,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.CarrierModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map