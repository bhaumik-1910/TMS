import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { UserModel } from '../auth/user.model';
import { CarrierModel } from '../partners/partners.model';
import { VehicleTypeModel } from '../master-data/master-data.model';
export declare class VehicleModel extends Model<VehicleModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    vehicleTypeId?: string;
    vehicleType?: VehicleTypeModel;
    carrierId?: string;
    carrier?: CarrierModel;
    vehicleNumber: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    capacityWeight: number;
    capacityVolume: number;
    fuelType: string;
    status: string;
    currentLatitude: number;
    currentLongitude: number;
    currentSpeed: number;
    lastLocationAt?: Date;
    fuelLevelPercent: number;
    currentOdometerKm: number;
    maintenances: VehicleMaintenanceModel[];
    documents: VehicleDocumentModel[];
    driverAssignments: DriverAssignmentModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class VehicleDocumentModel extends Model<VehicleDocumentModel> {
    id: string;
    vehicleId: string;
    vehicle: VehicleModel;
    documentType: string;
    documentNumber: string;
    expiryDate?: Date;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VehicleMaintenanceModel extends Model<VehicleMaintenanceModel> {
    id: string;
    vehicleId: string;
    vehicle: VehicleModel;
    maintenanceType: string;
    scheduledDate: Date;
    completedDate?: Date;
    cost: number;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DriverModel extends Model<DriverModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    userId?: string;
    user?: UserModel;
    carrierId?: string;
    carrier?: CarrierModel;
    employeeCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    licenseNumber: string;
    licenseExpiry: Date;
    safetyScore: number;
    status: string;
    currentLatitude?: number;
    currentLongitude?: number;
    documents: DriverDocumentModel[];
    assignments: DriverAssignmentModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class DriverDocumentModel extends Model<DriverDocumentModel> {
    id: string;
    driverId: string;
    driver: DriverModel;
    documentType: string;
    documentNumber: string;
    expiryDate?: Date;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DriverAssignmentModel extends Model<DriverAssignmentModel> {
    id: string;
    driverId: string;
    driver: DriverModel;
    vehicleId: string;
    vehicle: VehicleModel;
    startDate: Date;
    endDate?: Date;
    releasedAt?: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
