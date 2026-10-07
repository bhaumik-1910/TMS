import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { controlTable } from '../../framework/db/tenant.model.js';

/** A plan: what a company may use. */
@Table(controlTable('licenses', 'License', [{ unique: true, fields: ['code'] }]))
export class License extends Model {
  @Column({ type: DataType.STRING(40), allowNull: false })
  code: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  name: string;

  /** Active people (seats) a company on this plan may have. */
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
  maxUsers: number;
}
