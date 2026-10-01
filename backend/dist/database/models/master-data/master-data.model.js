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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageTypeModel = exports.CargoTypeModel = exports.VehicleTypeModel = exports.LocationModel = exports.LocationTypeModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
let LocationTypeModel = class LocationTypeModel extends sequelize_typescript_1.Model {
};
exports.LocationTypeModel = LocationTypeModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], LocationTypeModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], LocationTypeModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LocationTypeModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LocationTypeModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => LocationModel),
    __metadata("design:type", Array)
], LocationTypeModel.prototype, "locations", void 0);
exports.LocationTypeModel = LocationTypeModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'location_types', timestamps: true })
], LocationTypeModel);
let LocationModel = class LocationModel extends sequelize_typescript_1.Model {
};
exports.LocationModel = LocationModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], LocationModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LocationModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], LocationModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => LocationTypeModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LocationModel.prototype, "locationTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => LocationTypeModel),
    __metadata("design:type", LocationTypeModel)
], LocationModel.prototype, "locationType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LocationModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LocationModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LocationModel.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LocationModel.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LocationModel.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'USA' }),
    __metadata("design:type", String)
], LocationModel.prototype, "country", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LocationModel.prototype, "postalCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LocationModel.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LocationModel.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ACTIVE' }),
    __metadata("design:type", String)
], LocationModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], LocationModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], LocationModel.prototype, "updatedAt", void 0);
exports.LocationModel = LocationModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'locations', timestamps: true })
], LocationModel);
let VehicleTypeModel = class VehicleTypeModel extends sequelize_typescript_1.Model {
};
exports.VehicleTypeModel = VehicleTypeModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], VehicleTypeModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], VehicleTypeModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleTypeModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], VehicleTypeModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], VehicleTypeModel.prototype, "maxWeightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], VehicleTypeModel.prototype, "maxVolumeCbm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 2 }),
    __metadata("design:type", Number)
], VehicleTypeModel.prototype, "axleCount", void 0);
exports.VehicleTypeModel = VehicleTypeModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'vehicle_types', timestamps: true })
], VehicleTypeModel);
let CargoTypeModel = class CargoTypeModel extends sequelize_typescript_1.Model {
};
exports.CargoTypeModel = CargoTypeModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], CargoTypeModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], CargoTypeModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], CargoTypeModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], CargoTypeModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], CargoTypeModel.prototype, "isHazardous", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], CargoTypeModel.prototype, "requiresTempControl", void 0);
exports.CargoTypeModel = CargoTypeModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'cargo_types', timestamps: true })
], CargoTypeModel);
let PackageTypeModel = class PackageTypeModel extends sequelize_typescript_1.Model {
};
exports.PackageTypeModel = PackageTypeModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PackageTypeModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], PackageTypeModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PackageTypeModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PackageTypeModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 1.0 }),
    __metadata("design:type", Number)
], PackageTypeModel.prototype, "standardWeightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 1.0 }),
    __metadata("design:type", Number)
], PackageTypeModel.prototype, "standardVolumeCbm", void 0);
exports.PackageTypeModel = PackageTypeModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'package_types', timestamps: true })
], PackageTypeModel);
//# sourceMappingURL=master-data.model.js.map