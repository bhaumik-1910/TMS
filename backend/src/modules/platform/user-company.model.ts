import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable, ref } from '../../framework/db/tenant.model.js';

export const MEMBERSHIP_STATUSES = ['pending', 'invited', 'active', 'blocked'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/**
 * Which companies a person can sign in to. `pending` is written before the tenant user exists and
 * turned `active` after that write commits, so a failed tenant write never leaves a working login.
 */
@Table(controlTable('user_companies', 'UserCompany', [{ unique: true, fields: ['platform_user_id', 'company_id'] }, { fields: ['company_id', 'status'] }]))
export class UserCompany extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('users', 'CASCADE') })
  platformUserId: number;

  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('companies', 'CASCADE') })
  companyId: number;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'pending' })
  status: MembershipStatus;

  /** Pre-selected in the company picker. */
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDefault: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  lastUsedAt: Date | null;

  /** After this moment the person can no longer open the company (contractors, trials). */
  @Column({ type: DataType.DATE, allowNull: true })
  accessExpiresAt: Date | null;
}
