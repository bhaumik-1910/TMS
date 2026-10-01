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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
let PlanningService = class PlanningService {
    constructor(orderModel, vehicleModel, shipmentModel, loadPlanModel) {
        this.orderModel = orderModel;
        this.vehicleModel = vehicleModel;
        this.shipmentModel = shipmentModel;
        this.loadPlanModel = loadPlanModel;
    }
    async getPlannerWorkspace(organizationId) {
        const orderWhere = {
            status: { [sequelize_2.Op.in]: ['SUBMITTED', 'CONFIRMED'] },
        };
        if (organizationId && organizationId !== 'SYSTEM') {
            orderWhere.organizationId = organizationId;
        }
        const unplannedOrders = await this.orderModel.findAll({
            where: orderWhere,
            include: [
                { model: models_1.CustomerModel, required: false },
                { model: models_1.LocationModel, as: 'originLocation', required: false },
                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                { model: models_1.OrderItemModel, required: false },
            ],
            order: [['requestedPickupDate', 'ASC']],
        });
        const vehicleWhere = { status: 'AVAILABLE' };
        if (organizationId && organizationId !== 'SYSTEM') {
            vehicleWhere.organizationId = organizationId;
        }
        const availableVehicles = await this.vehicleModel.findAll({
            where: vehicleWhere,
            include: [
                { model: models_1.VehicleTypeModel, required: false },
                {
                    model: models_1.DriverAssignmentModel,
                    required: false,
                    where: { status: 'ACTIVE' },
                    include: [{ model: models_1.DriverModel, required: false }],
                },
            ],
        });
        const shipmentWhere = { status: 'PLANNED' };
        if (organizationId && organizationId !== 'SYSTEM') {
            shipmentWhere['$transportOrder.organizationId$'] = organizationId;
        }
        const plannedShipments = await this.shipmentModel.findAll({
            where: shipmentWhere,
            include: [
                { model: models_1.CustomerModel, required: false },
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
        return {
            unplannedOrders: unplannedOrders.map((o) => {
                const plain = o.get({ plain: true });
                return { ...plain, orderItems: plain.items || [] };
            }),
            availableVehicles,
            plannedShipments,
        };
    }
    async optimizeLoad(organizationId, vehicleId, orderIds) {
        const vehicle = await this.vehicleModel.findByPk(vehicleId, {
            include: [{ model: models_1.VehicleTypeModel, required: false }],
        });
        if (!vehicle)
            throw new common_1.BadRequestException('Vehicle not found');
        const orders = await this.orderModel.findAll({
            where: { id: { [sequelize_2.Op.in]: orderIds } },
        });
        const totalWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0);
        const totalVolume = orders.reduce((sum, o) => sum + (o.totalVolume || 0), 0);
        const capWeight = vehicle.capacityWeight || 25000.0;
        const capVol = vehicle.capacityVolume || 80.0;
        const weightUtilization = Math.round((totalWeight / capWeight) * 100);
        const volumeUtilization = Math.round((totalVolume / capVol) * 100);
        if (totalWeight > capWeight) {
            throw new common_1.BadRequestException(`Load exceeds vehicle weight capacity: ${totalWeight}kg > ${capWeight}kg (${weightUtilization}%)`);
        }
        if (totalVolume > capVol) {
            throw new common_1.BadRequestException(`Load exceeds vehicle volume capacity: ${totalVolume}m³ > ${capVol}m³ (${volumeUtilization}%)`);
        }
        const planNumber = `LP-${Date.now().toString().slice(-6)}`;
        const plan = await this.loadPlanModel.create({
            planNumber,
            vehicleId,
            plannedWeightKg: totalWeight,
            plannedVolumeCbm: totalVolume,
            weightUtilizationPercent: weightUtilization,
            volumeUtilizationPercent: volumeUtilization,
            status: 'OPTIMIZED',
        });
        return {
            loadPlan: plan,
            vehicle: {
                id: vehicle.id,
                number: vehicle.vehicleNumber,
                capacityWeight: capWeight,
                capacityVolume: capVol,
            },
            metrics: {
                totalWeight,
                totalVolume,
                weightUtilization,
                volumeUtilization,
                ordersCount: orders.length,
            },
        };
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.LoadPlanModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], PlanningService);
//# sourceMappingURL=planning.service.js.map