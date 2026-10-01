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
exports.LorryReceiptModel = exports.ProofOfDeliveryModel = exports.GeofenceEventModel = exports.GeofenceModel = exports.TrackingEventModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
const operations_model_1 = require("../operations/operations.model");
const fleet_model_1 = require("../fleet/fleet.model");
let TrackingEventModel = class TrackingEventModel extends sequelize_typescript_1.Model {
};
exports.TrackingEventModel = TrackingEventModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TrackingEventModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TrackingEventModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.ShipmentModel)
], TrackingEventModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TrackingEventModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel),
    __metadata("design:type", fleet_model_1.VehicleModel)
], TrackingEventModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], TrackingEventModel.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], TrackingEventModel.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], TrackingEventModel.prototype, "speedKmH", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'NORMAL' }),
    __metadata("design:type", String)
], TrackingEventModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TrackingEventModel.prototype, "locationAddress", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TrackingEventModel.prototype, "timestamp", void 0);
exports.TrackingEventModel = TrackingEventModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tracking_events', timestamps: true, updatedAt: false })
], TrackingEventModel);
let GeofenceModel = class GeofenceModel extends sequelize_typescript_1.Model {
};
exports.GeofenceModel = GeofenceModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], GeofenceModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], GeofenceModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], GeofenceModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], GeofenceModel.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'CIRCLE' }),
    __metadata("design:type", String)
], GeofenceModel.prototype, "shapeType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], GeofenceModel.prototype, "centerLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], GeofenceModel.prototype, "centerLongitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 500.0 }),
    __metadata("design:type", Number)
], GeofenceModel.prototype, "radiusMeters", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], GeofenceModel.prototype, "polygonCoordinatesJson", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => GeofenceEventModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], GeofenceModel.prototype, "events", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], GeofenceModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], GeofenceModel.prototype, "updatedAt", void 0);
exports.GeofenceModel = GeofenceModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'geofences', timestamps: true })
], GeofenceModel);
let GeofenceEventModel = class GeofenceEventModel extends sequelize_typescript_1.Model {
};
exports.GeofenceEventModel = GeofenceEventModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], GeofenceEventModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => GeofenceModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], GeofenceEventModel.prototype, "geofenceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => GeofenceModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", GeofenceModel)
], GeofenceEventModel.prototype, "geofence", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], GeofenceEventModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel),
    __metadata("design:type", fleet_model_1.VehicleModel)
], GeofenceEventModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], GeofenceEventModel.prototype, "eventType", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], GeofenceEventModel.prototype, "eventTime", void 0);
exports.GeofenceEventModel = GeofenceEventModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'geofence_events', timestamps: true, updatedAt: false })
], GeofenceEventModel);
let ProofOfDeliveryModel = class ProofOfDeliveryModel extends sequelize_typescript_1.Model {
};
exports.ProofOfDeliveryModel = ProofOfDeliveryModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.ShipmentModel)
], ProofOfDeliveryModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "receiverName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "receiverPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "signatureData", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "photoUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ProofOfDeliveryModel.prototype, "otpCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], ProofOfDeliveryModel.prototype, "deliveredAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: true }),
    __metadata("design:type", Number)
], ProofOfDeliveryModel.prototype, "deliveryLatitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: true }),
    __metadata("design:type", Number)
], ProofOfDeliveryModel.prototype, "deliveryLongitude", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ProofOfDeliveryModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ProofOfDeliveryModel.prototype, "updatedAt", void 0);
exports.ProofOfDeliveryModel = ProofOfDeliveryModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'proof_of_deliveries', timestamps: true })
], ProofOfDeliveryModel);
let LorryReceiptModel = class LorryReceiptModel extends sequelize_typescript_1.Model {
};
exports.LorryReceiptModel = LorryReceiptModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.DispatchModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "dispatchId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.DispatchModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.DispatchModel)
], LorryReceiptModel.prototype, "dispatch", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.ShipmentModel)
], LorryReceiptModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "lrNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "consignorName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "consigneeName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LorryReceiptModel.prototype, "chargedWeightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LorryReceiptModel.prototype, "totalFreightAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ISSUED' }),
    __metadata("design:type", String)
], LorryReceiptModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], LorryReceiptModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], LorryReceiptModel.prototype, "updatedAt", void 0);
exports.LorryReceiptModel = LorryReceiptModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'lorry_receipts', timestamps: true })
], LorryReceiptModel);
//# sourceMappingURL=telematics.model.js.map