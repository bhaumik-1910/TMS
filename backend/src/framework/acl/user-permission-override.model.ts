import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { PartitionedModel, partitionedTable } from '../db/tenant.model.js';
import type { AclScope, Limits } from '../auth/auth-user.js';
import type { Rel } from '../db/rel.js';
import { Permission } from './permission.model.js';

/** Per-user grant or deny on top of the role, as Ankpal's user-level ACL rows. */
@Table(partitionedTable('user_permission_overrides', [{ unique: true, fields: ['company_id', 'user_id', 'permission_id'] }]))
export class UserPermissionOverride extends PartitionedModel {
  @Column({ type: DataType.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' })
  userId: number;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  permissionId: number;

  @Column({ type: DataType.STRING(10), allowNull: false })
  effect: 'grant' | 'deny';

  @Column({ type: DataType.STRING(40), allowNull: false, defaultValue: 'all' })
  scope: AclScope;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  limits: Limits;

  @BelongsTo(() => Permission, { onDelete: 'CASCADE' })
  permission?: Rel<Permission>;
}
