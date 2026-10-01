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
            companyName: data.companyName,
            contactName: data.contactName || null,
            email: data.email || null,
            phone: data.phone || null,
            billingAddress: data.billingAddress || null,
            shippingAddress: data.shippingAddress || null,
            creditLimit: parseFloat(data.creditLimit || '50000'),
            paymentTerms: data.paymentTerms || 'NET_30',
            status: data.status || 'ACTIVE',
        });
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