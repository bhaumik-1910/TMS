import { LocationModel, LocationTypeModel, VehicleTypeModel, CargoTypeModel, PackageTypeModel } from '../database/models';
export declare class MasterDataService {
    private readonly locationModel;
    private readonly locationTypeModel;
    private readonly vehicleTypeModel;
    private readonly cargoTypeModel;
    private readonly packageTypeModel;
    constructor(locationModel: typeof LocationModel, locationTypeModel: typeof LocationTypeModel, vehicleTypeModel: typeof VehicleTypeModel, cargoTypeModel: typeof CargoTypeModel, packageTypeModel: typeof PackageTypeModel);
    getLocations(organizationId: string): Promise<LocationModel[]>;
    createLocation(organizationId: string, data: any): Promise<LocationModel>;
    getLocationTypes(): Promise<LocationTypeModel[]>;
    getVehicleTypes(): Promise<VehicleTypeModel[]>;
    getCargoTypes(): Promise<CargoTypeModel[]>;
    getPackageTypes(): Promise<PackageTypeModel[]>;
}
