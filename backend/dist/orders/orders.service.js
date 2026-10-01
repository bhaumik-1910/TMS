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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let OrdersService = class OrdersService extends base_service_1.BaseSequelizeService {
    constructor(orderModel, orderItemModel, shipmentModel, shipmentItemModel, auditLogModel) {
        super(orderModel);
        this.orderModel = orderModel;
        this.orderItemModel = orderItemModel;
        this.shipmentModel = shipmentModel;
        this.shipmentItemModel = shipmentItemModel;
        this.auditLogModel = auditLogModel;
    }
    async findAll(organizationId, status, customerId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        const orders = await this.orderModel.findAll({
            where,
            include: [
                { model: models_1.CustomerModel, required: false },
                { model: models_1.LocationModel, as: 'originLocation', required: false },
                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                { model: models_1.OrderItemModel, required: false },
                { model: models_1.ShipmentModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        return orders.map((o) => {
            const plain = o.get({ plain: true });
            return {
                ...plain,
                orderItems: plain.items || [],
            };
        });
    }
    async findOne(id) {
        if (typeof id === 'string') {
            const order = await this.orderModel.findByPk(id, {
                include: [
                    { model: models_1.CustomerModel, required: false },
                    { model: models_1.LocationModel, as: 'originLocation', required: false },
                    { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                    { model: models_1.OrderItemModel, required: false },
                    {
                        model: models_1.ShipmentModel,
                        required: false,
                        include: [
                            { model: models_1.CarrierModel, required: false },
                            { model: models_1.VehicleModel, required: false },
                            { model: models_1.DriverModel, required: false },
                            { model: models_1.DispatchModel, required: false },
                        ],
                    },
                ],
            });
            if (!order)
                throw new common_1.NotFoundException('Transport order not found');
            const plain = order.get({ plain: true });
            return {
                ...plain,
                orderItems: plain.items || [],
            };
        }
        return super.findOne(id);
    }
    async create(organizationId, userId, data) {
        let totalWeight = 0;
        let totalVolume = 0;
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item) => {
                totalWeight += (parseFloat(item.weight) || 0) * (parseInt(item.quantity, 10) || 1);
                totalVolume += (parseFloat(item.volume) || 0) * (parseInt(item.quantity, 10) || 1);
            });
        }
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
        return this.withTransaction(async (transaction) => {
            const order = await this.orderModel.create({
                organizationId,
                orderNumber,
                customerId: data.customerId,
                priority: data.priority || 'NORMAL',
                status: data.status || 'SUBMITTED',
                requestedPickupDate: new Date(data.requestedPickupDate || Date.now() + 24 * 3600 * 1000),
                requestedDeliveryDate: new Date(data.requestedDeliveryDate || Date.now() + 72 * 3600 * 1000),
                originLocationId: data.originLocationId,
                destinationLocationId: data.destinationLocationId,
                totalWeight,
                totalVolume,
                specialInstructions: data.specialInstructions,
                createdBy: userId,
            }, { transaction });
            if (data.items && Array.isArray(data.items)) {
                for (const item of data.items) {
                    await this.orderItemModel.create({
                        transportOrderId: order.id,
                        description: item.description || 'General Cargo',
                        quantity: parseInt(item.quantity, 10) || 1,
                        weight: parseFloat(item.weight) || 100,
                        volume: parseFloat(item.volume) || 1.5,
                        packageTypeId: item.packageTypeId || null,
                        packageType: item.packageType || 'Pallet',
                        cargoTypeId: item.cargoTypeId || null,
                        fragile: Boolean(item.fragile),
                        hazardous: Boolean(item.hazardous),
                    }, { transaction });
                }
            }
            await this.auditLogModel.create({
                organizationId,
                userId,
                action: 'ORDER_CREATED',
                module: 'orders',
                entityType: 'TransportOrder',
                entityId: order.id,
                newValue: JSON.stringify({ orderNumber: order.orderNumber, customerId: order.customerId }),
            }, { transaction });
            return this.findOne(order.id);
        });
    }
    async updateStatus(id, newStatus, userId) {
        const order = await this.findOne(id);
        const validTransitions = {
            DRAFT: ['SUBMITTED', 'CANCELLED'],
            SUBMITTED: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PLANNED', 'CANCELLED'],
            PLANNED: ['DISPATCHED', 'CANCELLED'],
            DISPATCHED: ['IN_TRANSIT'],
            IN_TRANSIT: ['DELIVERED'],
            DELIVERED: ['CLOSED'],
            CANCELLED: [],
            CLOSED: [],
        };
        if (!validTransitions[order.status]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${order.status} to ${newStatus}`);
        }
        return this.withTransaction(async (transaction) => {
            const orderRecord = await this.findById(id);
            await orderRecord.update({ status: newStatus }, { transaction });
            if (newStatus === 'CONFIRMED' || newStatus === 'PLANNED') {
                const existingShipment = await this.shipmentModel.findOne({
                    where: { transportOrderId: id },
                    transaction,
                });
                if (!existingShipment) {
                    const shipmentNumber = `SHP-${Date.now().toString().slice(-6)}`;
                    const shipment = await this.shipmentModel.create({
                        shipmentNumber,
                        transportOrderId: id,
                        customerId: order.customerId,
                        status: 'PLANNED',
                        totalWeight: order.totalWeight,
                        totalVolume: order.totalVolume,
                        plannedPickup: order.requestedPickupDate,
                        plannedDelivery: order.requestedDeliveryDate,
                    }, { transaction });
                    const items = order.orderItems || order.items || [];
                    for (const item of items) {
                        await this.shipmentItemModel.create({
                            shipmentId: shipment.id,
                            orderItemId: item.id,
                            allocatedQuantity: item.quantity || 1,
                        }, { transaction });
                    }
                }
            }
            if (userId) {
                await this.auditLogModel.create({
                    organizationId: order.organizationId,
                    userId,
                    action: 'ORDER_STATUS_UPDATED',
                    module: 'orders',
                    entityType: 'TransportOrder',
                    entityId: id,
                    oldValue: order.status,
                    newValue: newStatus,
                }, { transaction });
            }
            return orderRecord;
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.OrderItemModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.ShipmentItemModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], OrdersService);
//# sourceMappingURL=orders.service.js.map