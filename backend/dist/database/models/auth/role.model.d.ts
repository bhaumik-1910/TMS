import { Model } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';
export declare class RoleModel extends Model<RoleModel> {
    id: string;
    name: string;
    description?: string;
    users: UserModel[];
    permissions: PermissionModel[];
    rolePermissions: RolePermissionModel[];
    createdAt: Date;
    updatedAt: Date;
}
