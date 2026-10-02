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
    async onModuleInit() {
        try {
            const sequelize = this.orderModel.sequelize;
            if (!sequelize)
                return;
            const columns = [
                ['lrNo', 'VARCHAR(50)'],
                ['bookingDate', 'VARCHAR(50)'],
                ['consignor', 'VARCHAR(255)'],
                ['consignee', 'VARCHAR(255)'],
                ['billingParty', 'VARCHAR(255)'],
                ['origin', 'VARCHAR(100)'],
                ['destination', 'VARCHAR(100)'],
                ['route', 'VARCHAR(255)'],
                ['product', 'VARCHAR(255)'],
                ['quantity', 'VARCHAR(100)'],
                ['actualWeight', 'VARCHAR(50)'],
                ['chargedWt', 'VARCHAR(50)'],
                ['freightBasis', 'VARCHAR(50)'],
                ['rate', 'VARCHAR(50)'],
                ['ewayBill', 'VARCHAR(100)'],
                ['assignedVehicle', 'VARCHAR(100)'],
                ['assignedDriver', 'VARCHAR(100)'],
                ['branch', 'VARCHAR(50)'],
            ];
            for (const [col, type] of columns) {
                await sequelize.query(`ALTER TABLE transport_orders ADD COLUMN IF NOT EXISTS "${col}" ${type};`);
            }
            for (const col of ['customerId', 'originLocationId', 'destinationLocationId', 'requestedPickupDate', 'requestedDeliveryDate']) {
                try {
                    await sequelize.query(`ALTER TABLE transport_orders ALTER COLUMN "${col}" DROP NOT NULL;`);
                }
                catch (_) { }
            }
            const [rows] = await sequelize.query(`SELECT count(*) as cnt FROM transport_orders;`);
            if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
                const seedLrs = [
                    {
                        lrNo: 'LR/240047',
                        consignor: 'Reliance Retail DC',
                        consignee: 'Reliance Supermart DC',
                        billingParty: 'Reliance Retail DC',
                        origin: 'AHD',
                        destination: 'MUM',
                        route: 'AHD → MUM',
                        product: 'FMCG Mixed',
                        quantity: '520 Cartons',
                        actualWeight: '14.2 MT',
                        chargedWt: '15 MT',
                        freightBasis: 'Per MT',
                        rate: '₹2,200',
                        ewayBill: '240600128841',
                        status: 'InTransit',
                        assignedVehicle: 'GJ-01-AB-1122',
                        assignedDriver: 'Ramesh Alumar',
                        branch: 'Ahmedabad',
                    },
                    {
                        lrNo: 'LR/240046',
                        consignor: 'Adani Logistics',
                        consignee: 'Adani Ports CFS',
                        billingParty: 'Adani Logistics',
                        origin: 'AHD',
                        destination: 'VAPI',
                        route: 'AHD → VAPI',
                        product: 'Industrial Goods',
                        quantity: '300 Bags',
                        actualWeight: '8.8 MT',
                        chargedWt: '9 MT',
                        freightBasis: 'Per MT',
                        rate: '₹18,000',
                        ewayBill: '240600982144',
                        status: 'Confirmed',
                        assignedVehicle: 'GJ-01-AC-3444',
                        assignedDriver: 'Devraj Patel',
                        branch: 'Ahmedabad',
                    },
                    {
                        lrNo: 'LR/240045',
                        consignor: 'Tata Steel Ltd',
                        consignee: 'Tata AutoComp Systems',
                        billingParty: 'Tata Steel Ltd',
                        origin: 'SRT',
                        destination: 'PUN',
                        route: 'SRT → PUN',
                        product: 'Steel Coils',
                        quantity: '10 Coils',
                        actualWeight: '17.5 MT',
                        chargedWt: '18 MT',
                        freightBasis: 'Per MT',
                        rate: '₹1,800',
                        ewayBill: '240600551920',
                        status: 'Draft',
                        assignedVehicle: 'MH-14-DX-9000',
                        assignedDriver: 'Kishore Bhai',
                        branch: 'Surat',
                    },
                    {
                        lrNo: 'LR/240044',
                        consignor: 'HPCL',
                        consignee: 'Suburban Petro Dispenser',
                        billingParty: 'HPCL',
                        origin: 'MUM',
                        destination: 'SUB',
                        route: 'MUM → SUB',
                        product: 'Cement',
                        quantity: '500 Bags',
                        actualWeight: '24.8 MT',
                        chargedWt: '25 MT',
                        freightBasis: 'Per MT',
                        rate: '₹48,000',
                        ewayBill: '240600119283',
                        status: 'PODVerified',
                        assignedVehicle: 'RJ-13-TR-7788',
                        assignedDriver: 'Suresh Patel',
                        branch: 'Mumbai',
                    },
                    {
                        lrNo: 'LR/240043',
                        consignor: 'Pidilite Industries',
                        consignee: 'Fevicol Regional Depot',
                        billingParty: 'Pidilite Industries',
                        origin: 'AHD',
                        destination: 'DEL',
                        route: 'AHD → DEL',
                        product: 'Chemical Drums',
                        quantity: '120 Drums',
                        actualWeight: '7.6 MT',
                        chargedWt: '8 MT',
                        freightBasis: 'Per MT',
                        rate: '₹2,800',
                        ewayBill: '240600662910',
                        status: 'Billed',
                        assignedVehicle: 'GJ-01-AB-1122',
                        assignedDriver: 'Ramesh Alumar',
                        branch: 'Ahmedabad',
                    },
                ];
                for (const s of seedLrs) {
                    const ordNo = `ORD-${s.lrNo.replace(/[^0-9]/g, '')}`;
                    await sequelize.query(`INSERT INTO transport_orders (id, "organizationId", "orderNumber", "lrNo", "consignor", "consignee", "billingParty", "origin", "destination", "route", "product", "quantity", "actualWeight", "chargedWt", "freightBasis", "rate", "ewayBill", "status", "assignedVehicle", "assignedDriver", "branch", "priority", "totalWeight", "totalVolume", "totalPackages", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), 'd09a96f3-5962-49fb-b002-e80766937054', :ordNo, :lrNo, :consignor, :consignee, :billingParty, :origin, :destination, :route, :product, :quantity, :actualWeight, :chargedWt, :freightBasis, :rate, :ewayBill, :status, :assignedVehicle, :assignedDriver, :branch, 'NORMAL', 15.0, 10.0, 100, NOW(), NOW())
             ON CONFLICT ("orderNumber") DO NOTHING;`, {
                        replacements: {
                            ordNo,
                            lrNo: s.lrNo,
                            consignor: s.consignor,
                            consignee: s.consignee,
                            billingParty: s.billingParty,
                            origin: s.origin,
                            destination: s.destination,
                            route: s.route,
                            product: s.product,
                            quantity: s.quantity,
                            actualWeight: s.actualWeight,
                            chargedWt: s.chargedWt,
                            freightBasis: s.freightBasis,
                            rate: s.rate,
                            ewayBill: s.ewayBill,
                            status: s.status,
                            assignedVehicle: s.assignedVehicle,
                            assignedDriver: s.assignedDriver,
                            branch: s.branch,
                        },
                    });
                }
            }
            try {
                await sequelize.query(`
          UPDATE transport_orders
          SET "consignee" = CASE 
                WHEN "consignee" IS NULL OR "consignee" = '' OR "consignee" = '—' THEN COALESCE("consignor", 'Reliance Retail') || ' Delivery Hub'
                ELSE "consignee" 
              END,
              "billingParty" = CASE 
                WHEN "billingParty" IS NULL OR "billingParty" = '' OR "billingParty" = '—' THEN COALESCE("consignor", 'Reliance Retail DC')
                ELSE "billingParty" 
              END,
              "product" = CASE 
                WHEN "product" IS NULL OR "product" = '' OR "product" = '—' THEN 'FMCG Mixed Goods'
                ELSE "product" 
              END,
              "quantity" = CASE 
                WHEN "quantity" IS NULL OR "quantity" = '' OR "quantity" = '—' THEN '12 Pallets / 500 Bags'
                ELSE "quantity" 
              END,
              "actualWeight" = CASE 
                WHEN "actualWeight" IS NULL OR "actualWeight" = '' OR "actualWeight" = '—' THEN '14.2 MT'
                ELSE "actualWeight" 
              END,
              "chargedWt" = CASE 
                WHEN "chargedWt" IS NULL OR "chargedWt" = '' OR "chargedWt" = '—' THEN '15 MT'
                ELSE "chargedWt" 
              END,
              "freightBasis" = CASE 
                WHEN "freightBasis" IS NULL OR "freightBasis" = '' OR "freightBasis" = '—' THEN 'Per MT'
                ELSE "freightBasis" 
              END,
              "rate" = CASE 
                WHEN "rate" IS NULL OR "rate" = '' OR "rate" = '—' THEN '₹2,200'
                ELSE "rate" 
              END,
              "ewayBill" = CASE 
                WHEN "ewayBill" IS NULL OR "ewayBill" = '' OR "ewayBill" = '—' THEN '240600128841'
                ELSE "ewayBill" 
              END,
              "assignedVehicle" = CASE 
                WHEN "assignedVehicle" IS NULL OR "assignedVehicle" = '' OR "assignedVehicle" = '—' THEN 'GJ-01-AB-1122'
                ELSE "assignedVehicle" 
              END,
              "assignedDriver" = CASE 
                WHEN "assignedDriver" IS NULL OR "assignedDriver" = '' OR "assignedDriver" = '—' THEN 'Ramesh Alumar'
                ELSE "assignedDriver" 
              END,
              "bookingDate" = CASE 
                WHEN "bookingDate" IS NULL OR "bookingDate" = '' THEN TO_CHAR(NOW(), 'YYYY-MM-DD')
                ELSE "bookingDate" 
              END;
        `);
            }
            catch (_) { }
        }
        catch (err) {
            console.warn('OrdersService onModuleInit DB alter/seed warning:', err);
        }
    }
    async findAll(organizationId, status, customerId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (status && status !== 'ALL')
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
            const origin = plain.origin || plain.originLocation?.name || 'AHD';
            const destination = plain.destination || plain.destinationLocation?.name || 'MUM';
            const consignor = plain.consignor || plain.customer?.companyName || 'Reliance Retail DC';
            const consignee = (plain.consignee && plain.consignee !== '—') ? plain.consignee : `${consignor} Delivery Hub`;
            const billingParty = (plain.billingParty && plain.billingParty !== '—') ? plain.billingParty : consignor;
            const product = plain.product || (plain.items && plain.items[0]?.description) || 'FMCG Mixed Goods';
            const quantity = (plain.quantity && plain.quantity !== '—') ? plain.quantity : '12 Pallets / 500 Bags';
            const actualWeight = (plain.actualWeight && plain.actualWeight !== '—') ? plain.actualWeight : '14.2 MT';
            const chargedWt = (plain.chargedWt && plain.chargedWt !== '—') ? plain.chargedWt : (plain.totalWeight ? `${plain.totalWeight} MT` : '15 MT');
            const freightBasis = (plain.freightBasis && plain.freightBasis !== '—') ? plain.freightBasis : 'Per MT';
            const rate = plain.rate || '₹2,200';
            const ewayBill = (plain.ewayBill && plain.ewayBill !== '—') ? plain.ewayBill : '240600128841';
            const assignedVehicle = (plain.assignedVehicle && plain.assignedVehicle !== '—') ? plain.assignedVehicle : 'GJ-01-AB-1122';
            const assignedDriver = (plain.assignedDriver && plain.assignedDriver !== '—') ? plain.assignedDriver : 'Ramesh Alumar';
            const date = plain.bookingDate || (plain.createdAt ? new Date(plain.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
            return {
                ...plain,
                id: plain.id,
                lrNo: plain.lrNo || plain.orderNumber || 'LR/240048',
                date,
                consignor,
                consignee,
                billingParty,
                route: plain.route || `${origin} → ${destination}`,
                origin,
                destination,
                product,
                quantity,
                actualWeight,
                chargedWt,
                freightBasis,
                rate,
                ewayBill,
                assignedVehicle,
                assignedDriver,
                branch: plain.branch || 'Ahmedabad',
                status: plain.status || 'Draft',
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
        const org = organizationId || 'd09a96f3-5962-49fb-b002-e80766937054';
        const num = data.lrNo ? data.lrNo.replace(/[^0-9]/g, '') : Date.now().toString().slice(-6);
        const orderNumber = data.orderNumber || `ORD-${num}`;
        const lrNo = data.lrNo || `LR/${num}`;
        const origin = (data.origin || 'AHD').toUpperCase();
        const destination = (data.destination || 'MUM').toUpperCase();
        const route = data.route || `${origin} → ${destination}`;
        let totalWeight = parseFloat(String(data.chargedWt || data.chargedWeight || '15').replace(/[^0-9.]/g, '')) || 0;
        let totalVolume = 0;
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item) => {
                totalWeight += (parseFloat(item.weight) || 0) * (parseInt(item.quantity, 10) || 1);
                totalVolume += (parseFloat(item.volume) || 0) * (parseInt(item.quantity, 10) || 1);
            });
        }
        return this.withTransaction(async (transaction) => {
            const order = await this.orderModel.create({
                organizationId: org,
                orderNumber,
                lrNo,
                bookingDate: data.date || data.bookingDate || new Date().toISOString().slice(0, 10),
                consignor: data.consignor || 'Reliance Retail DC',
                consignee: data.consignee || '',
                billingParty: data.billingParty || data.consignor || '',
                origin,
                destination,
                route,
                product: data.product || 'General Cargo',
                quantity: data.quantity || '',
                actualWeight: data.actualWeight || '',
                chargedWt: data.chargedWt || data.chargedWeight || '15 MT',
                freightBasis: data.freightBasis || 'Per MT',
                rate: data.rate || '₹2,200',
                ewayBill: data.ewayBill || data.ewayBillNumber || '',
                assignedVehicle: data.assignedVehicle && data.assignedVehicle !== '— Select —' ? data.assignedVehicle : '',
                assignedDriver: data.assignedDriver && data.assignedDriver !== '— Select —' ? data.assignedDriver : '',
                branch: data.branch || 'Ahmedabad',
                customerId: data.customerId || null,
                priority: data.priority || 'NORMAL',
                status: data.status || 'Draft',
                requestedPickupDate: new Date(data.requestedPickupDate || data.date || Date.now() + 24 * 3600 * 1000),
                requestedDeliveryDate: new Date(data.requestedDeliveryDate || Date.now() + 72 * 3600 * 1000),
                originLocationId: data.originLocationId || null,
                destinationLocationId: data.destinationLocationId || null,
                totalWeight: totalWeight || 15.0,
                totalVolume: totalVolume || 10.0,
                totalPackages: parseInt(String(data.quantity || '10').replace(/[^0-9]/g, ''), 10) || 10,
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
                organizationId: org,
                userId,
                action: 'ORDER_CREATED',
                module: 'orders',
                entityType: 'TransportOrder',
                entityId: order.id,
                newValue: JSON.stringify({ orderNumber: order.orderNumber, lrNo: order.lrNo, consignor: order.consignor }),
            }, { transaction });
            return this.findOne(order.id);
        });
    }
    async updateOrder(id, data) {
        const order = await this.orderModel.findByPk(id);
        if (!order)
            throw new common_1.NotFoundException('Booking / LR record not found');
        const origin = (data.origin || order.origin || 'AHD').toUpperCase();
        const destination = (data.destination || order.destination || 'MUM').toUpperCase();
        const route = data.route || `${origin} → ${destination}`;
        await order.update({
            lrNo: data.lrNo !== undefined ? data.lrNo : order.lrNo,
            bookingDate: data.date || data.bookingDate || order.bookingDate,
            consignor: data.consignor !== undefined ? data.consignor : order.consignor,
            consignee: data.consignee !== undefined ? data.consignee : order.consignee,
            billingParty: data.billingParty !== undefined ? data.billingParty : order.billingParty,
            origin,
            destination,
            route,
            product: data.product !== undefined ? data.product : order.product,
            quantity: data.quantity !== undefined ? data.quantity : order.quantity,
            actualWeight: data.actualWeight !== undefined ? data.actualWeight : order.actualWeight,
            chargedWt: (data.chargedWt || data.chargedWeight) !== undefined ? (data.chargedWt || data.chargedWeight) : order.chargedWt,
            freightBasis: data.freightBasis !== undefined ? data.freightBasis : order.freightBasis,
            rate: data.rate !== undefined ? data.rate : order.rate,
            ewayBill: (data.ewayBill || data.ewayBillNumber) !== undefined ? (data.ewayBill || data.ewayBillNumber) : order.ewayBill,
            assignedVehicle: data.assignedVehicle !== undefined ? (data.assignedVehicle === '— Select —' ? '' : data.assignedVehicle) : order.assignedVehicle,
            assignedDriver: data.assignedDriver !== undefined ? (data.assignedDriver === '— Select —' ? '' : data.assignedDriver) : order.assignedDriver,
            branch: data.branch !== undefined ? data.branch : order.branch,
            status: data.status !== undefined ? (data.status === '— Select —' ? 'Draft' : data.status) : order.status,
        });
        return this.findOne(order.id);
    }
    async deleteOrder(id) {
        const order = await this.orderModel.findByPk(id);
        if (!order)
            throw new common_1.NotFoundException('Booking / LR record not found');
        await order.destroy();
        return { success: true, id };
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