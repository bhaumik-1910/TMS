"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriersModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const carriers_service_1 = require("./carriers.service");
const carriers_controller_1 = require("./carriers.controller");
const models_1 = require("../database/models");
let CarriersModule = class CarriersModule {
};
exports.CarriersModule = CarriersModule;
exports.CarriersModule = CarriersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.CarrierModel,
                models_1.CarrierContractModel,
                models_1.CarrierRateModel,
                models_1.CarrierDocumentModel,
            ]),
        ],
        controllers: [carriers_controller_1.CarriersController],
        providers: [carriers_service_1.CarriersService],
        exports: [carriers_service_1.CarriersService],
    })
], CarriersModule);
//# sourceMappingURL=carriers.module.js.map