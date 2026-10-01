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
exports.TenderRequestModel = exports.DispatchModel = exports.LoadPlanItemModel = exports.LoadPlanModel = exports.RouteStopModel = exports.RouteModel = exports.ShipmentItemModel = exports.ShipmentModel = exports.OrderItemModel = exports.TransportOrderModel = void 0;
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
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
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
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "originLocationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel, 'originLocationId'),
    __metadata("design:type", master_data_model_1.LocationModel)
], TransportOrderModel.prototype, "originLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => master_data_model_1.LocationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TransportOrderModel.prototype, "destinationLocationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => master_data_model_1.LocationModel, 'destinationLocationId'),
    __metadata("design:type", master_data_model_1.LocationModel)
], TransportOrderModel.prototype, "destinationLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], TransportOrderModel.prototype, "requestedPickupDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
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
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DispatchModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ShipmentModel)
], DispatchModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.VehicleModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DispatchModel.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.VehicleModel),
    __metadata("design:type", fleet_model_1.VehicleModel)
], DispatchModel.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => fleet_model_1.DriverModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], DispatchModel.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => fleet_model_1.DriverModel),
    __metadata("design:type", fleet_model_1.DriverModel)
], DispatchModel.prototype, "driver", void 0);
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
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], DispatchModel.prototype, "dispatchTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'ASSIGNED' }),
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
//# sourceMappingURL=operations.model.js.map