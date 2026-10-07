import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { NotARef } from '../../framework/db/refs.js';
import { TenantModel, tenantTable } from '../../framework/db/tenant.model.js';
import type { Rel } from '../../framework/db/rel.js';
import { Role } from '../../framework/acl/role.model.js';
import { Branch } from '../branches/branch.model.js';
import { UserBranch } from './user-branch.model.js';

export const USER_STATUSES = ['pending', 'active', 'inactive', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_TYPES = ['staff', 'driver', 'customer', 'ca'] as const;
export type UserType = (typeof USER_TYPES)[number];

@Table(
  tenantTable('users', [
    { unique: true, fields: ['company_id', 'email'] },
    { unique: true, fields: ['company_id', 'platform_user_id'] },
    { unique: true, fields: ['company_id', 'code'] },
    { fields: ['company_id', 'role_id'] },
    { fields: ['company_id', 'status'] },
  ]),
)
export class User extends TenantModel {
  @Column({ type: DataType.STRING(20), allowNull: false })
  code: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(160), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  phone: string | null;

  /** The sign-in identity in the control plane (`platform.users`): another database, so no foreign key. */
  @NotARef()
  @Column({ type: DataType.INTEGER, allowNull: false })
  platformUserId: number;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: true, onDelete: 'SET NULL' })
  roleId: number | null;

  /** Default branch. The full list is in `user_branches`. */
  @ForeignKey(() => Branch)
  @Column({ type: DataType.INTEGER, allowNull: true, onDelete: 'SET NULL' })
  branchId: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'staff' })
  userType: UserType;

  /** Driver or customer party this login acts for, for portal access. The parties table comes later. */
  @NotARef()
  @Column({ type: DataType.INTEGER, allowNull: true })
  partyId: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: UserStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  lastLoginAt: Date | null;

  @BelongsTo(() => Role, { onDelete: 'SET NULL' })
  role?: Rel<Role>;

  @BelongsTo(() => Branch, { foreignKey: 'branchId', onDelete: 'SET NULL' })
  branch?: Rel<Branch>;

  @BelongsToMany(() => Branch, () => UserBranch)
  branches?: Rel<Branch[]>;
}
