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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipments_service_1 = require("./shipments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ShipmentsController = class ShipmentsController {
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    async findAll(user, query, orgContext) {
        return this.shipmentsService.findAll(user, query, orgContext);
    }
    async findOne(id, user) {
        return this.shipmentsService.findOne(id, user);
    }
    async assignResources(id, body, userId) {
        return this.shipmentsService.assignResources(id, body, userId);
    }
    async updateStatus(id, status, userId) {
        return this.shipmentsService.updateStatus(id, status, userId);
    }
    async submitPOD(id, podDto, user) {
        return this.shipmentsService.submitPOD(id, podDto, user);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('shipment:view'),
    (0, swagger_1.ApiOperation)({ summary: 'List shipments scoped by user DataScope and organization context' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Headers)('x-organization-context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('shipment:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment full details verified against resource policy' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, permissions_decorator_1.RequirePermissions)('dispatch:assign', 'shipment:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign vehicle, driver, carrier or route to shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "assignResources", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('dispatch:dispatch', 'shipment:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment status (PLANNED, ASSIGNED, IN_TRANSIT, DELIVERED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/pod'),
    (0, permissions_decorator_1.RequirePermissions)('pod:submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit proof of delivery with digital signature and photo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "submitPOD", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('Shipments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('api/v1/shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map