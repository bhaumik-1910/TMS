import { Model } from 'sequelize-typescript';
import { RoleModel } from './role.model';
import { RolePermissionModel } from './role-permission.model';
export declare class PermissionModel extends Model<PermissionModel> {
    id: string;
    key: string;
    module: string;
    action: string;
    description?: string;
    roles: RoleModel[];
    rolePermissions: RolePermissionModel[];
    createdAt: Date;
    updatedAt: Date;
}
