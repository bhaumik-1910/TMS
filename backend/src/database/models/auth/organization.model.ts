import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { UserModel } from './user.model';

@Table({
  tableName: 'organizations',
  timestamps: true,
})
export class OrganizationModel extends Model<OrganizationModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, defaultValue: 'America/Chicago' })
  timezone: string;

  @Column({ type: DataType.STRING, defaultValue: 'USD' })
  currency: string;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  logoUrl?: string;

  @HasMany(() => UserModel, { onDelete: 'CASCADE' })
  users: UserModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
