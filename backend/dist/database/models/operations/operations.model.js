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
exports.SettlementModel = exports.PurchaseBillModel = exports.BillingInvoiceModel = exports.PodRecordModel = exports.JobCardModel = exports.TyreInventoryModel = exports.TyreEventModel = exports.DriverAdvanceModel = exports.TenderRequestModel = exports.DispatchModel = exports.LoadPlanItemModel = exports.LoadPlanModel = exports.RouteStopModel = exports.RouteModel = exports.ShipmentItemModel = exports.ShipmentModel = exports.OrderItemModel = exports.TransportOrderModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
const partners_model_1 = require("../partners/partners.model");
const master_data_model_1 = require("../master-data/master-data.model");
const fleet_model_1 = require("../fleet/fleet.model");
let TransportOrderModel = class TransportOrderModel extends sequelize_typescript_1.Model {
};
exports.TransportOrderModel = TransportOrderModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], TransportOrderModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CustomerModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CustomerModel),
    __metadata("design:type", partners_model_1.CustomerModel)
], TransportOrderModel.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "orderNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'NORMAL' }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "priority", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "lrNo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "bookingDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "consignor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "consignee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "billingParty", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "origin", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "destination", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "actualWeight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "chargedWt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "freightBasis", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "rate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "ewayBill", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "assignedVehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "assignedDriver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "branch", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "originLocationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel, 'originLocationId'),
    __metadata("design:type", master_data_model_1.LocationModel)
], TransportOrderModel.prototype, "originLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "destinationLocationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel, 'destinationLocationId'),
    __metadata("design:type", master_data_model_1.LocationModel)
], TransportOrderModel.prototype, "destinationLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], TransportOrderModel.prototype, "requestedPickupDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], TransportOrderModel.prototype, "requestedDeliveryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], TransportOrderModel.prototype, "totalWeight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], TransportOrderModel.prototype, "totalVolume", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], TransportOrderModel.prototype, "totalPackages", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'DRAFT' }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "specialInstructions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => OrderItemModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], TransportOrderModel.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ShipmentModel),
    __metadata("design:type", Array)
], TransportOrderModel.prototype, "shipments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TransportOrderModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], TransportOrderModel.prototype, "updatedAt", void 0);
exports.TransportOrderModel = TransportOrderModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'transport_orders', timestamps: true })
], TransportOrderModel);
let OrderItemModel = class OrderItemModel extends sequelize_typescript_1.Model {
};
exports.OrderItemModel = OrderItemModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderItemModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => TransportOrderModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], OrderItemModel.prototype, "transportOrderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => TransportOrderModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", TransportOrderModel)
], OrderItemModel.prototype, "transportOrder", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], OrderItemModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1 }),
    __metadata("design:type", Number)
], OrderItemModel.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Pallet' }),
    __metadata("design:type", String)
], OrderItemModel.prototype, "packageType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], OrderItemModel.prototype, "packageTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], OrderItemModel.prototype, "cargoTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], OrderItemModel.prototype, "weight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], OrderItemModel.prototype, "volume", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], OrderItemModel.prototype, "fragile", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], OrderItemModel.prototype, "hazardous", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], OrderItemModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], OrderItemModel.prototype, "updatedAt", void 0);
exports.OrderItemModel = OrderItemModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'order_items', timestamps: true })
], OrderItemModel);
let ShipmentModel = class ShipmentModel extends sequelize_typescript_1.Model {
};
exports.ShipmentModel = ShipmentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ShipmentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => TransportOrderModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "transportOrderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => TransportOrderModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", TransportOrderModel)
], ShipmentModel.prototype, "transportOrder", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "shipmentNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CustomerModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CustomerModel),
    __metadata("design:type", partners_model_1.CustomerModel)
], ShipmentModel.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], ShipmentModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel),
    __metadata("design:type", fleet_model_1.VehicleModel)
], ShipmentModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.DriverModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.DriverModel),
    __metadata("design:type", fleet_model_1.DriverModel)
], ShipmentModel.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "routeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ROAD' }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "mode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ShipmentModel.prototype, "distanceKm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], ShipmentModel.prototype, "plannedPickup", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], ShipmentModel.prototype, "actualPickup", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], ShipmentModel.prototype, "plannedDelivery", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], ShipmentModel.prototype, "actualDelivery", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ShipmentModel.prototype, "totalWeight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ShipmentModel.prototype, "totalVolume", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'CREATED' }),
    __metadata("design:type", String)
], ShipmentModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ShipmentModel.prototype, "freightCost", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ShipmentItemModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], ShipmentModel.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RouteModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], ShipmentModel.prototype, "routes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DispatchModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], ShipmentModel.prototype, "dispatches", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ShipmentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ShipmentModel.prototype, "updatedAt", void 0);
exports.ShipmentModel = ShipmentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'shipments', timestamps: true })
], ShipmentModel);
let ShipmentItemModel = class ShipmentItemModel extends sequelize_typescript_1.Model {
};
exports.ShipmentItemModel = ShipmentItemModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ShipmentItemModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ShipmentItemModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ShipmentModel)
], ShipmentItemModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => OrderItemModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ShipmentItemModel.prototype, "orderItemId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => OrderItemModel),
    __metadata("design:type", OrderItemModel)
], ShipmentItemModel.prototype, "orderItem", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1 }),
    __metadata("design:type", Number)
], ShipmentItemModel.prototype, "allocatedQuantity", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ShipmentItemModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ShipmentItemModel.prototype, "updatedAt", void 0);
exports.ShipmentItemModel = ShipmentItemModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'shipment_items', timestamps: true })
], ShipmentItemModel);
let RouteModel = class RouteModel extends sequelize_typescript_1.Model {
};
exports.RouteModel = RouteModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], RouteModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RouteModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ShipmentModel)
], RouteModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RouteModel.prototype, "routeName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], RouteModel.prototype, "totalDistanceKm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], RouteModel.prototype, "estimatedDurationMinutes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], RouteModel.prototype, "geometryPolyline", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RouteStopModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], RouteModel.prototype, "stops", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], RouteModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], RouteModel.prototype, "updatedAt", void 0);
exports.RouteModel = RouteModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'routes', timestamps: true })
], RouteModel);
let RouteStopModel = class RouteStopModel extends sequelize_typescript_1.Model {
};
exports.RouteStopModel = RouteStopModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], RouteStopModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RouteModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RouteStopModel.prototype, "routeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RouteModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", RouteModel)
], RouteStopModel.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], RouteStopModel.prototype, "locationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel),
    __metadata("design:type", master_data_model_1.LocationModel)
], RouteStopModel.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], RouteStopModel.prototype, "stopSequence", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'PICKUP' }),
    __metadata("design:type", String)
], RouteStopModel.prototype, "stopType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], RouteStopModel.prototype, "estimatedArrival", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], RouteStopModel.prototype, "actualArrival", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'PENDING' }),
    __metadata("design:type", String)
], RouteStopModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], RouteStopModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], RouteStopModel.prototype, "updatedAt", void 0);
exports.RouteStopModel = RouteStopModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'route_stops', timestamps: true })
], RouteStopModel);
let LoadPlanModel = class LoadPlanModel extends sequelize_typescript_1.Model {
};
exports.LoadPlanModel = LoadPlanModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], LoadPlanModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], LoadPlanModel.prototype, "planNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LoadPlanModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel),
    __metadata("design:type", fleet_model_1.VehicleModel)
], LoadPlanModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LoadPlanModel.prototype, "plannedWeightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LoadPlanModel.prototype, "plannedVolumeCbm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LoadPlanModel.prototype, "weightUtilizationPercent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], LoadPlanModel.prototype, "volumeUtilizationPercent", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'DRAFT' }),
    __metadata("design:type", String)
], LoadPlanModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => LoadPlanItemModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], LoadPlanModel.prototype, "items", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], LoadPlanModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], LoadPlanModel.prototype, "updatedAt", void 0);
exports.LoadPlanModel = LoadPlanModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'load_plans', timestamps: true })
], LoadPlanModel);
let LoadPlanItemModel = class LoadPlanItemModel extends sequelize_typescript_1.Model {
};
exports.LoadPlanItemModel = LoadPlanItemModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], LoadPlanItemModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => LoadPlanModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LoadPlanItemModel.prototype, "loadPlanId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => LoadPlanModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", LoadPlanModel)
], LoadPlanItemModel.prototype, "loadPlan", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => OrderItemModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], LoadPlanItemModel.prototype, "orderItemId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => OrderItemModel),
    __metadata("design:type", OrderItemModel)
], LoadPlanItemModel.prototype, "orderItem", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1 }),
    __metadata("design:type", Number)
], LoadPlanItemModel.prototype, "plannedQuantity", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], LoadPlanItemModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], LoadPlanItemModel.prototype, "updatedAt", void 0);
exports.LoadPlanItemModel = LoadPlanItemModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'load_plan_items', timestamps: true })
], LoadPlanItemModel);
let DispatchModel = class DispatchModel extends sequelize_typescript_1.Model {
};
exports.DispatchModel = DispatchModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DispatchModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ShipmentModel)
], DispatchModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel, { as: 'vehicleObj', foreignKey: 'vehicleId' }),
    __metadata("design:type", fleet_model_1.VehicleModel)
], DispatchModel.prototype, "vehicleObj", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.DriverModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.DriverModel, { as: 'driverObj', foreignKey: 'driverId' }),
    __metadata("design:type", fleet_model_1.DriverModel)
], DispatchModel.prototype, "driverObj", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], DispatchModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], DispatchModel.prototype, "dispatchNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "lrRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "coDriver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "odoStart", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "odoEnd", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "plannedKm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "actualKm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "hireAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "advanceToOwner", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "fuelBudget", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "tollBudget", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "driverBhatta", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "loadingUnloading", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], DispatchModel.prototype, "dispatchTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Scheduled' }),
    __metadata("design:type", String)
], DispatchModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], DispatchModel.prototype, "completeTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "startOdometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "endOdometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "totalKm", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "fuelLitres", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "tripExpenseTotal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DispatchModel.prototype, "driverSettlementAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'OPEN' }),
    __metadata("design:type", String)
], DispatchModel.prototype, "closureStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], DispatchModel.prototype, "notes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DispatchModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DispatchModel.prototype, "updatedAt", void 0);
exports.DispatchModel = DispatchModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'dispatches', timestamps: true })
], DispatchModel);
let TenderRequestModel = class TenderRequestModel extends sequelize_typescript_1.Model {
};
exports.TenderRequestModel = TenderRequestModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TenderRequestModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TenderRequestModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ShipmentModel)
], TenderRequestModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TenderRequestModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], TenderRequestModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, allowNull: false }),
    __metadata("design:type", Number)
], TenderRequestModel.prototype, "offeredRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], TenderRequestModel.prototype, "expirationTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'PENDING' }),
    __metadata("design:type", String)
], TenderRequestModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TenderRequestModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], TenderRequestModel.prototype, "updatedAt", void 0);
exports.TenderRequestModel = TenderRequestModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tender_requests', timestamps: true })
], TenderRequestModel);
let DriverAdvanceModel = class DriverAdvanceModel extends sequelize_typescript_1.Model {
};
exports.DriverAdvanceModel = DriverAdvanceModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "entryId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "tripRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Advance' }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "entryType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Driver Bhatta' }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "expenseHead", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], DriverAdvanceModel.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Cash' }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "paymentMode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Pending' }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], DriverAdvanceModel.prototype, "remarks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], DriverAdvanceModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], DriverAdvanceModel.prototype, "updatedAt", void 0);
exports.DriverAdvanceModel = DriverAdvanceModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'driver_advances', timestamps: true })
], DriverAdvanceModel);
let TyreEventModel = class TyreEventModel extends sequelize_typescript_1.Model {
};
exports.TyreEventModel = TyreEventModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TyreEventModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "tyreSerial", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Fit' }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "eventType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'FR' }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "position", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '0' }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "odometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], TyreEventModel.prototype, "remarks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TyreEventModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], TyreEventModel.prototype, "updatedAt", void 0);
exports.TyreEventModel = TyreEventModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tyre_events', timestamps: true })
], TyreEventModel);
let TyreInventoryModel = class TyreInventoryModel extends sequelize_typescript_1.Model {
};
exports.TyreInventoryModel = TyreInventoryModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "serialNo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "brand", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '295/80R22.5' }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "size", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'New' }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Tata Rubber Ltd' }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "supplier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], TyreInventoryModel.prototype, "cost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "position", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "fitDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '0' }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "fitOdom", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'FITTED' }),
    __metadata("design:type", String)
], TyreInventoryModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TyreInventoryModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], TyreInventoryModel.prototype, "updatedAt", void 0);
exports.TyreInventoryModel = TyreInventoryModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tyre_inventory', timestamps: true })
], TyreInventoryModel);
let JobCardModel = class JobCardModel extends sequelize_typescript_1.Model {
};
exports.JobCardModel = JobCardModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], JobCardModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], JobCardModel.prototype, "jobCardId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], JobCardModel.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], JobCardModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], JobCardModel.prototype, "serviceCentre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Engine Overhaul' }),
    __metadata("design:type", String)
], JobCardModel.prototype, "workType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Open' }),
    __metadata("design:type", String)
], JobCardModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], JobCardModel.prototype, "complaint", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], JobCardModel.prototype, "partsUsed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], JobCardModel.prototype, "labourCost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], JobCardModel.prototype, "totalCost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], JobCardModel.prototype, "expectedDowntime", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], JobCardModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], JobCardModel.prototype, "updatedAt", void 0);
exports.JobCardModel = JobCardModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'job_cards', timestamps: true })
], JobCardModel);
let PodRecordModel = class PodRecordModel extends sequelize_typescript_1.Model {
};
exports.PodRecordModel = PodRecordModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PodRecordModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "podId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "lrRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "deliveryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "receiver", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "deliveredQty", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '0' }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "shortage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Driver App' }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Pending' }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], PodRecordModel.prototype, "remarks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], PodRecordModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], PodRecordModel.prototype, "updatedAt", void 0);
exports.PodRecordModel = PodRecordModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'pod_records', timestamps: true })
], PodRecordModel);
let BillingInvoiceModel = class BillingInvoiceModel extends sequelize_typescript_1.Model {
};
exports.BillingInvoiceModel = BillingInvoiceModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "invoiceNo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "lrRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "baseAmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0 (RCM)' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "gst", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "total", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'RCM 5%' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "gstType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '—' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "irn", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "dueDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Draft' }),
    __metadata("design:type", String)
], BillingInvoiceModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], BillingInvoiceModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], BillingInvoiceModel.prototype, "updatedAt", void 0);
exports.BillingInvoiceModel = BillingInvoiceModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'billing_invoices', timestamps: true })
], BillingInvoiceModel);
let PurchaseBillModel = class PurchaseBillModel extends sequelize_typescript_1.Model {
};
exports.PurchaseBillModel = PurchaseBillModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "supplier", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Fuel Station' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "billNo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "baseAmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "gst", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "total", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '—' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "tds", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '194C' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "tdsSection", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '—' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "linkedRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Pending' }),
    __metadata("design:type", String)
], PurchaseBillModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], PurchaseBillModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], PurchaseBillModel.prototype, "updatedAt", void 0);
exports.PurchaseBillModel = PurchaseBillModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'purchase_bills', timestamps: true })
], PurchaseBillModel);
let SettlementModel = class SettlementModel extends sequelize_typescript_1.Model {
};
exports.SettlementModel = SettlementModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], SettlementModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Owner' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "settlementType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], SettlementModel.prototype, "party", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], SettlementModel.prototype, "tripRef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "grossAmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "advance", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "tds", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "shortage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: '₹0' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "netPayable", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], SettlementModel.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'Draft' }),
    __metadata("design:type", String)
], SettlementModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], SettlementModel.prototype, "remarks", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], SettlementModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], SettlementModel.prototype, "updatedAt", void 0);
exports.SettlementModel = SettlementModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'settlements', timestamps: true })
], SettlementModel);
//# sourceMappingURL=operations.model.js.map