import { Table } from 'sequelize-typescript';
import { Int, Json, Str } from '../db/columns.js';
import { Polymorphic, SoftRef } from '../db/refs.js';
import { TenantModel, tenantTable } from '../db/tenant.model.js';

/** Who did what to which row: create, update (with changed fields), delete and every named action. */
@Polymorphic({ typeColumn: 'entityType', idColumn: 'entityId' })
@Table(tenantTable('entity_events', [{ fields: ['company_id', 'entity_type', 'entity_id', 'created_at'] }]))
export class EntityEvent extends TenantModel {
  @Str(40)
  entityType: string;

  @Int()
  entityId: number;

  /** `create`, `update`, `delete` or `action:<name>`. */
  @Str(60)
  event: string;

  @SoftRef('users', { zeroIsSystem: true })
  @Int({ nullable: true })
  userId: number | null;

  /** Changed fields as `{ field: [before, after] }`, or the action input. */
  @Json()
  data: Record<string, unknown> | null;
}
