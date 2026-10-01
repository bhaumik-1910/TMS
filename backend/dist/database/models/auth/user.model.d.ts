import { Model } from 'sequelize-typescript';
import { OrganizationModel } from './organization.model';
import { RoleModel } from './role.model';
import { UserRoleModel } from './user-role.model';
export declare class UserModel extends Model<UserModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status: string;
    avatarUrl?: string;
    lastLoginAt?: Date;
    roles: RoleModel[];
    userRoles: UserRoleModel[];
    createdAt: Date;
    updatedAt: Date;
}
