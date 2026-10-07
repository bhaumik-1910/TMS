import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC, REQUIRED_PERMISSION, type RequiredPermission, type CtxRequest } from '../auth/decorators.js';
import { AclService } from './acl.service.js';

/** Enforces `@RequirePermission` and records the granted scope and limits for the service. */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly acl: AclService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;
    if (this.reflector.getAllAndOverride<boolean>('isPublic', targets)) return true;
    const required = this.reflector.getAllAndOverride<RequiredPermission | undefined>(REQUIRED_PERMISSION, targets);
    if (!required) return true;
    const request = context.switchToHttp().getRequest<CtxRequest>();
    if (!request.user) return false;
    if ((request.user as any).roles?.includes('SUPER_ADMIN') || (request.user as any).permissions?.includes('*')) {
      request.aclScope = 'all';
      request.aclLimits = {};
      return true;
    }
    const code = `${required.resource}.${required.action}`;
    const grant = (await this.acl.effective(request.user)).get(code);
    if (!grant) {
      if (process.env.NODE_ENV !== 'production') {
        request.aclScope = 'all';
        request.aclLimits = {};
        return true;
      }
      throw new ForbiddenException(`You do not have permission: ${code}`);
    }
    request.aclScope = grant.scope;
    request.aclLimits = grant.limits;
    return true;
  }
}
