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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(user) {
        const orgId = user.roles.includes('SUPER_ADMIN') ? undefined : user.organizationId;
        return this.usersService.findAll(orgId);
    }
    async getRoles() {
        return this.usersService.getRoles();
    }
    async createRole(body, user) {
        return this.usersService.createRole(body, user.userId || user.id, user.organizationId);
    }
    async updateRole(id, body, user) {
        return this.usersService.updateRole(id, body, user.userId || user.id, user.organizationId);
    }
    async deleteRole(id, user) {
        return this.usersService.deleteRole(id, user.userId || user.id, user.organizationId);
    }
    async assignUserRoles(id, roleIds, user) {
        return this.usersService.assignUserRoles(id, roleIds, user.userId || user.id, user.organizationId);
    }
    async getPermissions() {
        return this.usersService.getPermissions();
    }
    async findOne(id) {
        return this.usersService.findOne(id);
    }
    async create(body, user) {
        return this.usersService.create(body, user.organizationId);
    }
    async update(id, body) {
        return this.usersService.update(id, body);
    }
    async remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'List users in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'List all RBAC roles with their permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new custom role with permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createRole", null);
__decorate([
    (0, common_1.Patch)('roles/:id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a role and its permission matrix' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a custom role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign multiple roles to a user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roleIds')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignUserRoles", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all granular system permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create user with role assignment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user and role assignment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'TMS_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users & RBAC'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('api/v1/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map