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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const bcrypt = require("bcryptjs");
const models_1 = require("../database/models");
let UsersService = class UsersService {
    constructor(userModel, roleModel, permissionModel, rolePermissionModel, userRoleModel, auditLogModel) {
        this.userModel = userModel;
        this.roleModel = roleModel;
        this.permissionModel = permissionModel;
        this.rolePermissionModel = rolePermissionModel;
        this.userRoleModel = userRoleModel;
        this.auditLogModel = auditLogModel;
    }
    async findAll(organizationId) {
        const where = organizationId ? { organizationId } : {};
        return this.userModel.findAll({
            where,
            include: [
                { model: models_1.OrganizationModel },
                {
                    model: models_1.UserRoleModel,
                    include: [{ model: models_1.RoleModel }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    async findOne(id) {
        const user = await this.userModel.findByPk(id, {
            include: [
                { model: models_1.OrganizationModel },
                {
                    model: models_1.UserRoleModel,
                    include: [{ model: models_1.RoleModel }],
                },
            ],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(data, currentOrgId) {
        const existing = await this.userModel.findOne({
            where: { email: data.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const passwordHash = await bcrypt.hash(data.password || 'Tms@123456', 10);
        const orgId = data.organizationId || currentOrgId;
        const user = await this.userModel.create({
            organizationId: orgId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            passwordHash,
            status: data.status || 'ACTIVE',
        });
        if (data.roleId) {
            await this.userRoleModel.create({
                userId: user.id,
                roleId: data.roleId,
            });
        }
        return this.findOne(user.id);
    }
    async update(id, data) {
        const user = await this.userModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const updateData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            status: data.status,
        };
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
        await user.update(updateData);
        if (data.roleId) {
            await this.userRoleModel.destroy({ where: { userId: id } });
            await this.userRoleModel.create({
                userId: id,
                roleId: data.roleId,
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.userModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await user.destroy();
        return { success: true };
    }
    async getRoles() {
        return this.roleModel.findAll({
            include: [
                {
                    model: models_1.RolePermissionModel,
                    include: [{ model: models_1.PermissionModel }],
                },
            ],
            order: [['name', 'ASC']],
        });
    }
    async getPermissions() {
        return this.permissionModel.findAll({
            order: [['key', 'ASC']],
        });
    }
    async createRole(data, currentUserId, orgId) {
        const existing = await this.roleModel.findOne({ where: { name: data.name } });
        if (existing)
            throw new common_1.ConflictException(`Role with name ${data.name} already exists`);
        const sequelize = this.roleModel.sequelize;
        return sequelize.transaction(async (t) => {
            const role = await this.roleModel.create({
                name: data.name.toUpperCase().replace(/\s+/g, '_'),
                description: data.description,
            }, { transaction: t });
            if (data.permissionIds && data.permissionIds.length > 0) {
                await this.rolePermissionModel.bulkCreate(data.permissionIds.map((pId) => ({
                    roleId: role.id,
                    permissionId: pId,
                })), { transaction: t });
            }
            await this.auditLogModel.create({
                organizationId: orgId,
                userId: currentUserId,
                action: 'ROLE_CREATED',
                module: 'rbac',
                entityType: 'Role',
                entityId: role.id,
                newValue: JSON.stringify({ name: role.name, permissionsCount: data.permissionIds?.length || 0 }),
            }, { transaction: t });
            return this.roleModel.findByPk(role.id, {
                include: [
                    {
                        model: models_1.RolePermissionModel,
                        include: [{ model: models_1.PermissionModel }],
                    },
                ],
                transaction: t,
            });
        });
    }
    async updateRole(id, data, currentUserId, orgId) {
        const role = await this.roleModel.findByPk(id);
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        const sequelize = this.roleModel.sequelize;
        return sequelize.transaction(async (t) => {
            await role.update({
                name: data.name ? data.name.toUpperCase().replace(/\s+/g, '_') : undefined,
                description: data.description,
            }, { transaction: t });
            if (data.permissionIds) {
                await this.rolePermissionModel.destroy({ where: { roleId: id }, transaction: t });
                if (data.permissionIds.length > 0) {
                    await this.rolePermissionModel.bulkCreate(data.permissionIds.map((pId) => ({
                        roleId: id,
                        permissionId: pId,
                    })), { transaction: t });
                }
            }
            await this.auditLogModel.create({
                organizationId: orgId,
                userId: currentUserId,
                action: 'ROLE_UPDATED',
                module: 'rbac',
                entityType: 'Role',
                entityId: id,
                oldValue: JSON.stringify({ name: role.name }),
                newValue: JSON.stringify({ name: role.name, permissionsCount: data.permissionIds?.length }),
            }, { transaction: t });
            return this.roleModel.findByPk(id, {
                include: [
                    {
                        model: models_1.RolePermissionModel,
                        include: [{ model: models_1.PermissionModel }],
                    },
                ],
                transaction: t,
            });
        });
    }
    async deleteRole(id, currentUserId, orgId) {
        const role = await this.roleModel.findByPk(id);
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (role.name === 'SUPER_ADMIN')
            throw new common_1.ConflictException('SUPER_ADMIN role cannot be deleted');
        const assignedCount = await this.userRoleModel.count({ where: { roleId: id } });
        if (assignedCount > 0)
            throw new common_1.ConflictException(`Cannot delete role currently assigned to ${assignedCount} user(s)`);
        const sequelize = this.roleModel.sequelize;
        return sequelize.transaction(async (t) => {
            await this.rolePermissionModel.destroy({ where: { roleId: id }, transaction: t });
            await role.destroy({ transaction: t });
            await this.auditLogModel.create({
                organizationId: orgId,
                userId: currentUserId,
                action: 'ROLE_DELETED',
                module: 'rbac',
                entityType: 'Role',
                entityId: id,
                oldValue: JSON.stringify({ name: role.name }),
            }, { transaction: t });
            return { success: true };
        });
    }
    async assignUserRoles(targetUserId, roleIds, currentUserId, orgId) {
        const user = await this.userModel.findByPk(targetUserId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const sequelize = this.userModel.sequelize;
        return sequelize.transaction(async (t) => {
            await this.userRoleModel.destroy({ where: { userId: targetUserId }, transaction: t });
            if (roleIds && roleIds.length > 0) {
                await this.userRoleModel.bulkCreate(roleIds.map((rId) => ({
                    userId: targetUserId,
                    roleId: rId,
                })), { transaction: t });
            }
            await this.auditLogModel.create({
                organizationId: orgId,
                userId: currentUserId,
                action: 'USER_ROLES_ASSIGNED',
                module: 'rbac',
                entityType: 'User',
                entityId: targetUserId,
                newValue: JSON.stringify({ assignedRoleIds: roleIds }),
            }, { transaction: t });
            return this.findOne(targetUserId);
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.UserModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.RoleModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.PermissionModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.RolePermissionModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.UserRoleModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map