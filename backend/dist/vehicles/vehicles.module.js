"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const vehicles_service_1 = require("./vehicles.service");
const vehicles_controller_1 = require("./vehicles.controller");
const fuel_service_1 = require("./fuel.service");
const fuel_controller_1 = require("./fuel.controller");
const tyre_events_service_1 = require("./tyre-events.service");
const tyre_events_controller_1 = require("./tyre-events.controller");
const job_cards_service_1 = require("./job-cards.service");
const job_cards_controller_1 = require("./job-cards.controller");
const models_1 = require("../database/models");
const foundation_module_1 = require("../foundation/foundation.module");
const ops_module_1 = require("../framework/ops/ops.module");
let VehiclesModule = class VehiclesModule {
};
exports.VehiclesModule = VehiclesModule;
exports.VehiclesModule = VehiclesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            foundation_module_1.FoundationModule,
            ops_module_1.OpsModule,
            sequelize_1.SequelizeModule.forFeature([
                models_1.VehicleModel,
                models_1.VehicleTypeModel,
                models_1.VehicleMaintenanceModel,
                models_1.VehicleDocumentModel,
                models_1.DriverModel,
                models_1.DriverAssignmentModel,
                models_1.FuelEntryModel,
                models_1.TyreEventModel,
                models_1.TyreInventoryModel,
                models_1.JobCardModel,
            ]),
        ],
        controllers: [vehicles_controller_1.VehiclesController, fuel_controller_1.FuelController, tyre_events_controller_1.TyreEventsController, job_cards_controller_1.JobCardsController],
        providers: [vehicles_service_1.VehiclesService, fuel_service_1.FuelService, tyre_events_service_1.TyreEventsService, job_cards_service_1.JobCardsService],
        exports: [vehicles_service_1.VehiclesService, fuel_service_1.FuelService, tyre_events_service_1.TyreEventsService, job_cards_service_1.JobCardsService],
    })
], VehiclesModule);
//# sourceMappingURL=vehicles.module.js.map