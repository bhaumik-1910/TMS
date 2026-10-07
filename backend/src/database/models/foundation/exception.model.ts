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

export const EXCEPTION_TYPES = [
  'fuel_anomaly',
  'compliance',
  'credit_limit',
  'overdue_invoice',
  'advance_limit',
  'pod',
  'route_deviation',
] as const;

export type ExceptionType = (typeof EXCEPTION_TYPES)[number];
export type Severity = 'low' | 'medium' | 'high';

/**
 * Operational anomaly and exception tracking ledger (Ankpal-style).
 */
@Table({
  tableName: 'exceptions',
  timestamps: true,
  indexes: [
    { fields: ['organization_id', 'resolved_at', 'severity'] },
    { fields: ['organization_id', 'type', 'ref_type', 'ref_id'] },
  ],
})
export class ExceptionModel extends Model {
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

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'branch_id',
  })
  branchId: number;

  @Column({
    type: DataType.STRING(40),
    allowNull: false,
    defaultValue: 'fuel_anomaly',
  })
  type: ExceptionType;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
  })
  severity: Severity;

  @Column({
    type: DataType.STRING(180),
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  detail: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
    field: 'ref_type',
  })
  refType: string;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'ref_id',
  })
  refId: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'occurred_on',
  })
  occurredOn: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'resolved_at',
  })
  resolvedAt: Date;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'resolved_by_id',
  })
  resolvedById: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
