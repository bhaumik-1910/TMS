"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccessModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const data_access_service_1 = require("./data-access.service");
const models_1 = require("../../database/models");
let DataAccessModule = class DataAccessModule {
};
exports.DataAccessModule = DataAccessModule;
exports.DataAccessModule = DataAccessModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([models_1.DriverModel, models_1.CustomerModel, models_1.CarrierModel])],
        providers: [data_access_service_1.DataAccessService],
        exports: [data_access_service_1.DataAccessService],
    })
], DataAccessModule);
//# sourceMappingURL=data-access.module.js.map