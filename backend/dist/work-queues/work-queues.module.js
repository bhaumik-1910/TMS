"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkQueuesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const work_queues_service_1 = require("./work-queues.service");
const work_queues_controller_1 = require("./work-queues.controller");
const data_access_module_1 = require("../common/data-access/data-access.module");
const models_1 = require("../database/models");
let WorkQueuesModule = class WorkQueuesModule {
};
exports.WorkQueuesModule = WorkQueuesModule;
exports.WorkQueuesModule = WorkQueuesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.TransportOrderModel,
                models_1.ShipmentModel,
                models_1.VehicleModel,
                models_1.DriverModel,
                models_1.CustomerModel,
                models_1.LocationModel,
                models_1.InvoiceModel,
                models_1.VehicleDocumentModel,
            ]),
            data_access_module_1.DataAccessModule,
        ],
        providers: [work_queues_service_1.WorkQueuesService],
        controllers: [work_queues_controller_1.WorkQueuesController],
        exports: [work_queues_service_1.WorkQueuesService],
    })
], WorkQueuesModule);
//# sourceMappingURL=work-queues.module.js.map