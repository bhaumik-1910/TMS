import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { RoleModel } from './role.model';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  updatedAt: false,
})
export class UserRoleModel extends Model<UserRoleModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.STRING, allowNull: false })
  userId: string;

  @BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
  user: UserModel;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  roleId: string;

  @BelongsTo(() => RoleModel, { onDelete: 'CASCADE' })
  role: RoleModel;

  @CreatedAt
  createdAt: Date;
}
