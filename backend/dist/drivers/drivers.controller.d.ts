import { DriversService } from './drivers.service';
export declare class DriversController {
    private driversService;
    constructor(driversService: DriversService);
    findAll(orgId: string, status?: string): Promise<any>;
    getDriverActiveTrip(driverId: string): Promise<import("../database/models").DispatchModel>;
    findOne(id: string): Promise<any>;
    create(orgId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<import("../database/models").DriverModel>;
    remove(id: string): Promise<void>;
}
