import { BaseSequelizeService } from '../common/base/base.service';
import { CarrierModel, CarrierRateModel } from '../database/models';
export declare class CarriersService extends BaseSequelizeService<CarrierModel> {
    private readonly carrierModel;
    private readonly carrierRateModel;
    constructor(carrierModel: typeof CarrierModel, carrierRateModel: typeof CarrierRateModel);
    findAll(organizationId?: string, search?: string): Promise<any>;
    findOne(id: any): Promise<any>;
    create(organizationIdOrData: any, body?: any): Promise<any>;
    remove(id: string): Promise<void>;
    addRate(carrierId: string, rateData: any): Promise<CarrierRateModel>;
}
