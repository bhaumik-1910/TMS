import { Table } from 'sequelize-typescript';
import { Day, Int } from '../db/columns.js';
import { SoftRef } from '../db/refs.js';
import { TenantModel, tenantTable } from '../db/tenant.model.js';

/**
 * Records dated on or before `lockedUntil` can no longer be created, changed or acted on (a
 * closed financial year, a filed return). One row per company; `branchId` 0 locks every branch,
 * a branch id locks just that branch.
 */
@Table(tenantTable('period_locks', [{ unique: true, fields: ['company_id', 'branch_id'] }]))
export class PeriodLock extends TenantModel {
  @SoftRef('branches', { zeroIsSystem: true })
  @Int({ default: 0 })
  branchId: number;

  @Day()
  lockedUntil: string;
}
