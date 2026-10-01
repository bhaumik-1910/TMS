import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any): Promise<import("../database/models").UserModel[]>;
    getRoles(): Promise<import("../database/models").RoleModel[]>;
    createRole(body: any, user: any): Promise<import("../database/models").RoleModel>;
    updateRole(id: string, body: any, user: any): Promise<import("../database/models").RoleModel>;
    deleteRole(id: string, user: any): Promise<{
        success: boolean;
    }>;
    assignUserRoles(id: string, roleIds: string[], user: any): Promise<import("../database/models").UserModel>;
    getPermissions(): Promise<import("../database/models").PermissionModel[]>;
    findOne(id: string): Promise<import("../database/models").UserModel>;
    create(body: any, user: any): Promise<import("../database/models").UserModel>;
    update(id: string, body: any): Promise<import("../database/models").UserModel>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
