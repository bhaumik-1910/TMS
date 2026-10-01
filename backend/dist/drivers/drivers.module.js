"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const drivers_service_1 = require("./drivers.service");
const drivers_controller_1 = require("./drivers.controller");
const models_1 = require("../database/models");
let DriversModule = class DriversModule {
};
exports.DriversModule = DriversModule;
exports.DriversModule = DriversModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.DriverModel,
                models_1.DriverDocumentModel,
                models_1.DriverAssignmentModel,
                models_1.VehicleModel,
                models_1.DispatchModel,
                models_1.ShipmentModel,
                models_1.CustomerModel,
                models_1.TransportOrderModel,
                models_1.LocationModel,
                models_1.ShipmentItemModel,
                models_1.RouteModel,
                models_1.RouteStopModel,
                models_1.ProofOfDeliveryModel,
            ]),
        ],
        controllers: [drivers_controller_1.DriversController],
        providers: [drivers_service_1.DriversService],
        exports: [drivers_service_1.DriversService],
    })
], DriversModule);
//# sourceMappingURL=drivers.module.js.map