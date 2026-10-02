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
const sequelize_2 = require("sequelize");
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
        else {
            where.status = { [sequelize_2.Op.ne]: 'INACTIVE' };
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
                id: plain.id,
                regNo: plain.vehicleNumber,
                makeModel: `${plain.make} ${plain.model}`.trim(),
                make: plain.make,
                model: plain.model,
                type: plain.vehicleTypeStr || plain.vehicleType?.name || 'HCV',
                owner: plain.owner || 'Owned',
                capacity: plain.capacity || `${plain.capacityWeight ? plain.capacityWeight / 1000 : 16} MT`,
                mfgYear: plain.mfgYear || String(plain.year || '2022'),
                targetKmpl: plain.targetKmpl || '5.5',
                chassisNo: plain.chassisNo || plain.vin || 'MAT4451...',
                engineNo: plain.engineNo || '4928AB...',
                gpsId: plain.gpsId || 'GPS-001',
                fastagId: plain.fastagId || 'FT-GJ-1122',
                status: plain.status || 'Active',
                rcExpiry: plain.rcExpiry || '2031-01-18',
                fitness: plain.fitness || '2026-01-18',
                insurance: plain.insurance || '2025-01-10',
                puc: plain.puc || '2025-03-10',
                permitExpiry: plain.permitExpiry || '2026-06-01',
                roadTaxExpiry: plain.roadTaxExpiry || '2030-01-01',
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
            vehicleNumber: data.vehicleNumber || data.regNo,
            make: data.make || (data.makeModel ? data.makeModel.split(' ')[0] : 'Tata'),
            model: data.model || (data.makeModel ? data.makeModel.split(' ').slice(1).join(' ') : 'Prima'),
            year: parseInt(data.year || data.mfgYear || '2022', 10),
            vin: data.vin || data.chassisNo || null,
            capacityWeight: parseFloat(data.capacityWeight || data.capacity) || 16000.0,
            capacityVolume: parseFloat(data.capacityVolume) || 80.0,
            fuelType: data.fuelType || 'DIESEL',
            status: data.status || 'Active',
            vehicleTypeStr: data.vehicleTypeStr || data.type || 'HCV',
            owner: data.owner || 'Owned',
            capacity: data.capacity || '16 MT',
            targetKmpl: data.targetKmpl || '5.5',
            chassisNo: data.chassisNo || null,
            engineNo: data.engineNo || null,
            gpsId: data.gpsId || null,
            fastagId: data.fastagId || null,
            mfgYear: data.mfgYear || String(data.year || '2022'),
            rcExpiry: data.rcExpiry || null,
            fitness: data.fitness || null,
            insurance: data.insurance || null,
            puc: data.puc || null,
            permitExpiry: data.permitExpiry || null,
            roadTaxExpiry: data.roadTaxExpiry || null,
            currentLatitude: data.currentLatitude ? parseFloat(data.currentLatitude) : 37.7749,
            currentLongitude: data.currentLongitude ? parseFloat(data.currentLongitude) : -122.4194,
            currentSpeed: 0,
            lastLocationAt: new Date(),
        });
    }
    async update(id, data) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
        let vehicle = null;
        if (isUuid) {
            vehicle = await this.vehicleModel.findByPk(id);
        }
        if (!vehicle) {
            vehicle = await this.vehicleModel.findOne({
                where: {
                    vehicleNumber: data.vehicleNumber || data.regNo || id,
                },
            });
        }
        if (!vehicle) {
            return this.create({
                vehicleNumber: data.vehicleNumber || data.regNo || 'GJ-01-AB-1122',
                make: data.make || 'Tata',
                model: data.model || 'Prima 4928.S',
                year: data.year || data.mfgYear ? parseInt(data.year || data.mfgYear, 10) : 2022,
                vin: data.vin || data.chassisNo || 'MAT4451...',
                status: data.status || 'Active',
                vehicleTypeStr: data.vehicleTypeStr || data.type || 'HCV',
                owner: data.owner || 'Owned',
                capacity: data.capacity || '16 MT',
                targetKmpl: data.targetKmpl !== undefined ? data.targetKmpl : '5.5',
                chassisNo: data.chassisNo,
                engineNo: data.engineNo,
                gpsId: data.gpsId,
                fastagId: data.fastagId,
                mfgYear: data.mfgYear,
                rcExpiry: data.rcExpiry,
                fitness: data.fitness,
                insurance: data.insurance,
                puc: data.puc,
                permitExpiry: data.permitExpiry,
                roadTaxExpiry: data.roadTaxExpiry,
            });
        }
        return vehicle.update({
            vehicleNumber: data.vehicleNumber || data.regNo || vehicle.vehicleNumber,
            make: data.make !== undefined ? data.make : vehicle.make,
            model: data.model !== undefined ? data.model : vehicle.model,
            year: data.year || data.mfgYear ? parseInt(data.year || data.mfgYear, 10) : vehicle.year,
            vin: data.vin || data.chassisNo || vehicle.vin,
            status: data.status || vehicle.status,
            vehicleTypeStr: data.vehicleTypeStr || data.type || vehicle.vehicleTypeStr,
            owner: data.owner || vehicle.owner,
            capacity: data.capacity || vehicle.capacity,
            targetKmpl: data.targetKmpl !== undefined ? data.targetKmpl : vehicle.targetKmpl,
            chassisNo: data.chassisNo !== undefined ? data.chassisNo : vehicle.chassisNo,
            engineNo: data.engineNo !== undefined ? data.engineNo : vehicle.engineNo,
            gpsId: data.gpsId !== undefined ? data.gpsId : vehicle.gpsId,
            fastagId: data.fastagId !== undefined ? data.fastagId : vehicle.fastagId,
            mfgYear: data.mfgYear || vehicle.mfgYear,
            rcExpiry: data.rcExpiry !== undefined ? data.rcExpiry : vehicle.rcExpiry,
            fitness: data.fitness !== undefined ? data.fitness : vehicle.fitness,
            insurance: data.insurance !== undefined ? data.insurance : vehicle.insurance,
            puc: data.puc !== undefined ? data.puc : vehicle.puc,
            permitExpiry: data.permitExpiry !== undefined ? data.permitExpiry : vehicle.permitExpiry,
            roadTaxExpiry: data.roadTaxExpiry !== undefined ? data.roadTaxExpiry : vehicle.roadTaxExpiry,
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
        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
            let vehicle = null;
            if (isUuid) {
                vehicle = await this.vehicleModel.findByPk(id);
            }
            if (!vehicle) {
                vehicle = await this.vehicleModel.findOne({
                    where: { vehicleNumber: id },
                });
            }
            if (vehicle) {
                try {
                    await vehicle.destroy();
                }
                catch {
                    await vehicle.update({ status: 'INACTIVE' });
                }
                return { success: true, message: `Vehicle ${id} removed` };
            }
            return { success: true, message: `Vehicle ${id} removed` };
        }
        catch (err) {
            console.warn(`[VehiclesService] Safe delete for vehicle ${id}:`, err?.message);
            return { success: true, message: `Vehicle ${id} removed`, warning: err?.message };
        }
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