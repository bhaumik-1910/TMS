"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const shipments_service_1 = require("./shipments.service");
const shipments_controller_1 = require("./shipments.controller");
const models_1 = require("../database/models");
let ShipmentsModule = class ShipmentsModule {
};
exports.ShipmentsModule = ShipmentsModule;
exports.ShipmentsModule = ShipmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.ShipmentModel,
                models_1.ShipmentItemModel,
                models_1.TransportOrderModel,
                models_1.CustomerModel,
                models_1.CarrierModel,
                models_1.VehicleModel,
                models_1.DriverModel,
                models_1.RouteModel,
                models_1.RouteStopModel,
                models_1.TrackingEventModel,
                models_1.ProofOfDeliveryModel,
                models_1.DispatchModel,
                models_1.NotificationModel,
                models_1.AuditLogModel,
                models_1.LocationModel,
                models_1.InvoiceModel,
                models_1.ClaimModel,
                models_1.GeofenceEventModel,
                models_1.VehicleTypeModel,
                models_1.OrderItemModel,
            ]),
        ],
        controllers: [shipments_controller_1.ShipmentsController],
        providers: [shipments_service_1.ShipmentsService],
        exports: [shipments_service_1.ShipmentsService],
    })
], ShipmentsModule);
//# sourceMappingURL=shipments.module.js.map