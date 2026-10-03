import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PERMISSION_SYNONYMS } from '../constants/roles-permissions.constant';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permissions) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    // Wildcard Super Admin access or explicit admin role match
    if (
      user.permissions?.includes('*') ||
      roles.includes('SUPER_ADMIN') ||
      roles.includes('TMS_ADMIN') ||
      roles.includes('ADMIN')
    ) {
      return true;
    }

    const userPermSet = new Set<string>(user.permissions);

    // Require all specified permissions, allowing synonyms and module wildcards
    const hasPermission = requiredPermissions.every((requiredPerm) => {
      if (userPermSet.has(requiredPerm)) return true;

      // Check module wildcard e.g. "shipment:*" or "orders:*"
      const [mod] = requiredPerm.split(':');
      if (userPermSet.has(`${mod}:*`) || userPermSet.has(`${mod}s:*`)) return true;

      // Check synonyms
      const synonyms = PERMISSION_SYNONYMS[requiredPerm] || [];
      return synonyms.some((syn) => userPermSet.has(syn));
    });

    if (!hasPermission) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    return true;
  }
}
