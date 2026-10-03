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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let CustomersService = class CustomersService extends base_service_1.BaseSequelizeService {
    constructor(customerModel) {
        super(customerModel);
        this.customerModel = customerModel;
    }
    async findAll(organizationId, search) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (search) {
            where[sequelize_2.Op.or] = [
                { companyName: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { customerCode: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { email: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const customers = await this.customerModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
        return customers.map((c) => {
            const plain = c.get({ plain: true });
            return {
                ...plain,
                id: plain.id,
                name: plain.companyName,
                companyName: plain.companyName,
                subType: plain.subType || 'Customer',
                branch: plain.branch || 'Ahmedabad',
                gstin: plain.gstin || '—',
                pan: plain.pan || '',
                tdsSection: plain.tdsSection || '194C',
                creditLimit: plain.creditLimitStr || (plain.creditLimit ? `₹${Number(plain.creditLimit).toLocaleString('en-IN')}` : '—'),
                creditDays: plain.creditDays || '30',
                bankName: plain.bankName || 'HDFC Bank',
                accountNo: plain.accountNo || '',
                ifscCode: plain.ifscCode || '',
                mobile: plain.phone || '',
                phone: plain.phone || '',
                email: plain.email || '',
                status: plain.status === 'ACTIVE' || plain.status === 'Active' ? 'Active' : 'Inactive',
                _count: {
                    transportOrders: 0,
                    shipments: 0,
                    invoices: 0,
                },
            };
        });
    }
    async findOne(id) {
        if (typeof id === 'string') {
            const customer = await this.customerModel.findByPk(id);
            if (!customer)
                throw new common_1.NotFoundException('Customer not found');
            const plain = customer.get({ plain: true });
            return {
                ...plain,
                transportOrders: [],
                shipments: [],
                invoices: [],
            };
        }
        return super.findOne(id);
    }
    async create(organizationIdOrData, body) {
        const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
        const data = body || organizationIdOrData;
        return this.customerModel.create({
            organizationId,
            customerCode: data.customerCode || `CUST-${Date.now().toString().slice(-4)}`,
            companyName: data.name || data.companyName,
            contactName: data.contactName || null,
            email: data.email || null,
            phone: data.mobile || data.phone || null,
            billingAddress: data.billingAddress || null,
            shippingAddress: data.shippingAddress || null,
            creditLimit: parseFloat(String(data.creditLimit || '50000').replace(/[^0-9.]/g, '')) || 50000,
            creditLimitStr: data.creditLimit ? (String(data.creditLimit).startsWith('₹') ? data.creditLimit : `₹${data.creditLimit}`) : '—',
            paymentTerms: data.paymentTerms || 'NET_30',
            status: (data.status || 'Active').toUpperCase(),
            subType: data.subType || 'Customer',
            branch: data.branch || 'Ahmedabad',
            gstin: data.gstin || null,
            pan: data.pan || null,
            tdsSection: data.tdsSection || '194C',
            creditDays: data.creditDays || '30',
            bankName: data.bankName || null,
            accountNo: data.accountNo || null,
            ifscCode: data.ifscCode || null,
        });
    }
    async update(id, data) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
        let instance = null;
        if (isUuid) {
            instance = await this.customerModel.findByPk(id);
        }
        if (!instance) {
            instance = await this.customerModel.findOne({ where: { customerCode: id } });
        }
        if (!instance) {
            throw new common_1.NotFoundException(`Customer ${id} not found`);
        }
        const updateData = {
            companyName: data.name || data.companyName || instance.companyName,
            email: data.email !== undefined ? data.email : instance.email,
            phone: (data.mobile !== undefined ? data.mobile : data.phone) ?? instance.phone,
            status: data.status ? (data.status.toUpperCase() === 'ACTIVE' || data.status === 'Active' ? 'ACTIVE' : 'INACTIVE') : instance.status,
            subType: data.subType || instance.subType,
            branch: data.branch || instance.branch,
            gstin: data.gstin !== undefined ? data.gstin : instance.gstin,
            pan: data.pan !== undefined ? data.pan : instance.pan,
            tdsSection: data.tdsSection !== undefined ? data.tdsSection : instance.tdsSection,
            creditDays: data.creditDays !== undefined ? data.creditDays : instance.creditDays,
            creditLimitStr: data.creditLimit !== undefined ? data.creditLimit : instance.creditLimitStr,
            creditLimit: data.creditLimit ? parseFloat(String(data.creditLimit).replace(/[^0-9.]/g, '')) || instance.creditLimit : instance.creditLimit,
            bankName: data.bankName !== undefined ? data.bankName : instance.bankName,
            accountNo: data.accountNo !== undefined ? data.accountNo : instance.accountNo,
            ifscCode: data.ifscCode !== undefined ? data.ifscCode : instance.ifscCode,
        };
        if (typeof instance.update === 'function') {
            return instance.update(updateData);
        }
        await this.customerModel.update(updateData, { where: { id } });
        return this.customerModel.findByPk(id);
    }
    async remove(id) {
        return this.delete(id);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.CustomerModel)),
    __metadata("design:paramtypes", [Object])
], CustomersService);
//# sourceMappingURL=customers.service.js.map