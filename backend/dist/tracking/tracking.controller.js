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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tracking_service_1 = require("./tracking.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let TrackingController = class TrackingController {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async getActiveFleetLocations(orgId) {
        return this.trackingService.getActiveFleetLocations(orgId);
    }
    async getShipmentTracking(id) {
        return this.trackingService.getShipmentTracking(id);
    }
    async recordTelemetry(body) {
        return this.trackingService.recordTelemetry(body);
    }
    async getGeofences(orgId) {
        return this.trackingService.getGeofences(orgId);
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)('fleet'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current GPS coordinates of all active fleet vehicles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getActiveFleetLocations", null);
__decorate([
    (0, common_1.Get)('shipments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get live tracking data, route trail, ETA, and geofence alerts for shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getShipmentTracking", null);
__decorate([
    (0, common_1.Post)('telemetry'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate or ingest GPS telemetry point from driver app/device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "recordTelemetry", null);
__decorate([
    (0, common_1.Get)('geofences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant geofences' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getGeofences", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('Live Tracking & Telemetry'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/tracking'),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map