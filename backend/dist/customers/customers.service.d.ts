import { BaseSequelizeService } from '../common/base/base.service';
import { CustomerModel } from '../database/models';
export declare class CustomersService extends BaseSequelizeService<CustomerModel> {
    private readonly customerModel;
    constructor(customerModel: typeof CustomerModel);
    findAll(organizationId?: string, search?: string): Promise<any>;
    findOne(id: any): Promise<any>;
    create(organizationIdOrData: any, body?: any): Promise<any>;
    remove(id: string): Promise<void>;
}
