import { Model } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { RoleModel } from './role.model';
export declare class UserRoleModel extends Model<UserRoleModel> {
    id: string;
    userId: string;
    user: UserModel;
    roleId: string;
    role: RoleModel;
    createdAt: Date;
}
