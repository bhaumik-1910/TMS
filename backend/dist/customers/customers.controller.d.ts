import { CustomersService } from './customers.service';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
    findAll(orgId: string, search?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(orgId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<void>;
}
