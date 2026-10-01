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
exports.DriverAssignmentModel = exports.DriverDocumentModel = exports.DriverModel = exports.VehicleMaintenanceModel = exports.VehicleDocumentModel = exports.VehicleModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
const user_model_1 = require("../auth/user.model");
const partners_model_1 = require("../partners/partners.model");
const master_data_model_1 = require("../master-data/master-data.model");
let VehicleModel = class VehicleModel extends sequelize_typescript_1.Model {
};
exports.VehicleModel = VehicleModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], VehicleModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], VehicleModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.VehicleTypeModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], VehicleModel.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.VehicleTypeModel),
    __metadata("design:type", master_data_model_1.VehicleTypeModel)
], VehicleModel.prototype, "vehicleType", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], VehicleModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], VehicleModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], VehicleModel.prototype, "vehicleNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleModel.prototype, "make", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleModel.prototype, "model", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "year", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], VehicleModel.prototype, "vin", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 25000.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "capacityWeight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 80.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "capacityVolume", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'DIESEL' }),
    __metadata("design:type", String)
], VehicleModel.prototype, "fuelType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'AVAILABLE' }),
    __metadata("design:type", String)
], VehicleModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "currentLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "currentLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "currentSpeed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], VehicleModel.prototype, "lastLocationAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 100.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "fuelLevelPercent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], VehicleModel.prototype, "currentOdometerKm", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => VehicleMaintenanceModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], VehicleModel.prototype, "maintenances", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => VehicleDocumentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], VehicleModel.prototype, "documents", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DriverAssignmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], VehicleModel.prototype, "driverAssignments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], VehicleModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], VehicleModel.prototype, "updatedAt", void 0);
exports.VehicleModel = VehicleModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'vehicles', timestamps: true })
], VehicleModel);
let VehicleDocumentModel = class VehicleDocumentModel extends sequelize_typescript_1.Model {
};
exports.VehicleDocumentModel = VehicleDocumentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], VehicleDocumentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleDocumentModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => VehicleModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", VehicleModel)
], VehicleDocumentModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleDocumentModel.prototype, "documentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleDocumentModel.prototype, "documentNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], VehicleDocumentModel.prototype, "expiryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleDocumentModel.prototype, "fileUrl", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], VehicleDocumentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], VehicleDocumentModel.prototype, "updatedAt", void 0);
exports.VehicleDocumentModel = VehicleDocumentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'vehicle_documents', timestamps: true })
], VehicleDocumentModel);
let VehicleMaintenanceModel = class VehicleMaintenanceModel extends sequelize_typescript_1.Model {
};
exports.VehicleMaintenanceModel = VehicleMaintenanceModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], VehicleMaintenanceModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleMaintenanceModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => VehicleModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", VehicleModel)
], VehicleMaintenanceModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], VehicleMaintenanceModel.prototype, "maintenanceType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], VehicleMaintenanceModel.prototype, "scheduledDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], VehicleMaintenanceModel.prototype, "completedDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], VehicleMaintenanceModel.prototype, "cost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'SCHEDULED' }),
    __metadata("design:type", String)
], VehicleMaintenanceModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], VehicleMaintenanceModel.prototype, "notes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], VehicleMaintenanceModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], VehicleMaintenanceModel.prototype, "updatedAt", void 0);
exports.VehicleMaintenanceModel = VehicleMaintenanceModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'vehicle_maintenances', timestamps: true })
], VehicleMaintenanceModel);
let DriverModel = class DriverModel extends sequelize_typescript_1.Model {
};
exports.DriverModel = DriverModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DriverModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], DriverModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.UserModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DriverModel.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.UserModel),
    __metadata("design:type", user_model_1.UserModel)
], DriverModel.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DriverModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], DriverModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "employeeCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "firstName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "lastName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DriverModel.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], DriverModel.prototype, "licenseNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], DriverModel.prototype, "licenseExpiry", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, defaultValue: 4.8 }),
    __metadata("design:type", Number)
], DriverModel.prototype, "safetyScore", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'AVAILABLE' }),
    __metadata("design:type", String)
], DriverModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: true }),
    __metadata("design:type", Number)
], DriverModel.prototype, "currentLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: true }),
    __metadata("design:type", Number)
], DriverModel.prototype, "currentLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DriverDocumentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], DriverModel.prototype, "documents", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DriverAssignmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], DriverModel.prototype, "assignments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DriverModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DriverModel.prototype, "updatedAt", void 0);
exports.DriverModel = DriverModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'drivers', timestamps: true })
], DriverModel);
let DriverDocumentModel = class DriverDocumentModel extends sequelize_typescript_1.Model {
};
exports.DriverDocumentModel = DriverDocumentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DriverDocumentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => DriverModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverDocumentModel.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => DriverModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", DriverModel)
], DriverDocumentModel.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverDocumentModel.prototype, "documentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverDocumentModel.prototype, "documentNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], DriverDocumentModel.prototype, "expiryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverDocumentModel.prototype, "fileUrl", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DriverDocumentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DriverDocumentModel.prototype, "updatedAt", void 0);
exports.DriverDocumentModel = DriverDocumentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'driver_documents', timestamps: true })
], DriverDocumentModel);
let DriverAssignmentModel = class DriverAssignmentModel extends sequelize_typescript_1.Model {
};
exports.DriverAssignmentModel = DriverAssignmentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DriverAssignmentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => DriverModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverAssignmentModel.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => DriverModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", DriverModel)
], DriverAssignmentModel.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverAssignmentModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => VehicleModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", VehicleModel)
], DriverAssignmentModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], DriverAssignmentModel.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], DriverAssignmentModel.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], DriverAssignmentModel.prototype, "releasedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ACTIVE' }),
    __metadata("design:type", String)
], DriverAssignmentModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DriverAssignmentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DriverAssignmentModel.prototype, "updatedAt", void 0);
exports.DriverAssignmentModel = DriverAssignmentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'driver_assignments', timestamps: true })
], DriverAssignmentModel);
//# sourceMappingURL=fleet.model.js.map