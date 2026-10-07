import { Column, DataType, Table } from 'sequelize-typescript';
import { TenantModel, tenantTable } from '../../framework/db/tenant.model.js';

@Table(tenantTable('branches', [{ unique: true, fields: ['company_id', 'code'] }]))
export class Branch extends TenantModel {
  @Column({ type: DataType.STRING(120), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  code: string;

  @Column({ type: DataType.STRING(80), allowNull: true })
  city: string | null;

  @Column({ type: DataType.STRING(2), allowNull: true })
  stateCode: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isHeadOffice: boolean;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: 'active' | 'inactive';
}
