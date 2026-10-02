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
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
let PodService = class PodService {
    constructor(podModel, podRecordModel, shipmentModel, vehicleModel, driverModel, invoiceModel, invoiceItemModel, notificationModel) {
        this.podModel = podModel;
        this.podRecordModel = podRecordModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.invoiceModel = invoiceModel;
        this.invoiceItemModel = invoiceItemModel;
        this.notificationModel = notificationModel;
    }
    async onModuleInit() {
        try {
            const sequelize = this.podRecordModel.sequelize;
            if (!sequelize)
                return;
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS pod_records (
          id VARCHAR(255) PRIMARY KEY,
          "podId" VARCHAR(100) UNIQUE NOT NULL,
          "lrRef" VARCHAR(100) NOT NULL,
          "customer" VARCHAR(255) NOT NULL,
          "deliveryDate" VARCHAR(100),
          "receiver" VARCHAR(255),
          "deliveredQty" VARCHAR(100),
          "shortage" VARCHAR(100) DEFAULT '0',
          "source" VARCHAR(100) DEFAULT 'Driver App',
          "status" VARCHAR(100) DEFAULT 'Pending',
          "remarks" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
            const [rows] = await sequelize.query(`SELECT count(*) as cnt FROM pod_records;`);
            if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
                const seedPods = [
                    {
                        id: 'POD/240044',
                        podId: 'POD/240044',
                        lrRef: 'LR/240044',
                        customer: 'HPCL',
                        deliveryDate: '2026-10-22',
                        receiver: 'Rajan Mehta',
                        deliveredQty: '25 MT',
                        shortage: '0',
                        source: 'Driver App',
                        status: 'AI Verified',
                        remarks: 'Consignment verified with e-signature and physical stamp',
                    },
                    {
                        id: 'POD/240043',
                        podId: 'POD/240043',
                        lrRef: 'LR/240043',
                        customer: 'Pidilite Industries',
                        deliveryDate: '2026-10-21',
                        receiver: 'Akhil Sharma',
                        deliveredQty: '7.8 MT',
                        shortage: '0.2 MT',
                        source: 'Driver App',
                        status: 'Disputed',
                        remarks: 'Minor leakage observed on pallet 3',
                    },
                    {
                        id: 'POD/240042',
                        podId: 'POD/240042',
                        lrRef: 'LR/240042',
                        customer: 'Marico',
                        deliveryDate: '2026-10-20',
                        receiver: 'Vijay Nair',
                        deliveredQty: '15 Pallets',
                        shortage: '0',
                        source: 'Branch Scan',
                        status: 'Verified',
                        remarks: 'Direct warehouse receipt verified',
                    },
                    {
                        id: 'POD/240047',
                        podId: 'POD/240047',
                        lrRef: 'LR/240047',
                        customer: 'Reliance',
                        deliveryDate: '—',
                        receiver: '—',
                        deliveredQty: '—',
                        shortage: '—',
                        source: '—',
                        status: 'Pending',
                        remarks: 'En route delivery in progress',
                    },
                ];
                for (const p of seedPods) {
                    await sequelize.query(`
            INSERT INTO pod_records (id, "podId", "lrRef", "customer", "deliveryDate", "receiver", "deliveredQty", "shortage", "source", "status", "remarks", "createdAt", "updatedAt")
            VALUES ('${p.id}', '${p.podId}', '${p.lrRef}', '${p.customer}', '${p.deliveryDate}', '${p.receiver}', '${p.deliveredQty}', '${p.shortage}', '${p.source}', '${p.status}', '${p.remarks}', NOW(), NOW())
            ON CONFLICT ("podId") DO NOTHING;
          `);
                }
            }
        }
        catch (err) {
            console.warn('Could not auto-initialize pod_records table:', err?.message || err);
        }
    }
    async findAllRecords(query) {
        const where = {};
        if (query?.search) {
            const s = `%${query.search}%`;
            where[sequelize_2.Op.or] = [
                { podId: { [sequelize_2.Op.iLike]: s } },
                { lrRef: { [sequelize_2.Op.iLike]: s } },
                { customer: { [sequelize_2.Op.iLike]: s } },
                { receiver: { [sequelize_2.Op.iLike]: s } },
            ];
        }
        if (query?.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query?.source && query.source !== 'ALL') {
            where.source = query.source;
        }
        return this.podRecordModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }
    async findOneRecord(id) {
        const item = await this.podRecordModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { podId: id }, { lrRef: id }],
            },
        });
        if (!item)
            throw new common_1.NotFoundException(`POD record ${id} not found`);
        return item;
    }
    async createRecord(dto) {
        const podId = dto.podId || dto.id || `POD/${240048 + Math.floor(Math.random() * 900)}`;
        const id = dto.id || podId;
        const lrRef = dto.lrRef || dto.lrReference || `LR/${podId.replace(/[^0-9]/g, '') || '240048'}`;
        const payload = {
            id,
            podId,
            lrRef,
            customer: dto.customer || 'Reliance',
            deliveryDate: dto.deliveryDate || new Date().toISOString().slice(0, 10),
            receiver: dto.receiver || dto.receiverName || 'Plant Incharge',
            deliveredQty: dto.deliveredQty || '25 MT',
            shortage: dto.shortage !== undefined ? String(dto.shortage) : '0',
            source: dto.source || dto.podSource || 'Driver App',
            status: dto.status || 'Pending',
            remarks: dto.remarks || '',
        };
        const [item, created] = await this.podRecordModel.findOrCreate({
            where: {
                [sequelize_2.Op.or]: [{ id: payload.id }, { podId: payload.podId }],
            },
            defaults: payload,
        });
        if (!created) {
            await item.update(payload);
        }
        return item;
    }
    async updateRecord(id, dto) {
        const item = await this.findOneRecord(id);
        const updatedData = {};
        if (dto.podId !== undefined)
            updatedData.podId = dto.podId;
        if (dto.lrRef !== undefined)
            updatedData.lrRef = dto.lrRef;
        if (dto.customer !== undefined)
            updatedData.customer = dto.customer;
        if (dto.deliveryDate !== undefined)
            updatedData.deliveryDate = dto.deliveryDate;
        if (dto.receiver !== undefined || dto.receiverName !== undefined)
            updatedData.receiver = dto.receiver || dto.receiverName;
        if (dto.deliveredQty !== undefined)
            updatedData.deliveredQty = dto.deliveredQty;
        if (dto.shortage !== undefined)
            updatedData.shortage = String(dto.shortage);
        if (dto.source !== undefined || dto.podSource !== undefined)
            updatedData.source = dto.source || dto.podSource;
        if (dto.status !== undefined)
            updatedData.status = dto.status;
        if (dto.remarks !== undefined)
            updatedData.remarks = dto.remarks;
        await item.update(updatedData);
        return item;
    }
    async removeRecord(id) {
        const item = await this.findOneRecord(id);
        await item.destroy();
        return { success: true, message: `POD record ${id} deleted successfully` };
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
    __param(1, (0, sequelize_1.InjectModel)(models_1.PodRecordModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(6, (0, sequelize_1.InjectModel)(models_1.InvoiceItemModel)),
    __param(7, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], PodService);
//# sourceMappingURL=pod.service.js.map