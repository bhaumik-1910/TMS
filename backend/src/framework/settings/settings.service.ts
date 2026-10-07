import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';
import { recordEvent } from '../audit/record.js';
import type { ReqCtx } from '../auth/auth-user.js';
import { fieldErrors } from '../errors.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { TenantDb } from '../tenancy/tenant-db.js';
import { CompanySetting } from './company-setting.model.js';
import type { SettingDef } from './settings.js';

const TYPES: Record<SettingDef['type'], (value: unknown) => boolean> = {
  boolean: (value) => typeof value === 'boolean',
  number: (value) => typeof value === 'number' && Number.isFinite(value),
  string: (value) => typeof value === 'string',
};

/** Typed company settings: declared in code, stored per company, defaults when unset. */
@Injectable()
export class SettingsService {
  private readonly defs = new Map<string, SettingDef>();

  constructor(
    @InjectModel(CompanySetting) private readonly rows: typeof CompanySetting,
    private readonly db: TenantDb,
    @Inject(FRAMEWORK_OPTIONS) options: FrameworkOptions,
  ) {
    for (const def of options.settings ?? []) this.defs.set(def.key, def);
  }

  definitions(): SettingDef[] {
    return [...this.defs.values()];
  }

  /** Every setting with its stored value or default. One query. */
  async all(companyId: number, t?: Transaction): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const def of this.defs.values()) out[def.key] = def.default;
    const stored = await this.rows.findAll({ where: { companyId }, ...(t ? { transaction: t } : {}) });
    for (const row of stored) if (this.defs.has(row.key)) out[row.key] = row.value;
    return out;
  }

  async set(ctx: ReqCtx, values: Record<string, unknown>): Promise<Record<string, unknown>> {
    const errors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(values)) {
      const def = this.defs.get(key);
      if (!def) errors[key] = ['Unknown setting'];
      else if (!TYPES[def.type](value)) errors[key] = [`Expected a ${def.type}`];
    }
    if (Object.keys(errors).length) throw fieldErrors(errors);
    await this.db.tx(async (t) => {
      for (const [key, value] of Object.entries(values)) {
        const row = await this.rows.findOne({ where: { companyId: ctx.user.companyId, key }, transaction: t });
        if (row) {
          const before = row.value;
          if (JSON.stringify(before) === JSON.stringify(value)) continue;
          await row.update({ value, updatedById: ctx.user.id }, { transaction: t });
          await recordEvent(t, ctx, 'CompanySetting', row.id as number, 'update', { [key]: [before, value] });
        } else {
          const created = await this.rows.create({ key, value, createdById: ctx.user.id, updatedById: ctx.user.id } as never, { transaction: t });
          await recordEvent(t, ctx, 'CompanySetting', created.id as number, 'create', { [key]: value });
        }
      }
    });
    return this.all(ctx.user.companyId);
  }
}
