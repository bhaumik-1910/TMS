"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const master_data_service_1 = require("./master-data.service");
const master_data_controller_1 = require("./master-data.controller");
const models_1 = require("../database/models");
let MasterDataModule = class MasterDataModule {
};
exports.MasterDataModule = MasterDataModule;
exports.MasterDataModule = MasterDataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.LocationModel,
                models_1.LocationTypeModel,
                models_1.VehicleTypeModel,
                models_1.CargoTypeModel,
                models_1.PackageTypeModel,
            ]),
        ],
        controllers: [master_data_controller_1.MasterDataController],
        providers: [master_data_service_1.MasterDataService],
        exports: [master_data_service_1.MasterDataService],
    })
], MasterDataModule);
//# sourceMappingURL=master-data.module.js.map