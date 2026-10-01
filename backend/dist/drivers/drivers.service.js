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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let DriversService = class DriversService extends base_service_1.BaseSequelizeService {
    constructor(driverModel, dispatchModel) {
        super(driverModel);
        this.driverModel = driverModel;
        this.dispatchModel = dispatchModel;
    }
    async findAll(organizationId, status) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (status) {
            where.status = status;
        }
        const drivers = await this.driverModel.findAll({
            where,
            include: [
                {
                    model: models_1.DriverAssignmentModel,
                    required: false,
                    where: { status: 'ACTIVE' },
                    include: [{ model: models_1.VehicleModel, required: false }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return drivers.map((d) => {
            const plain = d.get({ plain: true });
            return {
                ...plain,
                _count: {
                    shipments: 0,
                    dispatches: 0,
                },
            };
        });
    }
    async findOne(id) {
        if (typeof id === 'string') {
            const driver = await this.driverModel.findByPk(id, {
                include: [
                    { model: models_1.DriverDocumentModel, required: false },
                    {
                        model: models_1.DriverAssignmentModel,
                        required: false,
                        include: [{ model: models_1.VehicleModel, required: false }],
                    },
                ],
            });
            if (!driver)
                throw new common_1.NotFoundException('Driver not found');
            const plain = driver.get({ plain: true });
            return {
                ...plain,
                dispatches: [],
            };
        }
        return super.findOne(id);
    }
    async getDriverActiveTrip(driverId) {
        const dispatch = await this.dispatchModel.findOne({
            where: {
                driverId,
                status: {
                    [sequelize_2.Op.in]: ['ASSIGNED', 'DISPATCHED', 'DRIVER_ACCEPTED', 'PICKUP', 'IN_TRANSIT'],
                },
            },
            include: [
                {
                    model: models_1.ShipmentModel,
                    required: false,
                    include: [
                        { model: models_1.CustomerModel, required: false },
                        {
                            model: models_1.TransportOrderModel,
                            required: false,
                            include: [
                                { model: models_1.LocationModel, as: 'originLocation', required: false },
                                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                            ],
                        },
                        { model: models_1.ShipmentItemModel, required: false },
                        {
                            model: models_1.RouteModel,
                            required: false,
                            include: [{ model: models_1.RouteStopModel, required: false, include: [models_1.LocationModel] }],
                        },
                        { model: models_1.ProofOfDeliveryModel, required: false },
                    ],
                },
                { model: models_1.VehicleModel, required: false },
            ],
            order: [['dispatchTime', 'DESC']],
        });
        return dispatch;
    }
    async create(organizationIdOrData, body) {
        const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
        const data = body || organizationIdOrData;
        return this.driverModel.create({
            organizationId,
            employeeCode: data.employeeCode || `DRV-${Date.now().toString().slice(-4)}`,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email || null,
            licenseNumber: data.licenseNumber,
            licenseExpiry: new Date(data.licenseExpiry || Date.now() + 365 * 24 * 3600 * 1000),
            status: data.status || 'AVAILABLE',
        });
    }
    async remove(id) {
        return this.delete(id);
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __metadata("design:paramtypes", [Object, Object])
], DriversService);
//# sourceMappingURL=drivers.service.js.map