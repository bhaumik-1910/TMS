import { Table, Column, Model, DataType, PrimaryKey, Default, BelongsToMany, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { UserRoleModel } from './user-role.model';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';

@Table({
  tableName: 'roles',
  timestamps: true,
})
export class RoleModel extends Model<RoleModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @BelongsToMany(() => UserModel, () => UserRoleModel)
  users: UserModel[];

  @BelongsToMany(() => PermissionModel, () => RolePermissionModel)
  permissions: PermissionModel[];

  @HasMany(() => RolePermissionModel, { onDelete: 'CASCADE' })
  rolePermissions: RolePermissionModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
