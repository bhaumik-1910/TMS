import { BaseSequelizeService } from '../common/base/base.service';
import { OrganizationModel, UserModel } from '../database/models';
export declare class OrganizationsService extends BaseSequelizeService<OrganizationModel> {
    private readonly orgModel;
    constructor(orgModel: typeof OrganizationModel);
    findAllOrgs(): Promise<{
        _count: {
            users: number;
        };
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
        deletedAt?: Date | any;
        version?: number | any;
        _attributes: OrganizationModel;
        dataValues: OrganizationModel;
        _creationAttributes: OrganizationModel;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<OrganizationModel, OrganizationModel>;
    }[]>;
    findAll(where?: any): Promise<any>;
    findOneOrg(id: string): Promise<{
        _count: {
            users: number;
        };
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
        deletedAt?: Date | any;
        version?: number | any;
        _attributes: OrganizationModel;
        dataValues: OrganizationModel;
        _creationAttributes: OrganizationModel;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<OrganizationModel, OrganizationModel>;
    }>;
    findOne(optionsOrId: any): Promise<any>;
}
