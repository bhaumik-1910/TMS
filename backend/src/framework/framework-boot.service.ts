import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { PermissionCatalogService } from './acl/permission-catalog.service.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from './options.js';
import { PRIMARY } from './tenancy/connection-registry.js';
import { PlacementResolver } from './tenancy/placement.js';
import { SchemaSync } from './tenancy/schema-sync.js';
import { TenantRunner } from './tenancy/tenant-runner.js';

/**
 * Boot work in order: tables of the control plane, tables of every routed tenant schema, then the
 * permission catalog of each. Only with `DB_SYNC=alter`; in production, schemas are migrated
 * separately and a lagging schema is refused per request (`SchemaSync.checkParity`).
 */
@Injectable()
export class FrameworkBoot implements OnApplicationBootstrap {
  private readonly logger = new Logger('FrameworkBoot');

  constructor(
    private readonly schemas: SchemaSync,
    private readonly placements: PlacementResolver,
    private readonly runner: TenantRunner,
    private readonly catalog: PermissionCatalogService,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.options.dbSync !== 'alter') return;
    await this.schemas.syncControl();
    const placement = this.options.tenancy.placement;
    const targets = new Map<string, { dbKey: string; schema: string }>();
    if (placement.strategy === 'single') targets.set(`${placement.dbKey ?? PRIMARY}.${placement.schema}`, { dbKey: placement.dbKey ?? PRIMARY, schema: placement.schema });
    if (placement.strategy === 'routed') {
      for (const route of await this.placements.activeRoutes()) targets.set(`${route.dbKey}.${route.schema}`, { dbKey: route.dbKey, schema: route.schema });
    }
    for (const target of targets.values()) {
      await this.schemas.syncTenant(target.dbKey, target.schema);
      await this.runner.run({ companyId: 0 }, () => this.catalog.sync(), { placement: { ...target, epoch: 0 } });
    }
    this.logger.log(`Booted ${targets.size} tenant schema(s)`);
  }
}
