import { Table } from 'sequelize-typescript';
import { Json, Str } from '../db/columns.js';
import { TenantModel, tenantTable } from '../db/tenant.model.js';

/** One stored value of a typed setting. Settings without a row use the default declared in code. */
@Table(tenantTable('company_settings', [{ unique: true, fields: ['company_id', 'key'] }]))
export class CompanySetting extends TenantModel {
  @Str(120)
  key: string;

  @Json({ nullable: false })
  value: unknown;
}
