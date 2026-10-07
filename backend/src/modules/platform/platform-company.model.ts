import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable } from '../../framework/db/tenant.model.js';

/** The SaaS customer, in the control plane. Its id is the partition value in every tenant table. */
@Table(controlTable('companies', 'PlatformCompany', [{ unique: true, fields: ['code'] }]))
export class PlatformCompany extends Model {
  @Column({ type: DataType.STRING(160), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(40), allowNull: false })
  code: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  gstin: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: 'active' | 'suspended';
}
