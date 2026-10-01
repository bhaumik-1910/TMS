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
exports.LorryReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
let LorryReceiptsService = class LorryReceiptsService {
    constructor(lrModel) {
        this.lrModel = lrModel;
    }
    async findAll(organizationId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where['$shipment.transportOrder.organizationId$'] = organizationId;
        }
        return this.lrModel.findAll({
            where,
            include: [
                {
                    model: models_1.ShipmentModel,
                    include: [
                        { model: models_1.CustomerModel, required: false },
                        { model: models_1.VehicleModel, required: false },
                        { model: models_1.DriverModel, required: false },
                        {
                            model: models_1.TransportOrderModel,
                            required: false,
                            include: [
                                { model: models_1.LocationModel, as: 'originLocation', required: false },
                                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                            ],
                        },
                        { model: models_1.ShipmentItemModel, required: false },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    async findOne(id) {
        const lr = await this.lrModel.findByPk(id, {
            include: [
                {
                    model: models_1.ShipmentModel,
                    include: [
                        { model: models_1.CustomerModel, required: false },
                        { model: models_1.VehicleModel, required: false },
                        { model: models_1.DriverModel, required: false },
                        { model: models_1.CarrierModel, required: false },
                        {
                            model: models_1.TransportOrderModel,
                            required: false,
                            include: [
                                { model: models_1.LocationModel, as: 'originLocation', required: false },
                                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                            ],
                        },
                        { model: models_1.ShipmentItemModel, required: false },
                    ],
                },
            ],
        });
        if (!lr)
            throw new common_1.NotFoundException('Lorry receipt not found');
        return lr;
    }
    async generateLR(data) {
        const lrNumber = `LR-${Date.now().toString().slice(-6)}`;
        let lr = await this.lrModel.findOne({ where: { shipmentId: data.shipmentId } });
        if (lr) {
            await lr.update({
                consignorName: data.consignorName,
                consigneeName: data.consigneeName,
            });
        }
        else {
            lr = await this.lrModel.create({
                lrNumber,
                shipmentId: data.shipmentId,
                consignorName: data.consignorName,
                consigneeName: data.consigneeName,
                chargedWeightKg: 0,
                totalFreightAmount: data.declaredValue || 45000,
                status: 'ISSUED',
            });
        }
        return this.findOne(lr.id);
    }
};
exports.LorryReceiptsService = LorryReceiptsService;
exports.LorryReceiptsService = LorryReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.LorryReceiptModel)),
    __metadata("design:paramtypes", [Object])
], LorryReceiptsService);
//# sourceMappingURL=lorry-receipts.service.js.map