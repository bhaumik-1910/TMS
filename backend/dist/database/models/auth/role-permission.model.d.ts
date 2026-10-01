import { Model } from 'sequelize-typescript';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';
export declare class RolePermissionModel extends Model<RolePermissionModel> {
    id: string;
    roleId: string;
    role: RoleModel;
    permissionId: string;
    permission: PermissionModel;
    createdAt: Date;
}
