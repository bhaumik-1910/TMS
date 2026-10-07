"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LorryReceiptsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const lorry_receipts_service_1 = require("./lorry-receipts.service");
const lorry_receipts_controller_1 = require("./lorry-receipts.controller");
const models_1 = require("../database/models");
const foundation_module_1 = require("../foundation/foundation.module");
const ops_module_1 = require("../framework/ops/ops.module");
let LorryReceiptsModule = class LorryReceiptsModule {
};
exports.LorryReceiptsModule = LorryReceiptsModule;
exports.LorryReceiptsModule = LorryReceiptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            foundation_module_1.FoundationModule,
            ops_module_1.OpsModule,
            sequelize_1.SequelizeModule.forFeature([
                models_1.LorryReceiptModel,
                models_1.ShipmentModel,
                models_1.CustomerModel,
                models_1.VehicleModel,
                models_1.DriverModel,
                models_1.CarrierModel,
                models_1.TransportOrderModel,
                models_1.LocationModel,
                models_1.ShipmentItemModel,
                models_1.DispatchModel,
            ]),
        ],
        controllers: [lorry_receipts_controller_1.LorryReceiptsController],
        providers: [lorry_receipts_service_1.LorryReceiptsService],
        exports: [lorry_receipts_service_1.LorryReceiptsService],
    })
], LorryReceiptsModule);
//# sourceMappingURL=lorry-receipts.module.js.map