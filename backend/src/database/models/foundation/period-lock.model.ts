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
 * Records dated on or before `lockedUntil` cannot be created, modified or cancelled.
 * branchId = 0 locks every branch, or a specific branchId locks that specific branch.
 */
@Table({
  tableName: 'period_locks',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['organization_id', 'branch_id'] },
  ],
})
export class PeriodLockModel extends Model {
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

  /** 0 = all branches across company, otherwise specific branchId */
  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'branch_id',
  })
  branchId: number;

  /** Formatted as YYYY-MM-DD */
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'locked_until',
  })
  lockedUntil: string;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'created_by_id',
  })
  createdById: number;

  @NotARef()
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'updated_by_id',
  })
  updatedById: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
