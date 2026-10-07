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

@Table({
  tableName: 'branches',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['organization_id', 'code'] },
    { fields: ['organization_id', 'status'] },
  ],
})
export class BranchModel extends Model {
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
  name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.STRING(80),
    allowNull: true,
  })
  city: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: true,
    field: 'state_code',
  })
  stateCode: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  gstin: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_head_office',
  })
  isHeadOffice: boolean;

  @Column({
    type: DataType.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  })
  status: 'active' | 'inactive';

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
