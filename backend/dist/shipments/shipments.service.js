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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const data_access_service_1 = require("../common/data-access/data-access.service");
const resource_policies_1 = require("../common/data-access/resource-policies");
const models_1 = require("../database/models");
let ShipmentsService = class ShipmentsService extends base_service_1.BaseSequelizeService {
    constructor(shipmentModel, vehicleModel, driverModel, dispatchModel, podModel, auditLogModel, notificationModel, dataAccess) {
        super(shipmentModel);
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.dispatchModel = dispatchModel;
        this.podModel = podModel;
        this.auditLogModel = auditLogModel;
        this.notificationModel = notificationModel;
        this.dataAccess = dataAccess;
    }
    async findAll(user, filters = {}, orgContext) {
        const where = await this.dataAccess.getShipmentWhere(user, { orgContext, status: filters.status });
        if (filters.customerId)
            where.customerId = filters.customerId;
        if (filters.carrierId)
            where.carrierId = filters.carrierId;
        if (filters.driverId)
            where.driverId = filters.driverId;
        if (filters.vehicleId)
            where.vehicleId = filters.vehicleId;
        let shipments = await this.shipmentModel.findAll({
            where,
            include: [
                { model: models_1.CustomerModel, required: false },
                { model: models_1.CarrierModel, required: false },
                { model: models_1.VehicleModel, required: false },
                { model: models_1.DriverModel, required: false },
                { model: models_1.RouteModel, required: false },
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                    ],
                },
                { model: models_1.ProofOfDeliveryModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        if (shipments.length === 0 && where['$transportOrder.organizationId$']) {
            delete where['$transportOrder.organizationId$'];
            shipments = await this.shipmentModel.findAll({
                where,
                include: [
                    { model: models_1.CustomerModel, required: false },
                    { model: models_1.CarrierModel, required: false },
                    { model: models_1.VehicleModel, required: false },
                    { model: models_1.DriverModel, required: false },
                    { model: models_1.RouteModel, required: false },
                    {
                        model: models_1.TransportOrderModel,
                        required: false,
                        include: [
                            { model: models_1.LocationModel, as: 'originLocation', required: false },
                            { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                        ],
                    },
                    { model: models_1.ProofOfDeliveryModel, required: false },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        return shipments.map((s) => {
            const plain = s.get({ plain: true });
            const enriched = {
                ...plain,
                _count: {
                    shipmentItems: 0,
                    trackingEvents: 0,
                },
            };
            return this.dataAccess.sanitizeShipment(enriched, user);
        });
    }
    async findOne(id, user) {
        if (typeof id === 'string') {
            const shipment = await this.shipmentModel.findByPk(id, {
                include: [
                    { model: models_1.CustomerModel, required: false },
                    { model: models_1.CarrierModel, required: false },
                    {
                        model: models_1.VehicleModel,
                        required: false,
                        include: [{ model: models_1.VehicleTypeModel, required: false }],
                    },
                    { model: models_1.DriverModel, required: false },
                    {
                        model: models_1.RouteModel,
                        required: false,
                        include: [
                            {
                                model: models_1.RouteStopModel,
                                required: false,
                                include: [{ model: models_1.LocationModel, required: false }],
                            },
                        ],
                    },
                    {
                        model: models_1.TransportOrderModel,
                        required: false,
                        include: [
                            { model: models_1.LocationModel, as: 'originLocation', required: false },
                            { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                        ],
                    },
                    { model: models_1.ShipmentItemModel, required: false },
                    { model: models_1.ProofOfDeliveryModel, required: false },
                ],
            });
            if (!shipment)
                throw new common_1.NotFoundException('Shipment not found');
            const plain = shipment.get({ plain: true });
            const enriched = {
                ...plain,
                shipmentItems: plain.items || [],
                trackingEvents: [],
                geofenceEvents: [],
                claims: [],
                invoices: [],
            };
            if (user && !resource_policies_1.ShipmentPolicy.canView(user, enriched)) {
                throw new common_1.ForbiddenException({
                    statusCode: 403,
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this shipment record',
                });
            }
            return this.dataAccess.sanitizeShipment(enriched, user);
        }
        return super.findOne(id);
    }
    async assignResources(id, data, userId) {
        const shipment = await this.findOne(id);
        if (data.vehicleId) {
            const vehicle = await this.vehicleModel.findByPk(data.vehicleId);
            if (vehicle && vehicle.capacityWeight < (shipment.totalWeight || 0)) {
                throw new common_1.BadRequestException(`Vehicle capacity (${vehicle.capacityWeight}kg) is insufficient for shipment weight (${shipment.totalWeight}kg)`);
            }
        }
        return this.withTransaction(async (transaction) => {
            const shipmentRecord = await this.findById(id);
            await shipmentRecord.update({
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                carrierId: data.carrierId || null,
                routeId: data.routeId || null,
                status: (data.vehicleId && data.driverId) || data.carrierId ? 'ASSIGNED' : shipmentRecord.status,
            }, { transaction });
            if (data.vehicleId) {
                await this.vehicleModel.update({ status: 'ASSIGNED' }, { where: { id: data.vehicleId }, transaction });
            }
            if (userId) {
                const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
                await this.auditLogModel.create({
                    organizationId: orgId,
                    userId,
                    action: 'SHIPMENT_ASSIGNED',
                    module: 'shipments',
                    entityType: 'Shipment',
                    entityId: id,
                    newValue: JSON.stringify(data),
                }, { transaction });
            }
            return this.findOne(id);
        });
    }
    async updateStatus(id, status, userId) {
        const shipment = await this.findOne(id);
        const updateData = { status };
        return this.withTransaction(async (transaction) => {
            if (status === 'IN_TRANSIT' && !shipment.actualPickup) {
                updateData.actualPickup = new Date();
                if (shipment.vehicleId) {
                    await this.vehicleModel.update({ status: 'IN_TRANSIT' }, { where: { id: shipment.vehicleId }, transaction });
                }
                if (shipment.driverId) {
                    await this.driverModel.update({ status: 'ON_TRIP' }, { where: { id: shipment.driverId }, transaction });
                }
            }
            if (status === 'DELIVERED') {
                updateData.actualDelivery = new Date();
                if (shipment.vehicleId) {
                    await this.vehicleModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.vehicleId }, transaction });
                }
                if (shipment.driverId) {
                    await this.driverModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.driverId }, transaction });
                }
            }
            const shipmentRecord = await this.findById(id);
            await shipmentRecord.update(updateData, { transaction });
            const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
            if (orgId) {
                await this.notificationModel.create({
                    organizationId: orgId,
                    title: `Shipment ${shipment.shipmentNumber} Updated`,
                    message: `Shipment status changed to ${status}`,
                    type: status === 'DELIVERED' ? 'SUCCESS' : 'INFO',
                    channel: 'IN_APP',
                }, { transaction });
            }
            return shipmentRecord;
        });
    }
    async submitPOD(id, podDto, user) {
        const shipment = await this.findOne(id);
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment #${id} not found`);
        }
        return this.withTransaction(async (transaction) => {
            let pod = await this.podModel.findOne({ where: { shipmentId: id }, transaction });
            const podData = {
                shipmentId: id,
                receiverName: podDto.receiverName,
                receiverPhone: podDto.receiverContact || null,
                otpCode: podDto.otp || null,
                signatureData: podDto.signatureData || podDto.signatureUrl || null,
                photoUrl: podDto.photoUrl || null,
                deliveredAt: new Date(),
            };
            if (pod) {
                await pod.update(podData, { transaction });
            }
            else {
                pod = await this.podModel.create(podData, { transaction });
            }
            const shipmentRecord = await this.findById(id);
            await shipmentRecord.update({
                status: 'DELIVERED',
                actualDelivery: new Date(),
            }, { transaction });
            if (shipment.vehicleId) {
                await this.vehicleModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.vehicleId }, transaction });
            }
            if (shipment.driverId) {
                await this.driverModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.driverId }, transaction });
            }
            await this.dispatchModel.update({ status: 'COMPLETED' }, { where: { shipmentId: id }, transaction });
            const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
            if (orgId) {
                await this.auditLogModel.create({
                    organizationId: orgId,
                    userId: user.userId || user.id,
                    action: 'POD_SUBMITTED_AND_VERIFIED',
                    module: 'shipments',
                    entityType: 'Shipment',
                    entityId: id,
                    newValue: JSON.stringify({
                        receiverName: podDto.receiverName,
                        deliveredAt: new Date(),
                        hasSignature: !!(podDto.signatureData || podDto.signatureUrl),
                    }),
                }, { transaction });
                await this.notificationModel.create({
                    organizationId: orgId,
                    title: `ePOD Submitted for Shipment ${shipment.shipmentNumber}`,
                    message: `Consignee ${podDto.receiverName} signed ePOD. Ready for freight billing and settlement.`,
                    type: 'SUCCESS',
                    channel: 'IN_APP',
                }, { transaction });
            }
            return {
                success: true,
                pod,
                shipment: shipmentRecord,
            };
        });
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.ProofOfDeliveryModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __param(6, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, data_access_service_1.DataAccessService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map