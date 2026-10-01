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
exports.DispatchService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let DispatchService = class DispatchService extends base_service_1.BaseSequelizeService {
    constructor(dispatchModel, shipmentModel, vehicleModel, driverModel, tripExpenseModel, auditLogModel) {
        super(dispatchModel);
        this.dispatchModel = dispatchModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.tripExpenseModel = tripExpenseModel;
        this.auditLogModel = auditLogModel;
    }
    async findAll(organizationId, status) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where['$shipment.transportOrder.organizationId$'] = organizationId;
        }
        if (status)
            where.status = status;
        return this.dispatchModel.findAll({
            where,
            include: [
                {
                    model: models_1.ShipmentModel,
                    required: false,
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
                },
                { model: models_1.VehicleModel, required: false },
                { model: models_1.DriverModel, required: false },
                { model: models_1.CarrierModel, required: false },
            ],
            order: [['dispatchTime', 'DESC']],
        });
    }
    async getDispatchBoard(organizationId) {
        const dispatches = await this.findAll(organizationId);
        const columns = {
            PLANNED: [],
            ASSIGNED: [],
            DISPATCHED: [],
            IN_TRANSIT: [],
            DELIVERY: [],
            COMPLETED: [],
        };
        dispatches.forEach((d) => {
            const col = columns[d.status] || columns.DISPATCHED;
            col.push(d);
        });
        return columns;
    }
    async create(organizationId, data, userId) {
        return this.withTransaction(async (transaction) => {
            const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
                include: [{ model: models_1.TransportOrderModel }],
                transaction,
            });
            if (!shipment)
                throw new common_1.NotFoundException('Shipment not found');
            if (data.vehicleId) {
                const vehicle = await this.vehicleModel.findByPk(data.vehicleId, { transaction });
                if (vehicle && vehicle.capacityWeight < (shipment.totalWeight || 0)) {
                    throw new common_1.BadRequestException('Vehicle capacity exceeded');
                }
                await this.vehicleModel.update({ status: 'ASSIGNED' }, { where: { id: data.vehicleId }, transaction });
            }
            if (data.driverId) {
                await this.driverModel.update({ status: 'ON_TRIP' }, { where: { id: data.driverId }, transaction });
            }
            await this.shipmentModel.update({
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                carrierId: data.carrierId || null,
                status: 'DISPATCHED',
            }, { where: { id: data.shipmentId }, transaction });
            const dispatchNumber = `DSP-${Date.now().toString().slice(-6)}`;
            const dispatch = await this.dispatchModel.create({
                dispatchNumber,
                shipmentId: data.shipmentId,
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                carrierId: data.carrierId || null,
                dispatchTime: new Date(),
                status: 'DISPATCHED',
            }, { transaction });
            if (userId) {
                await this.auditLogModel.create({
                    organizationId,
                    userId,
                    action: 'DISPATCH_CREATED',
                    module: 'dispatch',
                    entityType: 'Dispatch',
                    entityId: dispatch.id,
                    newValue: JSON.stringify({ dispatchNumber, shipmentId: data.shipmentId }),
                }, { transaction });
            }
            return this.dispatchModel.findByPk(dispatch.id, {
                include: [
                    { model: models_1.ShipmentModel },
                    { model: models_1.VehicleModel },
                    { model: models_1.DriverModel },
                    { model: models_1.CarrierModel },
                ],
                transaction,
            });
        });
    }
    async updateStatus(id, status, userId) {
        const dispatch = await this.dispatchModel.findByPk(id, {
            include: [{ model: models_1.ShipmentModel }],
        });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        const updateData = { status };
        return this.withTransaction(async (transaction) => {
            if (status === 'COMPLETED') {
                updateData.completeTime = new Date();
                if (dispatch.vehicleId) {
                    await this.vehicleModel.update({ status: 'AVAILABLE' }, { where: { id: dispatch.vehicleId }, transaction });
                }
                if (dispatch.driverId) {
                    await this.driverModel.update({ status: 'AVAILABLE' }, { where: { id: dispatch.driverId }, transaction });
                }
                if (dispatch.shipmentId) {
                    await this.shipmentModel.update({ status: 'DELIVERED', actualDelivery: new Date() }, { where: { id: dispatch.shipmentId }, transaction });
                }
            }
            else if (status === 'IN_TRANSIT') {
                if (dispatch.shipmentId) {
                    await this.shipmentModel.update({ status: 'IN_TRANSIT', actualPickup: new Date() }, { where: { id: dispatch.shipmentId }, transaction });
                }
            }
            await dispatch.update(updateData, { transaction });
            return this.dispatchModel.findByPk(id, {
                include: [
                    { model: models_1.ShipmentModel },
                    { model: models_1.VehicleModel },
                    { model: models_1.DriverModel },
                ],
                transaction,
            });
        });
    }
    async addTripExpense(dispatchId, data) {
        const expense = await this.tripExpenseModel.create({
            dispatchId,
            expenseType: data.expenseType || 'FUEL',
            amount: parseFloat(data.amount) || 0.0,
            receiptUrl: data.receiptUrl || null,
            status: 'APPROVED',
        });
        const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
        const total = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const dispatch = await this.findById(dispatchId);
        await dispatch.update({ tripExpenseTotal: total });
        return expense;
    }
    async getTripExpenses(dispatchId) {
        return this.tripExpenseModel.findAll({
            where: { dispatchId },
            order: [['createdAt', 'DESC']],
        });
    }
    async closeTrip(dispatchId, data) {
        const dispatch = await this.dispatchModel.findByPk(dispatchId);
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        const totalKm = Math.max(0, data.endOdometer - data.startOdometer);
        const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
        const existingExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalExpenses = existingExpenses + (data.driverAllowance || 0);
        await dispatch.update({
            startOdometer: data.startOdometer,
            endOdometer: data.endOdometer,
            totalKm,
            fuelLitres: data.fuelLitres,
            tripExpenseTotal: totalExpenses,
            driverSettlementAmount: data.driverAllowance || 350,
            closureStatus: 'SETTLED',
            status: 'COMPLETED',
            completeTime: new Date(),
        });
        return this.dispatchModel.findByPk(dispatchId, {
            include: [
                { model: models_1.ShipmentModel },
                { model: models_1.VehicleModel },
                { model: models_1.DriverModel },
            ],
        });
    }
};
exports.DispatchService = DispatchService;
exports.DispatchService = DispatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.TripExpenseModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map