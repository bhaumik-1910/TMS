import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { NotARef } from '../../../framework/db/refs.js';

/**
 * Immutable audit ledger capturing who did what to which entity,
 * storing before/after JSONB diffs for full traceability.
 */
@Table({
  tableName: 'entity_events',
  timestamps: true,
  indexes: [
    { fields: ['organization_id', 'entity_type', 'entity_id', 'created_at'] },
    { fields: ['organization_id', 'event'] },
  ],
})
export class EntityEventModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'organization_id',
  })
  organizationId: string;

  @Column({
    type: DataType.STRING(60),
    allowNull: false,
    field: 'entity_type',
  })
  entityType: string;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'entity_id',
  })
  entityId: number;

  /** `create`, `update`, `delete`, or `action:<name>` */
  @Column({
    type: DataType.STRING(80),
    allowNull: false,
  })
  event: string;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  userId: number;

  /** Changed fields as `{ field: [before, after] }`, or action metadata */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  data: Record<string, any>;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
