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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
const ops_runner_service_1 = require("../framework/ops/ops-runner.service");
const document_sequence_service_1 = require("../foundation/document-sequences/document-sequence.service");
const _010_check_period_lock_1 = require("./ops/invoices/010-check-period-lock");
const _020_validate_lrs_1 = require("./ops/invoices/020-validate-lrs");
const _010_check_period_lock_2 = require("./ops/purchase-bills/010-check-period-lock");
const _010_check_period_lock_3 = require("./ops/settlements/010-check-period-lock");
const _020_validate_trip_balance_1 = require("./ops/settlements/020-validate-trip-balance");
let BillingService = class BillingService {
    constructor(invoiceModel, invoiceItemModel, paymentModel, shipmentModel, carrierRateModel, claimModel, claimItemModel, billingInvoiceModel, purchaseBillModel, settlementModel, opsRunner, sequenceService) {
        this.invoiceModel = invoiceModel;
        this.invoiceItemModel = invoiceItemModel;
        this.paymentModel = paymentModel;
        this.shipmentModel = shipmentModel;
        this.carrierRateModel = carrierRateModel;
        this.claimModel = claimModel;
        this.claimItemModel = claimItemModel;
        this.billingInvoiceModel = billingInvoiceModel;
        this.purchaseBillModel = purchaseBillModel;
        this.settlementModel = settlementModel;
        this.opsRunner = opsRunner;
        this.sequenceService = sequenceService;
    }
    async onModuleInit() {
        try {
            const sequelize = this.billingInvoiceModel.sequelize;
            if (!sequelize)
                return;
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS billing_invoices (
          id VARCHAR(255) PRIMARY KEY,
          "invoiceNo" VARCHAR(100) UNIQUE NOT NULL,
          "lrRef" VARCHAR(100) NOT NULL,
          "customer" VARCHAR(255) NOT NULL,
          "baseAmt" VARCHAR(100) DEFAULT '₹0',
          "gst" VARCHAR(100) DEFAULT '₹0 (RCM)',
          "total" VARCHAR(100) DEFAULT '₹0',
          "gstType" VARCHAR(100) DEFAULT 'RCM 5%',
          "irn" VARCHAR(255) DEFAULT '—',
          "dueDate" VARCHAR(100),
          "status" VARCHAR(100) DEFAULT 'Draft',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
            const [rows] = await sequelize.query(`SELECT count(*) as cnt FROM billing_invoices;`);
            if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
                const seed = [
                    {
                        id: 'INV/24/1089',
                        invoiceNo: 'INV/24/1089',
                        lrRef: 'LR/240044',
                        customer: 'HPCL',
                        baseAmt: '₹48,500',
                        gst: '₹0 (RCM)',
                        total: '₹48,500',
                        gstType: 'RCM 5%',
                        irn: 'IRN-2024-ABC7729',
                        dueDate: '2026-11-05',
                        status: 'Paid',
                    },
                    {
                        id: 'INV/24/1088',
                        invoiceNo: 'INV/24/1088',
                        lrRef: 'LR/240042',
                        customer: 'Marico',
                        baseAmt: '₹62,000',
                        gst: '₹7,440',
                        total: '₹69,440',
                        gstType: 'Forward 12%',
                        irn: '—',
                        dueDate: '2026-11-10',
                        status: 'Pending',
                    },
                    {
                        id: 'INV/24/1087',
                        invoiceNo: 'INV/24/1087',
                        lrRef: 'LR/240040',
                        customer: 'Pidilite',
                        baseAmt: '₹35,000',
                        gst: '₹4,200',
                        total: '₹39,200',
                        gstType: 'RCM 5%',
                        irn: '—',
                        dueDate: '2026-10-20',
                        status: 'Overdue',
                    },
                    {
                        id: 'INV/24/1086',
                        invoiceNo: 'INV/24/1086',
                        lrRef: 'LR/240038',
                        customer: 'Reliance',
                        baseAmt: '₹1,20,000',
                        gst: '₹0 (RCM)',
                        total: '₹1,20,000',
                        gstType: 'RCM 5%',
                        irn: 'IRN-2024-DEF9943',
                        dueDate: '2026-10-23',
                        status: 'Overdue',
                    },
                ];
                for (const s of seed) {
                    await this.billingInvoiceModel.create(s);
                }
            }
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS purchase_bills (
          id VARCHAR(255) PRIMARY KEY,
          "supplier" VARCHAR(255) NOT NULL,
          "type" VARCHAR(100) DEFAULT 'Fuel Station',
          "billNo" VARCHAR(100) NOT NULL,
          "date" VARCHAR(100),
          "baseAmt" VARCHAR(100) DEFAULT '₹0',
          "gst" VARCHAR(100) DEFAULT '₹0',
          "total" VARCHAR(100) DEFAULT '₹0',
          "tds" VARCHAR(100) DEFAULT '—',
          "tdsSection" VARCHAR(100) DEFAULT '194C',
          "linkedRef" VARCHAR(255) DEFAULT '—',
          "status" VARCHAR(100) DEFAULT 'Pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
            const [pbRows] = await sequelize.query(`SELECT count(*) as cnt FROM purchase_bills;`);
            if (pbRows && pbRows[0] && parseInt(pbRows[0].cnt, 10) === 0) {
                const pbSeed = [
                    {
                        id: 'PB/240055',
                        supplier: 'HPCL Adajan',
                        type: 'Fuel Station',
                        billNo: 'HPCL/OCT/1234',
                        date: '2026-10-24',
                        baseAmt: '₹1,25,000',
                        gst: '₹0',
                        total: '₹1,25,000',
                        tds: '—',
                        tdsSection: '—',
                        linkedRef: 'FE/240086-089',
                        status: 'Approved',
                    },
                    {
                        id: 'PB/240054',
                        supplier: 'Shree Motors',
                        type: 'Service Centre',
                        billNo: 'SM/OCT/0089',
                        date: '2026-10-20',
                        baseAmt: '₹45,000',
                        gst: '₹8,100',
                        total: '₹53,100',
                        tds: '₹900',
                        tdsSection: '194C',
                        linkedRef: 'JC/240055',
                        status: 'Pending',
                    },
                    {
                        id: 'PB/240053',
                        supplier: 'Tata Rubber Ltd',
                        type: 'Tyre Supplier',
                        billNo: 'TRL/OCT/0456',
                        date: '2026-10-18',
                        baseAmt: '₹28,000',
                        gst: '₹3,360',
                        total: '₹31,360',
                        tds: '₹560',
                        tdsSection: '194C',
                        linkedRef: 'TYR-GJ01-001',
                        status: 'Paid',
                    },
                    {
                        id: 'PB/240052',
                        supplier: 'BPCL Naroda',
                        type: 'Fuel Station',
                        billNo: 'BPCL/OCT/0789',
                        date: '2026-10-21',
                        baseAmt: '₹33,480',
                        gst: '₹0',
                        total: '₹33,480',
                        tds: '—',
                        tdsSection: '—',
                        linkedRef: 'FE/240086',
                        status: 'Approved',
                    },
                ];
                for (const pb of pbSeed) {
                    await this.purchaseBillModel.create(pb);
                }
            }
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS settlements (
          id VARCHAR(255) PRIMARY KEY,
          "settlementType" VARCHAR(100) DEFAULT 'Owner',
          "party" VARCHAR(255) NOT NULL,
          "tripRef" VARCHAR(100) NOT NULL,
          "grossAmt" VARCHAR(100) DEFAULT '₹0',
          "advance" VARCHAR(100) DEFAULT '₹0',
          "tds" VARCHAR(100) DEFAULT '₹0',
          "shortage" VARCHAR(100) DEFAULT '₹0',
          "netPayable" VARCHAR(100) DEFAULT '₹0',
          "date" VARCHAR(100),
          "status" VARCHAR(100) DEFAULT 'Draft',
          "remarks" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
            const [stRows] = await sequelize.query(`SELECT count(*) as cnt FROM settlements;`);
            if (stRows && stRows[0] && parseInt(stRows[0].cnt, 10) === 0) {
                const stSeed = [
                    {
                        id: 'STL/240088',
                        settlementType: 'Owner',
                        party: 'Kishore Transport',
                        tripRef: 'TR/240078',
                        grossAmt: '₹38,000',
                        advance: '₹12,000',
                        tds: '₹760',
                        shortage: '₹0',
                        netPayable: '₹25,240',
                        date: '2026-10-23',
                        status: 'Paid',
                        remarks: 'Cleared via NEFT',
                    },
                    {
                        id: 'STL/240086',
                        settlementType: 'Owner',
                        party: 'Suresh Logistics',
                        tripRef: 'TR/240076',
                        grossAmt: '₹55,000',
                        advance: '₹20,000',
                        tds: '₹1,100',
                        shortage: '₹2,500',
                        netPayable: '₹31,400',
                        date: '2026-10-22',
                        status: 'Paid',
                        remarks: 'Shortage deducted for seal damage',
                    },
                    {
                        id: 'STL/240087',
                        settlementType: 'Driver',
                        party: 'Ramesh Alumar',
                        tripRef: 'TR/240079',
                        grossAmt: '₹6,200',
                        advance: '₹5,500',
                        tds: '₹0',
                        shortage: '₹0',
                        netPayable: '₹700',
                        date: '2026-10-24',
                        status: 'Pending',
                        remarks: 'Driver trip log audit pending',
                    },
                    {
                        id: 'STL/240085',
                        settlementType: 'Customer',
                        party: 'Pidilite Industries',
                        tripRef: 'TR/240072',
                        grossAmt: '₹39,200',
                        advance: '₹0',
                        tds: '₹0',
                        shortage: '₹0',
                        netPayable: '₹39,200',
                        date: '2026-10-20',
                        status: 'Pending',
                        remarks: 'Customer billing reconciliation pending',
                    },
                ];
                for (const st of stSeed) {
                    await this.settlementModel.create(st);
                }
            }
        }
        catch (err) {
            console.error('Failed to initialize billing tables/seeds:', err);
        }
    }
    async findAllSettlements(query) {
        const where = {};
        if (query?.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query?.settlementType && query.settlementType !== 'ALL') {
            where.settlementType = query.settlementType;
        }
        if (query?.search) {
            const q = `%${query.search.trim()}%`;
            where[sequelize_2.Op.or] = [
                { id: { [sequelize_2.Op.iLike]: q } },
                { party: { [sequelize_2.Op.iLike]: q } },
                { tripRef: { [sequelize_2.Op.iLike]: q } },
                { settlementType: { [sequelize_2.Op.iLike]: q } },
                { status: { [sequelize_2.Op.iLike]: q } },
            ];
        }
        return this.settlementModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }
    async createSettlement(data) {
        const orgId = data.organizationId || '1';
        return this.opsRunner.run({
            resource: 'Settlement',
            op: 'create',
            user: {
                id: data.userId || '1',
                organizationId: orgId,
                branchId: data.branchId,
            },
            data,
            steps: [_010_check_period_lock_3.checkSettlementPeriodLockStep, _020_validate_trip_balance_1.validateSettlementBalanceStep],
            execute: async (c) => {
                const dateStr = data.date || new Date().toISOString().slice(0, 10);
                const resolvedId = data.id ||
                    (await this.sequenceService.next(c.organizationId, 'settlement', dateStr, c.t));
                const record = await this.settlementModel.create({
                    id: resolvedId,
                    settlementType: data.settlementType || 'Owner',
                    party: data.party || '',
                    tripRef: data.tripRef || '',
                    grossAmt: data.grossAmt || '₹0',
                    advance: data.advance || '₹0',
                    tds: data.tds || '₹0',
                    shortage: data.shortage || '₹0',
                    netPayable: data.netPayable || '₹0',
                    date: dateStr,
                    status: data.status || 'Draft',
                    remarks: data.remarks || '',
                }, { transaction: c.t });
                return record;
            },
        });
    }
    async updateSettlement(id, data) {
        const record = await this.settlementModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { tripRef: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Settlement ${id} not found`);
        }
        await record.update(data);
        return record;
    }
    async deleteSettlement(id) {
        const record = await this.settlementModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { tripRef: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Settlement ${id} not found`);
        }
        await record.destroy();
        return { success: true, message: `Settlement ${id} deleted successfully` };
    }
    async findAllPurchaseBills(query) {
        const where = {};
        if (query?.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query?.type && query.type !== 'ALL') {
            where.type = query.type;
        }
        if (query?.search) {
            const q = `%${query.search.trim()}%`;
            where[sequelize_2.Op.or] = [
                { id: { [sequelize_2.Op.iLike]: q } },
                { supplier: { [sequelize_2.Op.iLike]: q } },
                { billNo: { [sequelize_2.Op.iLike]: q } },
                { linkedRef: { [sequelize_2.Op.iLike]: q } },
            ];
        }
        return this.purchaseBillModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }
    async createPurchaseBill(data) {
        const orgId = data.organizationId || '1';
        return this.opsRunner.run({
            resource: 'PurchaseBill',
            op: 'create',
            user: {
                id: data.userId || '1',
                organizationId: orgId,
                branchId: data.branchId,
            },
            data,
            steps: [_010_check_period_lock_2.checkPurchaseBillPeriodLockStep],
            execute: async (c) => {
                const dateStr = data.date || new Date().toISOString().slice(0, 10);
                const billNo = data.billNo ||
                    data.id ||
                    (await this.sequenceService.next(c.organizationId, 'purchase_bill', dateStr, c.t));
                const id = data.id || billNo;
                const record = await this.purchaseBillModel.create({
                    id,
                    supplier: data.supplier || '',
                    type: data.type || 'Fuel Station',
                    billNo,
                    date: dateStr,
                    baseAmt: data.baseAmt || '₹0',
                    gst: data.gst || '₹0',
                    total: data.total || '₹0',
                    tds: data.tds || '—',
                    tdsSection: data.tdsSection || '194C',
                    linkedRef: data.linkedRef || '—',
                    status: data.status || 'Pending',
                }, { transaction: c.t });
                return record;
            },
        });
    }
    async updatePurchaseBill(id, data) {
        const record = await this.purchaseBillModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { billNo: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Purchase Bill ${id} not found`);
        }
        await record.update(data);
        return record;
    }
    async deletePurchaseBill(id) {
        const record = await this.purchaseBillModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { billNo: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Purchase Bill ${id} not found`);
        }
        await record.destroy();
        return { success: true, message: `Purchase Bill ${id} deleted successfully` };
    }
    async findAllBillingInvoices(query) {
        const where = {};
        if (query?.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query?.search) {
            const q = `%${query.search.trim()}%`;
            where[sequelize_2.Op.or] = [
                { invoiceNo: { [sequelize_2.Op.iLike]: q } },
                { customer: { [sequelize_2.Op.iLike]: q } },
                { lrRef: { [sequelize_2.Op.iLike]: q } },
            ];
        }
        return this.billingInvoiceModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }
    async createBillingInvoice(data) {
        const orgId = data.organizationId || '1';
        return this.opsRunner.run({
            resource: 'BillingInvoice',
            op: 'create',
            user: {
                id: data.userId || '1',
                organizationId: orgId,
                branchId: data.branchId,
            },
            data,
            steps: [_010_check_period_lock_1.checkInvoicePeriodLockStep, _020_validate_lrs_1.validateInvoiceLrStep],
            execute: async (c) => {
                const dateStr = data.dueDate || data.date || new Date().toISOString().slice(0, 10);
                const invoiceNo = data.invoiceNo ||
                    data.id ||
                    (await this.sequenceService.next(c.organizationId, 'invoice', dateStr, c.t));
                const id = data.id || invoiceNo;
                const record = await this.billingInvoiceModel.create({
                    id,
                    invoiceNo,
                    lrRef: data.lrRef || '',
                    customer: data.customer || '',
                    baseAmt: data.baseAmt || '₹0',
                    gst: data.gst || '₹0 (RCM)',
                    total: data.total || '₹0',
                    gstType: data.gstType || 'RCM 5%',
                    irn: data.irn || '—',
                    dueDate: dateStr,
                    status: data.status || 'Draft',
                }, { transaction: c.t });
                if (c.state.lrRecord) {
                    try {
                        await c.state.lrRecord.update({ billingStatus: 'Invoiced', invoiceNo }, { transaction: c.t });
                    }
                    catch (_) { }
                }
                return record;
            },
        });
    }
    async updateBillingInvoice(id, data) {
        const record = await this.billingInvoiceModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { invoiceNo: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        }
        await record.update(data);
        return record;
    }
    async deleteBillingInvoice(id) {
        const record = await this.billingInvoiceModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id }, { invoiceNo: id }],
            },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        }
        await record.destroy();
        return { success: true, message: `Invoice ${id} deleted successfully` };
    }
    async findAllInvoices(organizationId, status) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (status)
            where.status = status;
        const invoices = await this.invoiceModel.findAll({
            where,
            include: [
                { model: models_1.CustomerModel, required: false },
                {
                    model: models_1.ShipmentModel,
                    required: false,
                    include: [
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
                { model: models_1.InvoiceItemModel, required: false },
                { model: models_1.PaymentModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        return invoices.map((inv) => {
            const plain = inv.get({ plain: true });
            return {
                ...plain,
                invoiceItems: plain.items || [],
            };
        });
    }
    async findInvoice(id) {
        const invoice = await this.invoiceModel.findByPk(id, {
            include: [
                { model: models_1.CustomerModel, required: false },
                {
                    model: models_1.ShipmentModel,
                    required: false,
                    include: [
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
                },
                { model: models_1.InvoiceItemModel, required: false },
                { model: models_1.PaymentModel, required: false },
            ],
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const plain = invoice.get({ plain: true });
        return {
            ...plain,
            invoiceItems: plain.items || [],
        };
    }
    async recordPayment(invoiceId, data) {
        const invoice = await this.findInvoice(invoiceId);
        const payment = await this.paymentModel.create({
            invoiceId,
            amount: parseFloat(data.amount) || 0.0,
            paymentMethod: data.paymentMethod || 'WIRE_TRANSFER',
            paymentReference: `PAY-${Date.now().toString().slice(-6)}`,
            transactionId: data.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
            status: 'COMPLETED',
        });
        const allPayments = await this.paymentModel.findAll({ where: { invoiceId } });
        const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const newStatus = totalPaid >= invoice.totalAmount ? 'PAID' : 'PARTIAL';
        await this.invoiceModel.update({ status: newStatus }, { where: { id: invoiceId } });
        return { payment, invoiceStatus: newStatus };
    }
    async auditCarrierInvoice(data) {
        const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
            include: [{ model: models_1.TransportOrderModel }],
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        const rate = await this.carrierRateModel.findOne({
            where: {
                carrierId: data.carrierId,
                originLocationId: shipment.transportOrder?.originLocationId,
                destinationLocationId: shipment.transportOrder?.destinationLocationId,
            },
        });
        const baseRate = rate?.baseRate || 2.2;
        const expectedCost = Math.round(data.distanceKm * baseRate * 100) / 100;
        const variance = Math.round((data.billedAmount - expectedCost) * 100) / 100;
        const variancePercent = Math.round((variance / (expectedCost || 1)) * 100 * 10) / 10;
        let auditStatus = 'APPROVED';
        const issues = [];
        if (variance > 50 || variancePercent > 5) {
            auditStatus = 'DISPUTED';
            issues.push(`Overcharged by $${variance} (${variancePercent}% higher than contract rate)`);
        }
        else if (variance < -50) {
            issues.push(`Billed amount is $${Math.abs(variance)} below contract rate`);
        }
        return {
            shipmentId: data.shipmentId,
            carrierId: data.carrierId,
            distanceKm: data.distanceKm,
            contractBaseRate: baseRate,
            expectedCost,
            billedAmount: data.billedAmount,
            variance,
            variancePercent,
            auditStatus,
            issues,
            auditDate: new Date().toISOString(),
        };
    }
    async findAllClaims(organizationId) {
        const isSystem = !organizationId || organizationId === 'SYSTEM';
        return this.claimModel.findAll({
            include: [
                {
                    model: models_1.ShipmentModel,
                    required: false,
                    include: [
                        { model: models_1.CustomerModel, required: false },
                        { model: models_1.CarrierModel, required: false },
                        {
                            model: models_1.TransportOrderModel,
                            required: false,
                            where: !isSystem ? { organizationId } : undefined,
                        },
                    ],
                },
                { model: models_1.ClaimItemModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    async createClaim(data) {
        const claimNumber = `CLM-${Date.now().toString().slice(-6)}`;
        const claim = await this.claimModel.create({
            claimNumber,
            shipmentId: data.shipmentId,
            claimType: data.type || 'DAMAGE',
            claimedAmount: parseFloat(data.amount) || 0.0,
            reason: data.description || 'Cargo damage during transit',
            status: 'FILED',
        });
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                await this.claimItemModel.create({
                    claimId: claim.id,
                    itemDescription: item.description || 'Damaged freight item',
                    quantityDamaged: parseInt(item.quantity, 10) || 1,
                    claimedCost: parseFloat(item.amount) || 0.0,
                });
            }
        }
        return this.claimModel.findByPk(claim.id, {
            include: [{ model: models_1.ClaimItemModel }],
        });
    }
    async updateClaimStatus(id, status) {
        const claim = await this.claimModel.findByPk(id);
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        await claim.update({ status });
        return claim;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.InvoiceItemModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.PaymentModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.CarrierRateModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.ClaimModel)),
    __param(6, (0, sequelize_1.InjectModel)(models_1.ClaimItemModel)),
    __param(7, (0, sequelize_1.InjectModel)(models_1.BillingInvoiceModel)),
    __param(8, (0, sequelize_1.InjectModel)(models_1.PurchaseBillModel)),
    __param(9, (0, sequelize_1.InjectModel)(models_1.SettlementModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, ops_runner_service_1.OpsRunnerService,
        document_sequence_service_1.DocumentSequenceService])
], BillingService);
//# sourceMappingURL=billing.service.js.map