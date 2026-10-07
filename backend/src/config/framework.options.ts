import { Op } from 'sequelize';
import type { ScopeDef } from '../framework/acl/scopes.js';
import { defineSetting } from '../framework/settings/settings.js';
import type { FrameworkOptions } from '../framework/options.js';
import { PERMISSION_CATALOG } from '../modules/acl/registry/permission.registry.js';
import { userFromClaims } from '../modules/auth/claims.js';
import type { AppConfig } from './app.config.js';

/** Rows still in use (status `active`), for masters where a role should only see live records. */
export const activeOnlyScope: ScopeDef = {
  id: 'active-only',
  label: 'Active records only',
  where: (_ctx, model) => ('status' in model.getAttributes() ? { status: { [Op.eq]: 'active' } } : null),
  allows: (_ctx, row) => (row.get('status') ?? 'active') === 'active',
};

export const TMS_SCOPES: ScopeDef[] = [activeOnlyScope];

export const TMS_SETTINGS = [
  defineSetting({ key: 'company.fiscalYearStart', type: 'string', default: '04-01', label: 'Financial year starts (MM-DD)', group: 'Company' }),
];

/** What TMS tells the framework: its permissions, scopes, settings, where tenants live and how tokens map to users. */
export function frameworkOptions(config: AppConfig): FrameworkOptions {
  return {
    catalog: PERMISSION_CATALOG,
    scopes: TMS_SCOPES,
    settings: TMS_SETTINGS,
    tenancy: { placement: { strategy: 'routed' }, sharedSchema: 'tenant_shared' },
    auth: { userClaims: userFromClaims },
    sequences: {
      prefixes: { lr: 'LR', trip: 'TRP', invoice: 'INV', purchase_bill: 'PB', settlement: 'STL', payment: 'PAY', job_card: 'JC', fuel_entry: 'FUEL', driver_ledger: 'DL' },
    },
    secretKey: config.erpTokenKey,
    dbSync: config.dbSync,
    controlDbUri: config.controlDbUri,
  };
}
