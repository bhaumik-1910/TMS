import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable, ref } from '../../framework/db/tenant.model.js';

/** A company's plan and its validity. A company can open only while one of its licenses is valid. */
@Table(controlTable('company_licenses', 'CompanyLicense', [{ fields: ['company_id', 'valid_to'] }]))
export class CompanyLicense extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('companies', 'CASCADE') })
  companyId: number;

  @Column({ type: DataType.INTEGER, allowNull: false, ...ref('licenses', 'RESTRICT') })
  licenseId: number;

  /** Seats for this company; overrides the plan's `maxUsers` when set. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  seats: number | null;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  validFrom: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  validTo: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: 'active' | 'cancelled';
}
