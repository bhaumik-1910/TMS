import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, BelongsToMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from './organization.model';
import { RoleModel } from './role.model';
import { UserRoleModel } from './user-role.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class UserModel extends Model<UserModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash: string;

  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatarUrl?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  lastLoginAt?: Date;

  @BelongsToMany(() => RoleModel, () => UserRoleModel)
  roles: RoleModel[];

  @HasMany(() => UserRoleModel, { onDelete: 'CASCADE' })
  userRoles: UserRoleModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
