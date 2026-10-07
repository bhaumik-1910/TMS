import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable, ref } from '../../framework/db/tenant.model.js';

/** Only the SHA-256 of the token is stored. Rotated on every refresh. Bound to the company it was issued for. */
@Table(controlTable('refresh_tokens', 'RefreshToken', [{ unique: true, fields: ['token_hash'] }, { fields: ['platform_user_id', 'company_id'] }]))
export class RefreshToken extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('users', 'CASCADE') })
  platformUserId: number;

  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('companies', 'CASCADE') })
  companyId: number;

  @Column({ type: DataType.STRING(64), allowNull: false })
  tokenHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  revokedAt: Date | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  userAgent: string | null;
}
