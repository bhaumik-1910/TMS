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
const config_1 = require("@nestjs/config");
const models_1 = require("./models");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const uri = config.get('DATABASE_URL');
                    return {
                        dialect: 'postgres',
                        uri,
                        models: models_1.ALL_MODELS,
                        autoLoadModels: true,
                        synchronize: false,
                        logging: false,
                        pool: {
                            max: 20,
                            min: 2,
                            acquire: 30000,
                            idle: 10000,
                        },
                    };
                },
            }),
            sequelize_1.SequelizeModule.forFeature(models_1.ALL_MODELS),
        ],
        exports: [sequelize_1.SequelizeModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map