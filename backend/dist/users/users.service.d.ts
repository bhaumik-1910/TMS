import { UserModel, UserRoleModel, RoleModel, RolePermissionModel, PermissionModel, AuditLogModel } from '../database/models';
export declare class UsersService {
    private userModel;
    private roleModel;
    private permissionModel;
    private rolePermissionModel;
    private userRoleModel;
    private auditLogModel;
    constructor(userModel: typeof UserModel, roleModel: typeof RoleModel, permissionModel: typeof PermissionModel, rolePermissionModel: typeof RolePermissionModel, userRoleModel: typeof UserRoleModel, auditLogModel: typeof AuditLogModel);
    findAll(organizationId?: string): Promise<UserModel[]>;
    findOne(id: string): Promise<UserModel>;
    create(data: any, currentOrgId: string): Promise<UserModel>;
    update(id: string, data: any): Promise<UserModel>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getRoles(): Promise<RoleModel[]>;
    getPermissions(): Promise<PermissionModel[]>;
    createRole(data: {
        name: string;
        description?: string;
        permissionIds?: string[];
    }, currentUserId: string, orgId: string): Promise<RoleModel>;
    updateRole(id: string, data: {
        name?: string;
        description?: string;
        permissionIds?: string[];
    }, currentUserId: string, orgId: string): Promise<RoleModel>;
    deleteRole(id: string, currentUserId: string, orgId: string): Promise<{
        success: boolean;
    }>;
    assignUserRoles(targetUserId: string, roleIds: string[], currentUserId: string, orgId: string): Promise<UserModel>;
}
