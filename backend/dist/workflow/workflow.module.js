"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const workflow_service_1 = require("./workflow.service");
const workflow_controller_1 = require("./workflow.controller");
const models_1 = require("../database/models");
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                models_1.TransportOrderModel,
                models_1.ShipmentModel,
                models_1.DispatchModel,
                models_1.CustomerModel,
                models_1.DriverModel,
                models_1.VehicleModel,
                models_1.CarrierModel,
                models_1.UserModel,
                models_1.AuditLogModel,
                models_1.NotificationModel,
            ]),
        ],
        providers: [workflow_service_1.WorkflowService],
        controllers: [workflow_controller_1.WorkflowController],
        exports: [workflow_service_1.WorkflowService],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map