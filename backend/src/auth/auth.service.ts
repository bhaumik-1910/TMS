import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import {
  UserModel,
  OrganizationModel,
  UserRoleModel,
  RoleModel,
  RolePermissionModel,
  PermissionModel,
  AuditLogModel,
} from '../database/models';
import { LoginDto } from './dto/login.dto';
import { DEFAULT_ROLE_PERMISSIONS } from '../common/constants/roles-permissions.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(AuditLogModel)
    private auditLogModel: typeof AuditLogModel,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: { email },
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

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or inactive');
    }

    // Update lastLoginAt
    await user.update({ lastLoginAt: new Date() });

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = new Set<string>();
    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.key);
      });
      // Fallback/enrich with official defaults for this role
      const defaults = DEFAULT_ROLE_PERMISSIONS[ur.role.name] || [];
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
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'enterprise_tms_refresh_super_secret_jwt_key_2026',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Create Audit Log for login
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

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'enterprise_tms_refresh_super_secret_jwt_key_2026',
      });

      const user = await this.userModel.findByPk(payload.sub, {
        include: [
          { model: OrganizationModel },
          {
            model: UserRoleModel,
            include: [{ model: RoleModel }],
          },
        ],
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      const newPayload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
        roles,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'enterprise_tms_access_super_secret_jwt_key_2026',
        expiresIn: '15m',
      });

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }
}
