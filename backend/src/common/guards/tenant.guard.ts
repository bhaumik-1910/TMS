import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Public endpoints or unauthenticated endpoints are skipped by JwtAuthGuard first
    if (!user) {
      return true;
    }

    // SUPER_ADMIN has platform-wide cross-tenant governance
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) {
      const orgContext = request.headers['x-organization-context'];
      if (orgContext && orgContext !== 'SYSTEM') {
        request.tenantId = orgContext;
      } else {
        request.tenantId = undefined; // SYSTEM-wide aggregated context
      }
      return true;
    }

    if (!user.organizationId) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'TENANT_REQUIRED',
        message: 'Valid organization context required for tenant-scoped operations',
      });
    }

    // Prevent client request body from overriding trusted server-derived organizationId
    if (request.body && request.body.organizationId && request.body.organizationId !== user.organizationId) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CROSS_TENANT_VIOLATION',
        message: 'Cross-tenant data manipulation is prohibited',
      });
    }

    // Enforce trusted organizationId in request params if specified
    if (request.params && request.params.organizationId && request.params.organizationId !== user.organizationId) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CROSS_TENANT_VIOLATION',
        message: 'Cross-tenant resource access is prohibited',
      });
    }

    // Attach trusted tenant scope to request context for downstream services
    request.tenantId = user.organizationId;
    return true;
  }
}
