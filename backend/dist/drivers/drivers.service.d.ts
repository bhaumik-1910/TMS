import { BaseSequelizeService } from '../common/base/base.service';
import { DriverModel, DispatchModel } from '../database/models';
export declare class DriversService extends BaseSequelizeService<DriverModel> {
    private readonly driverModel;
    private readonly dispatchModel;
    constructor(driverModel: typeof DriverModel, dispatchModel: typeof DispatchModel);
    findAll(organizationId?: string, status?: string): Promise<any>;
    findOne(id: any): Promise<any>;
    getDriverActiveTrip(driverId: string): Promise<DispatchModel>;
    create(organizationIdOrData: any, body?: any): Promise<any>;
    remove(id: string): Promise<void>;
}
