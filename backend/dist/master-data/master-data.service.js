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
exports.MasterDataService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
let MasterDataService = class MasterDataService {
    constructor(locationModel, locationTypeModel, vehicleTypeModel, cargoTypeModel, packageTypeModel) {
        this.locationModel = locationModel;
        this.locationTypeModel = locationTypeModel;
        this.vehicleTypeModel = vehicleTypeModel;
        this.cargoTypeModel = cargoTypeModel;
        this.packageTypeModel = packageTypeModel;
    }
    async getLocations(organizationId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        return this.locationModel.findAll({
            where,
            include: [{ model: models_1.LocationTypeModel }],
            order: [['name', 'ASC']],
        });
    }
    async createLocation(organizationId, data) {
        return this.locationModel.create({
            organizationId,
            locationTypeId: data.locationTypeId || null,
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country || 'USA',
            postalCode: data.postalCode,
            latitude: parseFloat(data.latitude) || 0.0,
            longitude: parseFloat(data.longitude) || 0.0,
        });
    }
    async getLocationTypes() {
        return this.locationTypeModel.findAll({
            order: [['name', 'ASC']],
        });
    }
    async getVehicleTypes() {
        return this.vehicleTypeModel.findAll({
            order: [['name', 'ASC']],
        });
    }
    async getCargoTypes() {
        return this.cargoTypeModel.findAll({
            order: [['name', 'ASC']],
        });
    }
    async getPackageTypes() {
        return this.packageTypeModel.findAll({
            order: [['name', 'ASC']],
        });
    }
};
exports.MasterDataService = MasterDataService;
exports.MasterDataService = MasterDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.LocationModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.LocationTypeModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleTypeModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.CargoTypeModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.PackageTypeModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MasterDataService);
//# sourceMappingURL=master-data.service.js.map