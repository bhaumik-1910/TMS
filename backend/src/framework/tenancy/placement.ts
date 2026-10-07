import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { TenantRouting } from './control/tenant-routing.model.js';
import type { Placement, TenantRef } from './context.js';
import { PRIMARY } from './connection-registry.js';

export interface ResolveOptions {
  /** Provisioning and moves read the route whatever its status. */
  ignoreStatus?: boolean;
}

interface Cached {
  at: number;
  value: Placement;
}

/**
 * Turns a tenant into `{ dbKey, schema, epoch }`. Fails closed: a missing route is a 404, a route
 * that is creating, moving or disabled is a 503. It never falls back to the primary database.
 */
@Injectable()
export class PlacementResolver {
  private readonly cache = new Map<number, Cached>();

  constructor(
    @InjectModel(TenantRouting) private readonly routing: typeof TenantRouting,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {}

  async resolve(ref: TenantRef, resolveOptions: ResolveOptions = {}): Promise<Placement> {
    const config = this.options.tenancy.placement;
    if (config.strategy === 'single') return { dbKey: config.dbKey ?? PRIMARY, schema: config.schema, epoch: 1 };
    if (config.strategy === 'schemaPerTenant') return { dbKey: config.dbKey ?? PRIMARY, schema: `${config.prefix}${ref.companyId}`, epoch: 1 };

    const ttl = config.cacheMs ?? 30_000;
    const hit = this.cache.get(ref.companyId);
    if (hit && Date.now() - hit.at < ttl && !resolveOptions.ignoreStatus) return hit.value;

    const row = await this.routing.findOne({ where: { companyId: ref.companyId } });
    if (!row) throw new NotFoundException('Company not found');
    if (row.status !== 'active' && !resolveOptions.ignoreStatus) {
      this.cache.delete(ref.companyId);
      throw new ServiceUnavailableException(row.status === 'migrating' ? 'This company is being moved. Try again in a moment.' : `Company is ${row.status}`);
    }
    const value: Placement = { dbKey: row.dbKey, schema: row.schema, epoch: row.epoch };
    if (row.status === 'active') this.cache.set(ref.companyId, { at: Date.now(), value });
    return value;
  }

  /** After a routing change. Without an id, everything. */
  invalidate(companyId?: number): void {
    if (companyId === undefined) this.cache.clear();
    else this.cache.delete(companyId);
  }

  /** Active routes, for boot sync and `forEach` over every tenant. */
  async activeRoutes(): Promise<TenantRouting[]> {
    return this.routing.findAll({ where: { status: 'active' }, order: [['companyId', 'ASC']] });
  }
}
