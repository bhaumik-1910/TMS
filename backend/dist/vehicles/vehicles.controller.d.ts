import { VehiclesService } from './vehicles.service';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(orgId: string, status?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(orgId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    addMaintenance(id: string, body: any): Promise<import("../database/models").VehicleMaintenanceModel>;
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
