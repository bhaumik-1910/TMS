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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const bcrypt = require("bcryptjs");
const models_1 = require("../database/models");
const roles_permissions_constant_1 = require("../common/constants/roles-permissions.constant");
let AuthService = class AuthService {
    constructor(userModel, auditLogModel, jwtService, configService) {
        this.userModel = userModel;
        this.auditLogModel = auditLogModel;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, pass) {
        const user = await this.userModel.findOne({
            where: { email },
            include: [
                { model: models_1.OrganizationModel },
                {
                    model: models_1.UserRoleModel,
                    include: [
                        {
                            model: models_1.RoleModel,
                            include: [
                                {
                                    model: models_1.RolePermissionModel,
                                    include: [models_1.PermissionModel],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is suspended or inactive');
        }
        await user.update({ lastLoginAt: new Date() });
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = new Set();
        user.userRoles.forEach((ur) => {
            ur.role.rolePermissions.forEach((rp) => {
                permissions.add(rp.permission.key);
            });
            const defaults = roles_permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[ur.role.name] || [];
            defaults.forEach((p) => permissions.add(p));
        });
        if (roles.includes('SUPER_ADMIN') || roles.includes('TMS_ADMIN')) {
            permissions.add('*');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            roles,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
            expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'enterprise_tms_refresh_super_secret_jwt_key_2026',
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        });
        await this.auditLogModel.create({
            organizationId: user.organizationId,
            userId: user.id,
            action: 'USER_LOGIN',
            module: 'auth',
            entityType: 'User',
            entityId: user.id,
            newValue: JSON.stringify({ email: user.email, roles }),
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                status: user.status,
                organizationId: user.organizationId,
                organization: user.organization,
                roles,
                permissions: Array.from(permissions),
            },
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'enterprise_tms_refresh_super_secret_jwt_key_2026',
            });
            const user = await this.userModel.findByPk(payload.sub, {
                include: [
                    { model: models_1.OrganizationModel },
                    {
                        model: models_1.UserRoleModel,
                        include: [{ model: models_1.RoleModel }],
                    },
                ],
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const roles = user.userRoles.map((ur) => ur.role.name);
            const newPayload = {
                sub: user.id,
                email: user.email,
                organizationId: user.organizationId,
                roles,
            };
            const newAccessToken = this.jwtService.sign(newPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
                expiresIn: '15m',
            });
            return { accessToken: newAccessToken };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.UserModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map