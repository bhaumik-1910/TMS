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
  tableName: 'document_sequences',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['organization_id', 'doc_type', 'period'] },
  ],
})
export class DocumentSequenceModel extends Model {
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
    type: DataType.STRING(30),
    allowNull: false,
    field: 'doc_type',
  })
  docType: string;

  /** Two-digit year or financial year e.g. '24-25' or '26' */
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  period: string;

  /** Standard Prefix e.g. 'LR', 'TRIP', 'INV' */
  @Column({
    type: DataType.STRING(15),
    allowNull: false,
    defaultValue: '',
  })
  prefix: string;

  /** The last number handed out */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'next_value',
  })
  nextValue: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
