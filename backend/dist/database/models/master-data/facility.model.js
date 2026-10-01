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
exports.AppointmentModel = exports.DockModel = exports.FacilityModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
const master_data_model_1 = require("./master-data.model");
let FacilityModel = class FacilityModel extends sequelize_typescript_1.Model {
};
exports.FacilityModel = FacilityModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], FacilityModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], FacilityModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], FacilityModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], FacilityModel.prototype, "locationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel),
    __metadata("design:type", master_data_model_1.LocationModel)
], FacilityModel.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], FacilityModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], FacilityModel.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'DISTRIBUTION_CENTER' }),
    __metadata("design:type", String)
], FacilityModel.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 10 }),
    __metadata("design:type", Number)
], FacilityModel.prototype, "capacityDocks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ACTIVE' }),
    __metadata("design:type", String)
], FacilityModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DockModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], FacilityModel.prototype, "docks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], FacilityModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], FacilityModel.prototype, "updatedAt", void 0);
exports.FacilityModel = FacilityModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'facilities', timestamps: true })
], FacilityModel);
let DockModel = class DockModel extends sequelize_typescript_1.Model {
};
exports.DockModel = DockModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DockModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FacilityModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DockModel.prototype, "facilityId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FacilityModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", FacilityModel)
], DockModel.prototype, "facility", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DockModel.prototype, "dockNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'CROSS_DOCK' }),
    __metadata("design:type", String)
], DockModel.prototype, "dockType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'AVAILABLE' }),
    __metadata("design:type", String)
], DockModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AppointmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], DockModel.prototype, "appointments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DockModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DockModel.prototype, "updatedAt", void 0);
exports.DockModel = DockModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'docks', timestamps: true })
], DockModel);
let AppointmentModel = class AppointmentModel extends sequelize_typescript_1.Model {
};
exports.AppointmentModel = AppointmentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], AppointmentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => DockModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], AppointmentModel.prototype, "dockId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => DockModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", DockModel)
], AppointmentModel.prototype, "dock", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], AppointmentModel.prototype, "appointmentNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], AppointmentModel.prototype, "scheduledTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 60 }),
    __metadata("design:type", Number)
], AppointmentModel.prototype, "estimatedDurationMinutes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'SCHEDULED' }),
    __metadata("design:type", String)
], AppointmentModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], AppointmentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], AppointmentModel.prototype, "updatedAt", void 0);
exports.AppointmentModel = AppointmentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'appointments', timestamps: true })
], AppointmentModel);
//# sourceMappingURL=facility.model.js.map