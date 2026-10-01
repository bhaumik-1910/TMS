import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
export declare class LocationTypeModel extends Model<LocationTypeModel> {
    id: string;
    code: string;
    name: string;
    description?: string;
    locations: LocationModel[];
}
export declare class LocationModel extends Model<LocationModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    locationTypeId?: string;
    locationType?: LocationTypeModel;
    code?: string;
    name: string;
    address?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VehicleTypeModel extends Model<VehicleTypeModel> {
    id: string;
    code: string;
    name: string;
    description?: string;
    maxWeightKg: number;
    maxVolumeCbm: number;
    axleCount: number;
}
export declare class CargoTypeModel extends Model<CargoTypeModel> {
    id: string;
    code: string;
    name: string;
    description?: string;
    isHazardous: boolean;
    requiresTempControl: boolean;
}
export declare class PackageTypeModel extends Model<PackageTypeModel> {
    id: string;
    code: string;
    name: string;
    description?: string;
    standardWeightKg: number;
    standardVolumeCbm: number;
}
