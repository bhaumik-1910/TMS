import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { LocationModel } from './master-data.model';
export declare class FacilityModel extends Model<FacilityModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    locationId?: string;
    location?: LocationModel;
    name: string;
    code: string;
    type: string;
    capacityDocks: number;
    status: string;
    docks: DockModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class DockModel extends Model<DockModel> {
    id: string;
    facilityId: string;
    facility: FacilityModel;
    dockNumber: string;
    dockType: string;
    status: string;
    appointments: AppointmentModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class AppointmentModel extends Model<AppointmentModel> {
    id: string;
    dockId: string;
    dock: DockModel;
    appointmentNumber: string;
    scheduledTime: Date;
    estimatedDurationMinutes: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
