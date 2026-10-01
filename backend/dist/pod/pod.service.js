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
exports.PodService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
let PodService = class PodService {
    constructor(podModel, shipmentModel, vehicleModel, driverModel, invoiceModel, invoiceItemModel, notificationModel) {
        this.podModel = podModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.invoiceModel = invoiceModel;
        this.invoiceItemModel = invoiceItemModel;
        this.notificationModel = notificationModel;
    }
    async submitPOD(data) {
        const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
            include: [{ model: models_1.TransportOrderModel }],
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        const sequelize = this.podModel.sequelize;
        if (!sequelize)
            throw new Error('Sequelize not found');
        return sequelize.transaction(async (transaction) => {
            let pod = await this.podModel.findOne({
                where: { shipmentId: data.shipmentId },
                transaction,
            });
            const podValues = {
                shipmentId: data.shipmentId,
                receiverName: data.receiverName,
                receiverPhone: data.receiverContact || null,
                otpCode: data.otp || null,
                signatureData: data.signatureUrl || null,
                photoUrl: data.photoUrl || null,
                deliveryLatitude: data.latitude || null,
                deliveryLongitude: data.longitude || null,
                deliveredAt: new Date(),
            };
            if (pod) {
                await pod.update(podValues, { transaction });
            }
            else {
                pod = await this.podModel.create(podValues, { transaction });
            }
            await shipment.update({
                status: 'DELIVERED',
                actualDelivery: new Date(),
            }, { transaction });
            if (shipment.vehicleId) {
                await this.vehicleModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.vehicleId }, transaction });
            }
            if (shipment.driverId) {
                await this.driverModel.update({ status: 'AVAILABLE' }, { where: { id: shipment.driverId }, transaction });
            }
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
            const weight = shipment.totalWeight || 100;
            const baseFreight = Math.round(weight * 0.75 + 150);
            const taxAmount = Math.round(baseFreight * 0.1 * 100) / 100;
            const totalAmount = baseFreight + taxAmount;
            const orgId = shipment.transportOrder?.organizationId;
            if (orgId) {
                const invoice = await this.invoiceModel.create({
                    organizationId: orgId,
                    invoiceNumber,
                    shipmentId: shipment.id,
                    customerId: shipment.customerId || null,
                    dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
                    subTotal: baseFreight,
                    taxAmount,
                    totalAmount,
                    status: 'UNPAID',
                    invoiceType: 'CUSTOMER_BILLING',
                }, { transaction });
                await this.invoiceItemModel.create({
                    invoiceId: invoice.id,
                    description: 'Standard Freight Transportation',
                    quantity: 1,
                    unitPrice: baseFreight,
                    amount: baseFreight,
                    totalAmount: baseFreight,
                }, { transaction });
                await this.invoiceItemModel.create({
                    invoiceId: invoice.id,
                    description: 'Fuel Surcharge & Handling',
                    quantity: 1,
                    unitPrice: taxAmount,
                    amount: taxAmount,
                    totalAmount: taxAmount,
                }, { transaction });
                await this.notificationModel.create({
                    organizationId: orgId,
                    title: `POD Verified - Shipment ${shipment.shipmentNumber}`,
                    message: `Delivered to ${data.receiverName}. Invoice ${invoiceNumber} generated.`,
                    type: 'SUCCESS',
                    channel: 'IN_APP',
                }, { transaction });
            }
            return pod;
        });
    }
    async getPOD(shipmentId) {
        const pod = await this.podModel.findOne({
            where: { shipmentId },
            include: [
                {
                    model: models_1.ShipmentModel,
                    include: [
                        { model: models_1.CustomerModel },
                        { model: models_1.DriverModel },
                        { model: models_1.VehicleModel },
                        {
                            model: models_1.TransportOrderModel,
                            include: [
                                { model: models_1.LocationModel, as: 'originLocation' },
                                { model: models_1.LocationModel, as: 'destinationLocation' },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!pod)
            throw new common_1.NotFoundException('Proof of Delivery not found for this shipment');
        return pod;
    }
};
exports.PodService = PodService;
exports.PodService = PodService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.ProofOfDeliveryModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.InvoiceItemModel)),
    __param(6, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], PodService);
//# sourceMappingURL=pod.service.js.map