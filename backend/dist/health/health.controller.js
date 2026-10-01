"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const sequelize_typescript_1 = require("sequelize-typescript");
let HealthController = class HealthController {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async getHealth() {
        return {
            status: 'ok',
            service: 'enterprise-tms-backend',
            orm: 'Sequelize + sequelize-typescript',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        };
    }
    async getReadiness() {
        let dbStatus = 'down';
        try {
            await this.sequelize.query('SELECT 1');
            dbStatus = 'up';
        }
        catch (err) {
            dbStatus = `down: ${err.message}`;
        }
        const isReady = dbStatus === 'up';
        return {
            status: isReady ? 'ready' : 'unhealthy',
            database: dbStatus,
            orm: 'Sequelize PostgreSQL Pool',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe with database connectivity verification' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health & Observability'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [sequelize_typescript_1.Sequelize])
], HealthController);
//# sourceMappingURL=health.controller.js.map