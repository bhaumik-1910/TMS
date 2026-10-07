import { Column, DataType, Table } from 'sequelize-typescript';
import { TenantModel, tenantTable } from '../db/tenant.model.js';

@Table(tenantTable('document_sequences', [{ unique: true, fields: ['company_id', 'doc_type', 'period'] }]))
export class DocumentSequence extends TenantModel {
  @Column({ type: DataType.STRING(20), allowNull: false })
  docType: string;

  /** Two-digit year the numbers belong to. */
  @Column({ type: DataType.STRING(8), allowNull: false })
  period: string;

  /** The last number handed out. */
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  nextValue: number;
}
