import { Table, Column, Model, DataType, PrimaryKey, Default, BelongsToMany, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { RoleModel } from './role.model';
import { RolePermissionModel } from './role-permission.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
})
export class PermissionModel extends Model<PermissionModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  key: string;

  @Column({ type: DataType.STRING, allowNull: false })
  module: string;

  @Column({ type: DataType.STRING, allowNull: false })
  action: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @BelongsToMany(() => RoleModel, () => RolePermissionModel)
  roles: RoleModel[];

  @HasMany(() => RolePermissionModel, { onDelete: 'CASCADE' })
  rolePermissions: RolePermissionModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
