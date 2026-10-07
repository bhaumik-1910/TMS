import { Table } from 'sequelize-typescript';
import { Choice, Day, Fk, Int, LongText, Stamp, Str } from '../../framework/db/columns.js';
import { Polymorphic, SoftRef } from '../../framework/db/refs.js';
import { TenantModel, tenantTable } from '../../framework/db/tenant.model.js';

export const EXCEPTION_TYPES = ['fuel_anomaly', 'compliance', 'credit_limit', 'overdue_invoice', 'advance_limit', 'pod'] as const;
export const SEVERITIES = ['low', 'medium', 'high'] as const;
export type ExceptionType = (typeof EXCEPTION_TYPES)[number];
export type Severity = (typeof SEVERITIES)[number];

/** A business problem worth a person's attention. Raised by services in the same transaction as the cause. */
@Polymorphic({ typeColumn: 'refType', idColumn: 'refId' })
@Table(
  tenantTable('exceptions', [
    { fields: ['company_id', 'resolved_at', 'severity'] },
    { fields: ['company_id', 'type', 'ref_type', 'ref_id'] },
  ]),
)
export class ExceptionRecord extends TenantModel {
  @Fk('branches', { nullable: true })
  branchId: number | null;

  @Choice('fuel_anomaly', 30)
  type: ExceptionType;

  @Choice('medium')
  severity: Severity;

  @Str(160)
  title: string;

  @LongText()
  detail: string | null;

  @Str(30, { nullable: true })
  refType: string | null;

  @Int({ nullable: true })
  refId: number | null;

  @Day()
  occurredOn: string;

  @Stamp({ nullable: true })
  resolvedAt: Date | null;

  @SoftRef('users', { zeroIsSystem: true })
  @Int({ nullable: true })
  resolvedById: number | null;
}
