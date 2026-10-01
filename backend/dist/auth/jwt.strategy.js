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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
const roles_permissions_constant_1 = require("../common/constants/roles-permissions.constant");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, userModel) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
        });
        this.configService = configService;
        this.userModel = userModel;
    }
    async validate(payload) {
        const user = await this.userModel.findByPk(payload.sub, {
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
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User account is invalid or inactive');
        }
        const rolesFromDb = (user.userRoles || []).map((ur) => ur.role?.name).filter(Boolean);
        const roles = Array.from(new Set([...rolesFromDb, ...(payload.roles || [])]));
        const permissions = new Set();
        if (user.userRoles) {
            user.userRoles.forEach((ur) => {
                if (ur.role?.rolePermissions) {
                    ur.role.rolePermissions.forEach((rp) => {
                        if (rp.permission?.key)
                            permissions.add(rp.permission.key);
                    });
                }
            });
        }
        roles.forEach((roleName) => {
            const defaults = roles_permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[roleName] || [];
            defaults.forEach((p) => permissions.add(p));
        });
        if (roles.includes('SUPER_ADMIN') || roles.includes('TMS_ADMIN')) {
            permissions.add('*');
        }
        return {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            organizationId: user.organizationId,
            organization: user.organization,
            roles,
            permissions: Array.from(permissions),
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, sequelize_1.InjectModel)(models_1.UserModel)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map