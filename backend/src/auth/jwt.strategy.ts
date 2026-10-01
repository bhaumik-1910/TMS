import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {
  UserModel,
  OrganizationModel,
  UserRoleModel,
  RoleModel,
  RolePermissionModel,
  PermissionModel,
} from '../database/models';
import { DEFAULT_ROLE_PERMISSIONS } from '../common/constants/roles-permissions.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findByPk(payload.sub, {
      include: [
        { model: OrganizationModel },
        {
          model: UserRoleModel,
          include: [
            {
              model: RoleModel,
              include: [
                {
                  model: RolePermissionModel,
                  include: [PermissionModel],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is invalid or inactive');
    }

    const rolesFromDb = (user.userRoles || []).map((ur) => ur.role?.name).filter(Boolean);
    const roles = Array.from(new Set([...rolesFromDb, ...(payload.roles || [])]));
    const permissions = new Set<string>();

    if (user.userRoles) {
      user.userRoles.forEach((ur) => {
        if (ur.role?.rolePermissions) {
          ur.role.rolePermissions.forEach((rp) => {
            if (rp.permission?.key) permissions.add(rp.permission.key);
          });
        }
      });
    }

    // Enrich with role default permissions for all user roles
    roles.forEach((roleName) => {
      const defaults = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
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
}
