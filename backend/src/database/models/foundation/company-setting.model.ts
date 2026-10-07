import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';

/**
 * Stores typed key-value settings per organization/company
 */
@Table({
  tableName: 'company_settings',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['organization_id', 'key'] },
  ],
})
export class CompanySettingModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'organization_id',
  })
  organizationId: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  key: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  value: any;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
