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
exports.CarriersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let CarriersService = class CarriersService extends base_service_1.BaseSequelizeService {
    constructor(carrierModel, carrierRateModel) {
        super(carrierModel);
        this.carrierModel = carrierModel;
        this.carrierRateModel = carrierRateModel;
    }
    async findAll(organizationId, search) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (search) {
            where[sequelize_2.Op.or] = [
                { companyName: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { carrierCode: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { contactName: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const carriers = await this.carrierModel.findAll({
            where,
            include: [
                { model: models_1.CarrierContractModel, required: false },
                { model: models_1.CarrierRateModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        return carriers.map((c) => {
            const plain = c.get({ plain: true });
            return {
                ...plain,
                _count: {
                    shipments: 0,
                    tenderRequests: 0,
                },
            };
        });
    }
    async findOne(id) {
        if (typeof id === 'string') {
            const carrier = await this.carrierModel.findByPk(id, {
                include: [
                    { model: models_1.CarrierContractModel, required: false },
                    { model: models_1.CarrierRateModel, required: false },
                    { model: models_1.CarrierDocumentModel, required: false },
                ],
            });
            if (!carrier)
                throw new common_1.NotFoundException('Carrier not found');
            const plain = carrier.get({ plain: true });
            return {
                ...plain,
                tenderRequests: [],
            };
        }
        return super.findOne(id);
    }
    async create(organizationIdOrData, body) {
        const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
        const data = body || organizationIdOrData;
        return this.carrierModel.create({
            organizationId,
            carrierCode: data.carrierCode || `CARR-${Date.now().toString().slice(-4)}`,
            companyName: data.companyName,
            contactName: data.contactName || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            taxNumber: data.taxNumber || null,
            rating: parseFloat(data.rating || '4.8'),
            status: data.status || 'ACTIVE',
        });
    }
    async remove(id) {
        return this.delete(id);
    }
    async addRate(carrierId, rateData) {
        return this.carrierRateModel.create({
            carrierId,
            originLocationId: rateData.originLocationId,
            destinationLocationId: rateData.destinationLocationId,
            baseRate: parseFloat(rateData.baseRate) || 0.0,
            rateType: rateData.rateType || 'PER_KM',
            validFrom: new Date(rateData.validFrom || Date.now()),
            validTo: new Date(rateData.validTo || Date.now() + 365 * 24 * 3600 * 1000),
            status: 'ACTIVE',
        });
    }
};
exports.CarriersService = CarriersService;
exports.CarriersService = CarriersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.CarrierModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.CarrierRateModel)),
    __metadata("design:paramtypes", [Object, Object])
], CarriersService);
//# sourceMappingURL=carriers.service.js.map