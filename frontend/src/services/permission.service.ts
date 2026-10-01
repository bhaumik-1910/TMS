// Centralized Permission Service for unified frontend authorization checks

export class PermissionService {
  /**
   * Check if user has a specific permission.
   * Super Admin wildcard '*' grants full access.
   */
  static hasPermission(permission: string, userPermissions: string[] = []): boolean {
    if (!permission) return true;
    if (userPermissions.includes('*')) return true;
    return userPermissions.includes(permission);
  }

  /**
   * Check if user has AT LEAST ONE of the requested permissions.
   */
  static hasAnyPermission(permissions: string[], userPermissions: string[] = []): boolean {
    if (!permissions || permissions.length === 0) return true;
    if (userPermissions.includes('*')) return true;
    return permissions.some((perm) => userPermissions.includes(perm));
  }

  /**
   * Check if user has ALL of the requested permissions.
   */
  static hasAllPermissions(permissions: string[], userPermissions: string[] = []): boolean {
    if (!permissions || permissions.length === 0) return true;
    if (userPermissions.includes('*')) return true;
    return permissions.every((perm) => userPermissions.includes(perm));
  }

  /**
   * Check if user has a specific role.
   */
  static hasRole(role: string, userRoles: string[] = []): boolean {
    if (userRoles.includes('SUPER_ADMIN')) return true;
    return userRoles.includes(role);
  }

  /**
   * Check if user is Super Admin.
   */
  static isSuperAdmin(userRoles: string[] = [], userPermissions: string[] = []): boolean {
    return userRoles.includes('SUPER_ADMIN') || userPermissions.includes('*');
  }
}
