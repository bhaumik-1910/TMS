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
exports.AdminConsoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_console_service_1 = require("./admin-console.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let AdminConsoleController = class AdminConsoleController {
    constructor(adminConsoleService) {
        this.adminConsoleService = adminConsoleService;
    }
    async getSystemOverview() {
        return this.adminConsoleService.getSystemOverview();
    }
    async getOrganizations() {
        return this.adminConsoleService.getOrganizations();
    }
    async getSystemHealth() {
        return this.adminConsoleService.getSystemHealth();
    }
    async getSecurityAudit() {
        return this.adminConsoleService.getSecurityAudit();
    }
};
exports.AdminConsoleController = AdminConsoleController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform-wide administrative overview' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminConsoleController.prototype, "getSystemOverview", null);
__decorate([
    (0, common_1.Get)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all platform tenant organizations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminConsoleController.prototype, "getOrganizations", null);
__decorate([
    (0, common_1.Get)('system-health'),
    (0, swagger_1.ApiOperation)({ summary: 'Real-time infrastructure health and latency' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminConsoleController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('security-audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform security audit events' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminConsoleController.prototype, "getSecurityAudit", null);
exports.AdminConsoleController = AdminConsoleController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin Platform Console'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, common_1.Controller)('api/v1/admin'),
    __metadata("design:paramtypes", [admin_console_service_1.AdminConsoleService])
], AdminConsoleController);
//# sourceMappingURL=admin-console.controller.js.map