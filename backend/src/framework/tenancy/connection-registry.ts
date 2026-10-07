import { Inject, Injectable, Logger, ServiceUnavailableException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { decryptSecret } from './control/shard-crypto.js';
import { TenantShard } from './control/tenant-shard.model.js';
import { installQueryGuards } from './guards.js';
import { bindTenantModels, controlModelsOf, tenantModelsOf } from './model-binding.js';

export const PRIMARY = 'primary';
export const CONTROL = 'control';

/** Tenant connections start with no usable schema: raw SQL that skips `c.t` / `TenantDb` fails loudly. */
export const UNSET_SEARCH_PATH = 'tenant_unset';

/** Connection options every pool of this app shares. */
export function connectionOptions(poolMax: number) {
  return {
    dialect: 'postgres' as const,
    logging: false as const,
    define: { underscored: true },
    pool: { max: poolMax, min: 0, idle: 10_000, acquire: 30_000 },
    dialectOptions: { options: `-c search_path=${UNSET_SEARCH_PATH}` },
  };
}

/**
 * One pool per `dbKey`. The Nest connection is adopted as `primary`, so there is never a second
 * pool to the same database. Other shards are opened on first use (with an init lock so two
 * requests do not open two pools) from the URI in the control plane's `tenant_shards`, and the
 * already-initialised model classes are registered on them, never initialised again.
 */
@Injectable()
export class ConnectionRegistry implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger('Connections');
  private readonly instances = new Map<string, Sequelize>();
  private readonly opening = new Map<string, Promise<Sequelize>>();
  private controlInstance: Sequelize | null = null;

  constructor(
    @InjectConnection() private readonly primary: Sequelize,
    @InjectModel(TenantShard) private readonly shards: typeof TenantShard,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {
    this.instances.set(PRIMARY, primary);
    installQueryGuards(primary, PRIMARY);
    bindTenantModels(primary, () => this.control);
  }

  async onModuleInit(): Promise<void> {
    await this.openControl();
  }

  /** The connection of the control plane: the primary pool unless `controlDbUri` is set. */
  get control(): Sequelize {
    return this.controlInstance ?? this.primary;
  }

  /** The dbKey the control plane's connection answers to (for transaction marks and guards). */
  get controlKey(): string {
    return this.controlInstance ? CONTROL : PRIMARY;
  }

  /** Opens the separate control database when configured. Called once at boot, before any request. */
  async openControl(): Promise<void> {
    if (!this.options.controlDbUri || this.controlInstance) return;
    const sequelize = new Sequelize(this.options.controlDbUri, connectionOptions(5));
    this.register(sequelize, controlModelsOf(this.primary));
    installQueryGuards(sequelize, CONTROL);
    await sequelize.authenticate();
    this.controlInstance = sequelize;
    this.logger.log('Control plane runs on its own database');
  }

  /** Connection for `dbKey`; refuses a shard that is not active. */
  async get(dbKey: string): Promise<Sequelize> {
    const hit = this.instances.get(dbKey);
    if (hit) return hit;
    const pending = this.opening.get(dbKey);
    if (pending) return pending;
    const opening = this.open(dbKey).finally(() => this.opening.delete(dbKey));
    this.opening.set(dbKey, opening);
    return opening;
  }

  private async open(dbKey: string): Promise<Sequelize> {
    const shard = await this.shards.findOne({ where: { dbKey } });
    if (!shard) throw new ServiceUnavailableException(`Unknown database "${dbKey}"`);
    if (shard.status !== 'active' && shard.status !== 'standby') throw new ServiceUnavailableException(`Database "${dbKey}" is ${shard.status}`);
    if (!shard.connectionUri) throw new ServiceUnavailableException(`Database "${dbKey}" has no connection`);
    const pools = { cloud: 30, onprem: 10, ...this.options.shardPool };
    const uri = decryptSecret(shard.connectionUri, this.options.secretKey);
    const sequelize = new Sequelize(uri, connectionOptions(shard.poolMax ?? pools[shard.type]));
    // Register the shared model classes without re-initialising them: init would repoint every
    // other request in the process at this shard.
    this.register(sequelize, tenantModelsOf(this.primary));
    installQueryGuards(sequelize, dbKey);
    await sequelize.authenticate();
    this.instances.set(dbKey, sequelize);
    this.logger.log(`Opened database "${dbKey}"`);
    return sequelize;
  }

  private register(sequelize: Sequelize, models: ReturnType<typeof tenantModelsOf>): void {
    for (const model of models) {
      sequelize.modelManager.addModel(model as never);
      (sequelize.models as Record<string, unknown>)[model.name] = model;
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const [key, sequelize] of this.instances) if (key !== PRIMARY) await sequelize.close();
    await this.controlInstance?.close();
  }
}
