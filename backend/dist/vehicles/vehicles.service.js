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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let VehiclesService = class VehiclesService extends base_service_1.BaseSequelizeService {
    constructor(vehicleModel, maintenanceModel) {
        super(vehicleModel);
        this.vehicleModel = vehicleModel;
        this.maintenanceModel = maintenanceModel;
    }
    async findAll(organizationId, status) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (status) {
            where.status = status;
        }
        const vehicles = await this.vehicleModel.findAll({
            where,
            include: [
                { model: models_1.VehicleTypeModel, required: false },
                {
                    model: models_1.DriverAssignmentModel,
                    required: false,
                    where: { status: 'ACTIVE' },
                    include: [{ model: models_1.DriverModel, required: false }],
                },
                { model: models_1.VehicleMaintenanceModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        return vehicles.map((v) => {
            const plain = v.get({ plain: true });
            return {
                ...plain,
                _count: {
                    shipments: 0,
                    maintenanceRecords: plain.maintenances ? plain.maintenances.length : 0,
                },
            };
        });
    }
    async findOne(id) {
        if (typeof id === 'string') {
            const vehicle = await this.vehicleModel.findByPk(id, {
                include: [
                    { model: models_1.VehicleTypeModel, required: false },
                    { model: models_1.VehicleDocumentModel, required: false },
                    { model: models_1.VehicleMaintenanceModel, required: false },
                    {
                        model: models_1.DriverAssignmentModel,
                        required: false,
                        include: [{ model: models_1.DriverModel, required: false }],
                    },
                ],
            });
            if (!vehicle)
                throw new common_1.NotFoundException('Vehicle not found');
            const plain = vehicle.get({ plain: true });
            return {
                ...plain,
                maintenanceRecords: plain.maintenances || [],
                shipments: [],
            };
        }
        return super.findOne(id);
    }
    async create(organizationIdOrData, body) {
        const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
        const data = body || organizationIdOrData;
        return this.vehicleModel.create({
            organizationId,
            vehicleTypeId: data.vehicleTypeId || null,
            carrierId: data.carrierId || null,
            vehicleNumber: data.vehicleNumber,
            make: data.make,
            model: data.model,
            year: parseInt(data.year || '2023', 10),
            vin: data.vin || null,
            capacityWeight: parseFloat(data.capacityWeight) || 25000.0,
            capacityVolume: parseFloat(data.capacityVolume) || 80.0,
            fuelType: data.fuelType || 'DIESEL',
            status: data.status || 'AVAILABLE',
            currentLatitude: data.currentLatitude ? parseFloat(data.currentLatitude) : 37.7749,
            currentLongitude: data.currentLongitude ? parseFloat(data.currentLongitude) : -122.4194,
            currentSpeed: 0,
            lastLocationAt: new Date(),
        });
    }
    async updateLocation(id, lat, lng, speed = 0) {
        const vehicle = await this.findById(id);
        return vehicle.update({
            currentLatitude: lat,
            currentLongitude: lng,
            currentSpeed: speed,
            lastLocationAt: new Date(),
        });
    }
    async addMaintenance(vehicleId, data) {
        return this.maintenanceModel.create({
            vehicleId,
            maintenanceType: data.serviceType || data.maintenanceType || 'REGULAR_SERVICE',
            scheduledDate: new Date(data.serviceDate || Date.now()),
            completedDate: data.status === 'COMPLETED' ? new Date() : null,
            cost: parseFloat(data.cost) || 0.0,
            status: data.status || 'COMPLETED',
            notes: data.notes || null,
        });
    }
    async remove(id) {
        return this.delete(id);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.VehicleMaintenanceModel)),
    __metadata("design:paramtypes", [Object, Object])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map