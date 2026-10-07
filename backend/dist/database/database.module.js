"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const app_config_js_1 = require("../config/app.config.js");
const connection_registry_js_1 = require("../framework/tenancy/connection-registry.js");
const logger = new common_1.Logger('Sequelize');
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [app_config_js_1.appConfig.KEY],
                useFactory: (config) => ({
                    ...(0, connection_registry_js_1.connectionOptions)(10),
                    define: { underscored: false },
                    uri: config.databaseUri,
                    autoLoadModels: true,
                    dialectOptions: {
                        options: '-c search_path=public,platform',
                    },
                    synchronize: false,
                    logging: config.dbLogging ? (sql) => logger.debug(sql) : false,
                }),
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map