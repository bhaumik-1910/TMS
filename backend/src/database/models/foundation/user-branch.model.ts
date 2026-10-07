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

@Table({
  tableName: 'user_branches',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user_id', 'branch_id'] },
  ],
})
export class UserBranchModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @NotARef()
  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @NotARef()
  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'branch_id',
  })
  branchId: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_default',
  })
  isDefault: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
