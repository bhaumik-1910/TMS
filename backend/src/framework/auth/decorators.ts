import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { AclScope, AuthUser, Limits, ReqCtx } from './auth-user.js';

export const IS_PUBLIC = 'fw:public';
export const IS_LOGIN_TOKEN = 'fw:login-token';
export const REQUIRED_PERMISSION = 'fw:permission';

export interface RequiredPermission {
  resource: string;
  action: string;
}

/** No access token needed. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/**
 * The route takes the short-lived login token (and the company token): the company list and
 * switch-company. Every other route refuses a login token.
 */
export const LoginToken = () => SetMetadata(IS_LOGIN_TOKEN, true);

/** The caller needs `resource.action`. The guard puts the granted scope and limits on the request. */
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata(REQUIRED_PERMISSION, { resource, action } satisfies RequiredPermission);

export interface CtxRequest {
  user?: AuthUser;
  /** Verified claims of a login token (only on `@LoginToken()` routes). */
  loginClaims?: { sub: number; typ: 'login' } & Record<string, unknown>;
  aclScope?: AclScope;
  aclLimits?: Limits;
}

/** `{ user, scope, limits }` for the current request. */
export const Ctx = createParamDecorator((_data: unknown, context: ExecutionContext): ReqCtx => {
  const request = context.switchToHttp().getRequest<CtxRequest>();
  if (!request.user) throw new Error('Ctx used on a public route');
  return { user: request.user, scope: request.aclScope ?? 'all', limits: request.aclLimits ?? {} };
});
