import { DriverModel, CustomerModel, CarrierModel } from '../../database/models';
import { DataScope } from './data-scope.enum';
export declare class DataAccessService {
    private readonly driverModel;
    private readonly customerModel;
    private readonly carrierModel;
    constructor(driverModel: typeof DriverModel, customerModel: typeof CustomerModel, carrierModel: typeof CarrierModel);
    resolveScope(user: any, permissionKey?: string): DataScope;
    resolveOrganizationId(user: any, orgContextOverride?: string): string | undefined;
    getShipmentWhere(user: any, options?: {
        orgContext?: string;
        status?: string;
    }): Promise<any>;
    getVehicleWhere(user: any, orgContext?: string): any;
    getDriverWhere(user: any, orgContext?: string): any;
    getInvoiceWhere(user: any, orgContext?: string): Promise<any>;
    sanitizeShipment(shipment: any, user: any): any;
    sanitizeUser(userResponse: any): any;
}
