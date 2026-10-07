import { Column, DataType, Model, Table } from 'sequelize-typescript';

/**
 * The company inside a tenant schema: a copy of the control plane's `companies` row, with the
 * same global id (never generated here). Every partitioned table's `company_id` references it,
 * so a company's rows and this mirror move together.
 */
@Table({ tableName: 'companies', underscored: true, timestamps: true })
export class Company extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: false })
  declare id: number;

  @Column({ type: DataType.STRING(160), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(40), allowNull: false })
  code: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  gstin: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  status: 'active' | 'suspended';
}
