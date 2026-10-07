import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { PartitionedModel, partitionedTable } from '../../framework/db/tenant.model.js';
import { Branch } from '../branches/branch.model.js';
import { User } from './user.model.js';

/** Branches a user may work in; drives the `branch` permission scope. */
@Table(partitionedTable('user_branches', [{ unique: true, fields: ['company_id', 'user_id', 'branch_id'] }]))
export class UserBranch extends PartitionedModel {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  userId: number;

  @ForeignKey(() => Branch)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  branchId: number;
}
