import { MasterDataService } from './master-data.service';
export declare class MasterDataController {
    private masterDataService;
    constructor(masterDataService: MasterDataService);
    getLocations(orgId: string): Promise<import("../database/models").LocationModel[]>;
    createLocation(orgId: string, body: any): Promise<import("../database/models").LocationModel>;
    getLocationTypes(): Promise<import("../database/models").LocationTypeModel[]>;
    getVehicleTypes(): Promise<import("../database/models").VehicleTypeModel[]>;
    getCargoTypes(): Promise<import("../database/models").CargoTypeModel[]>;
    getPackageTypes(): Promise<import("../database/models").PackageTypeModel[]>;
}
