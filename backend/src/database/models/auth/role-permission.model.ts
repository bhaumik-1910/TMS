import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';

@Table({
  tableName: 'role_permissions',
  timestamps: true,
  updatedAt: false,
})
export class RolePermissionModel extends Model<RolePermissionModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  roleId: string;

  @BelongsTo(() => RoleModel, { onDelete: 'CASCADE' })
  role: RoleModel;

  @ForeignKey(() => PermissionModel)
  @Column({ type: DataType.STRING, allowNull: false })
  permissionId: string;

  @BelongsTo(() => PermissionModel, { onDelete: 'CASCADE' })
  permission: PermissionModel;

  @CreatedAt
  createdAt: Date;
}
