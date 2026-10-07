import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';
import { CONTROL_SCHEMA } from '../db/tenant.model.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { ConnectionRegistry } from './connection-registry.js';
import { quoteIdent, runWithTenant } from './context.js';
import { markTx } from './guards.js';
import { controlModelsOf, tenantModelsOf } from './model-binding.js';
import { orderByDependencies, undeclaredIdColumns } from './ref-graph.js';

/**
 * Creates and updates tables, one schema at a time. Nest's own `synchronize` is off: it would try
 * to create every table in the default schema, and the foreign key to the `companies` mirror has
 * to resolve inside the schema being built. Each schema is synced in one transaction whose
 * `search_path` is that schema.
 */
@Injectable()
export class SchemaSync {
  private readonly logger = new Logger('SchemaSync');
  private readonly parity = new Map<string, Promise<void>>();

  constructor(
    private readonly registry: ConnectionRegistry,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {}

  private get alter(): boolean {
    return this.options.dbSync === 'alter';
  }

  /** The control plane's tables, in the `platform` schema. */
  async syncControl(): Promise<void> {
    const sequelize = this.registry.control;
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(CONTROL_SCHEMA)}`);
    const models = orderByDependencies(controlModelsOf(this.registry.control));
    await sequelize.transaction(async (t) => {
      markTx(t, { kind: 'control', dbKey: this.registry.controlKey });
      await sequelize.query(`SET LOCAL search_path TO ${quoteIdent(CONTROL_SCHEMA)}`, { transaction: t });
      for (const model of models) await model.sync({ alter: this.alter, transaction: t } as never);
    });
  }

  /** Every tenant table, in `schema` of `dbKey`. Creates the schema when it is missing. */
  async syncTenant(dbKey: string, schema: string): Promise<void> {
    const sequelize = await this.registry.get(dbKey);
    const problems = undeclaredIdColumns(tenantModelsOf(sequelize));
    if (problems.length) throw new Error(`Undeclared id columns (declare a foreign key, @SoftRef or @NotARef): ${problems.join(', ')}`);
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schema)}`);
    const models = orderByDependencies(tenantModelsOf(sequelize));
    // Models read the schema from the tenant context, so the context for a sync is the schema itself.
    await runWithTenant({ ref: { companyId: 0 }, placement: { dbKey, schema, epoch: 0 }, sequelize }, () =>
      sequelize.transaction(async (t) => {
        markTx(t, { kind: 'tenant', dbKey });
        await sequelize.query(`SET LOCAL search_path TO ${quoteIdent(schema)}`, { transaction: t });
        for (const model of models) await model.sync({ alter: this.alter, transaction: t } as never);
      }),
    );
    this.parity.delete(`${dbKey}:${schema}`);
    this.logger.log(`Synced ${models.length} tables in ${dbKey}.${schema}`);
  }

  /** Drops a tenant schema (tests and `db:reset`). */
  async dropSchema(dbKey: string, schema: string): Promise<void> {
    const sequelize = await this.registry.get(dbKey);
    await sequelize.query(`DROP SCHEMA IF EXISTS ${quoteIdent(schema)} CASCADE`);
    this.parity.delete(`${dbKey}:${schema}`);
  }

  /**
   * Once per `(dbKey, schema)`: every table and column the models need exists. A lagging schema
   * would fail later with a confusing "column does not exist", so that tenant gets a 503 instead.
   */
  checkParity(sequelize: Sequelize, dbKey: string, schema: string): Promise<void> {
    const key = `${dbKey}:${schema}`;
    const known = this.parity.get(key);
    if (known) return known;
    const check = this.compare(sequelize, schema).catch((error: unknown) => {
      this.parity.delete(key);
      throw error;
    });
    this.parity.set(key, check);
    return check;
  }

  private async compare(sequelize: Sequelize, schema: string): Promise<void> {
    const rows = await sequelize.query<{ table_name: string; column_name: string }>(
      'SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = :schema',
      { replacements: { schema }, type: QueryTypes.SELECT },
    );
    const have = new Map<string, Set<string>>();
    for (const row of rows) have.set(row.table_name, (have.get(row.table_name) ?? new Set()).add(row.column_name));
    const missing: string[] = [];
    for (const model of tenantModelsOf(sequelize)) {
      const columns = have.get(model.tableName);
      if (!columns) {
        missing.push(model.tableName);
        continue;
      }
      for (const [attribute, definition] of Object.entries(model.getAttributes())) {
        const field = (definition as { field?: string }).field ?? attribute;
        if (!columns.has(field)) missing.push(`${model.tableName}.${field}`);
      }
    }
    if (missing.length) {
      throw new ServiceUnavailableException(`Database schema "${schema}" is out of date (missing ${missing.slice(0, 5).join(', ')}). Run the migration.`);
    }
  }
}
