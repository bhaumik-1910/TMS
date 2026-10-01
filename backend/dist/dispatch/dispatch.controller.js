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
exports.DispatchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dispatch_service_1 = require("./dispatch.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DispatchController = class DispatchController {
    constructor(dispatchService) {
        this.dispatchService = dispatchService;
    }
    async findAll(orgId, status) {
        return this.dispatchService.findAll(orgId, status);
    }
    async getDispatchBoard(orgId) {
        return this.dispatchService.getDispatchBoard(orgId);
    }
    async create(user, body) {
        return this.dispatchService.create(user.organizationId, body, user.userId);
    }
    async updateStatus(id, status, userId) {
        return this.dispatchService.updateStatus(id, status, userId);
    }
    async addTripExpense(id, body) {
        return this.dispatchService.addTripExpense(id, body);
    }
    async getTripExpenses(id) {
        return this.dispatchService.getTripExpenses(id);
    }
    async closeTrip(id, body) {
        return this.dispatchService.closeTrip(id, body);
    }
};
exports.DispatchController = DispatchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all dispatches' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('board'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dispatch Kanban board by status columns' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "getDispatchBoard", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create dispatch and assign vehicle/driver transactionally' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dispatch status (IN_TRANSIT, DELIVERY, COMPLETED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/expenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Log trip execution expense (Fuel, Allowance, Toll, Tyre, Service)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "addTripExpense", null);
__decorate([
    (0, common_1.Get)(':id/expenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all logged expenses for trip dispatch' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "getTripExpenses", null);
__decorate([
    (0, common_1.Post)(':id/close-trip'),
    (0, swagger_1.ApiOperation)({ summary: 'Close trip with final KM, fuel entry, and driver settlement (Stage 9 in diagram)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DispatchController.prototype, "closeTrip", null);
exports.DispatchController = DispatchController = __decorate([
    (0, swagger_1.ApiTags)('Dispatch'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/dispatch'),
    __metadata("design:paramtypes", [dispatch_service_1.DispatchService])
], DispatchController);
//# sourceMappingURL=dispatch.controller.js.map