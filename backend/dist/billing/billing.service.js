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
const models_1 = require("../database/models");
let BillingService = class BillingService {
    constructor(invoiceModel, invoiceItemModel, paymentModel, shipmentModel, carrierRateModel, claimModel, claimItemModel) {
        this.invoiceModel = invoiceModel;
        this.invoiceItemModel = invoiceItemModel;
        this.paymentModel = paymentModel;
        this.shipmentModel = shipmentModel;
        this.carrierRateModel = carrierRateModel;
        this.claimModel = claimModel;
        this.claimItemModel = claimItemModel;
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
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], BillingService);
//# sourceMappingURL=billing.service.js.map