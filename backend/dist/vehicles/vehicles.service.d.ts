import { BaseSequelizeService } from '../common/base/base.service';
import { VehicleModel, VehicleMaintenanceModel } from '../database/models';
export declare class VehiclesService extends BaseSequelizeService<VehicleModel> {
    private readonly vehicleModel;
    private readonly maintenanceModel;
    constructor(vehicleModel: typeof VehicleModel, maintenanceModel: typeof VehicleMaintenanceModel);
    findAll(organizationId?: string, status?: string): Promise<any>;
    findOne(id: any): Promise<any>;
    create(organizationIdOrData: any, body?: any): Promise<any>;
    update(id: any, data: any): Promise<any>;
    updateLocation(id: string, lat: number, lng: number, speed?: number): Promise<VehicleModel>;
    addMaintenance(vehicleId: string, data: any): Promise<VehicleMaintenanceModel>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        warning?: undefined;
    } | {
        success: boolean;
        message: string;
        warning: any;
    }>;
}
