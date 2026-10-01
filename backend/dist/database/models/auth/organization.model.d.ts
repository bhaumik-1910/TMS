import { Model } from 'sequelize-typescript';
import { UserModel } from './user.model';
export declare class OrganizationModel extends Model<OrganizationModel> {
    id: string;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    timezone: string;
    currency: string;
    status: string;
    logoUrl?: string;
    users: UserModel[];
    createdAt: Date;
    updatedAt: Date;
}
