"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const dispatch_service_1 = require("./dispatch.service");
const dispatch_controller_1 = require("./dispatch.controller");
const driver_advances_service_1 = require("./driver-advances.service");
const driver_advances_controller_1 = require("./driver-advances.controller");
const models_1 = require("../database/models");
const foundation_module_1 = require("../foundation/foundation.module");
const ops_module_1 = require("../framework/ops/ops.module");
let DispatchModule = class DispatchModule {
};
exports.DispatchModule = DispatchModule;
exports.DispatchModule = DispatchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            foundation_module_1.FoundationModule,
            ops_module_1.OpsModule,
            sequelize_1.SequelizeModule.forFeature([
                models_1.DispatchModel,
                models_1.ShipmentModel,
                models_1.VehicleModel,
                models_1.DriverModel,
                models_1.CarrierModel,
                models_1.TransportOrderModel,
                models_1.LocationModel,
                models_1.CustomerModel,
                models_1.TripExpenseModel,
                models_1.AuditLogModel,
                models_1.DriverAdvanceModel,
            ]),
        ],
        controllers: [dispatch_controller_1.DispatchController, driver_advances_controller_1.DriverAdvancesController],
        providers: [dispatch_service_1.DispatchService, driver_advances_service_1.DriverAdvancesService],
        exports: [dispatch_service_1.DispatchService, driver_advances_service_1.DriverAdvancesService],
    })
], DispatchModule);
//# sourceMappingURL=dispatch.module.js.map