import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable } from '../../framework/db/tenant.model.js';

export const PLATFORM_USER_STATUSES = ['active', 'suspended'] as const;
export type PlatformUserStatus = (typeof PLATFORM_USER_STATUSES)[number];

/**
 * A person, once, across every company they work for: the sign-in identity. Holds the email and
 * password; what the person is inside a company (role, branches) is the tenant `users` row.
 */
@Table(controlTable('users', 'PlatformUser', [{ unique: true, fields: ['email'] }]))
export class PlatformUser extends Model {
  @Column({ type: DataType.STRING(160), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  passwordHash: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: PlatformUserStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  lastLoginAt: Date | null;
}
