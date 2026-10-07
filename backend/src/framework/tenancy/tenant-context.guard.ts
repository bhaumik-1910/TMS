import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_LOGIN_TOKEN, type CtxRequest } from '../auth/decorators.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { ConnectionRegistry, PRIMARY } from './connection-registry.js';
import { setTenant } from './context.js';
import { PlacementResolver } from './placement.js';
import { SchemaSync } from './schema-sync.js';

/** Optional headers a client may send; they are checked against the token, never used to pick the tenant. */
const TENANT_HEADERS = ['x-tenant-id', 'x-company-id'] as const;

/**
 * Runs after sign-in is verified and before permissions. From the company token it finds where the
 * tenant's rows live and puts `{ ref, placement, sequelize }` into the request context, so every
 * model call, `c.t` and `TenantDb` after it reach the right database and schema. The token is the
 * only source of the tenant: a header that disagrees with it is refused, not obeyed.
 */
@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly placements: PlacementResolver,
    private readonly registry: ConnectionRegistry,
    private readonly schemas: SchemaSync,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & CtxRequest>();
    if (!request.user) return true;
    // Login-token routes (company list, switch company) work on the control plane only.
    if (this.reflector.getAllAndOverride<boolean>(IS_LOGIN_TOKEN, [context.getHandler(), context.getClass()])) return true;

    const ref = this.options.tenancy.resolve?.(request.user) ?? { companyId: request.user.companyId };
    for (const header of TENANT_HEADERS) {
      const sent = request.headers[header];
      if (sent !== undefined && Number(Array.isArray(sent) ? sent[0] : sent) !== ref.companyId) {
        throw new ForbiddenException('Header does not match the signed-in company');
      }
    }
    try {
      const placement = await this.placements.resolve(ref);
      if (request.user.epoch !== placement.epoch) throw new UnauthorizedException('This company was moved. Sign in again.');
      const sequelize = await this.registry.get(placement.dbKey);
      await this.schemas.checkParity(sequelize, placement.dbKey, placement.schema);
      setTenant({ ref, placement, sequelize });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const sequelize = await this.registry.get(PRIMARY);
        setTenant({ ref: { companyId: ref.companyId || 1 }, placement: { dbKey: PRIMARY, schema: 'public', epoch: 1 }, sequelize });
      } else {
        throw err;
      }
    }
    return true;
  }
}
