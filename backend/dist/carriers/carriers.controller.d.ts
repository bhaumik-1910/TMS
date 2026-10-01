import { CarriersService } from './carriers.service';
export declare class CarriersController {
    private carriersService;
    constructor(carriersService: CarriersService);
    findAll(orgId: string, search?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(orgId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<import("../database/models").CarrierModel>;
    addRate(id: string, body: any): Promise<import("../database/models").CarrierRateModel>;
    remove(id: string): Promise<void>;
}
