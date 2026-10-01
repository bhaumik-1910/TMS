import { BaseSequelizeService } from '../common/base/base.service';
import { DataAccessService } from '../common/data-access/data-access.service';
import { ShipmentModel, VehicleModel, DriverModel, ProofOfDeliveryModel, DispatchModel, NotificationModel, AuditLogModel } from '../database/models';
export declare class ShipmentsService extends BaseSequelizeService<ShipmentModel> {
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly dispatchModel;
    private readonly podModel;
    private readonly auditLogModel;
    private readonly notificationModel;
    private readonly dataAccess;
    constructor(shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, dispatchModel: typeof DispatchModel, podModel: typeof ProofOfDeliveryModel, auditLogModel: typeof AuditLogModel, notificationModel: typeof NotificationModel, dataAccess: DataAccessService);
    findAll(user: any, filters?: any, orgContext?: string): Promise<any>;
    findOne(id: any, user?: any): Promise<any>;
    assignResources(id: string, data: {
        vehicleId?: string;
        driverId?: string;
        carrierId?: string;
        routeId?: string;
    }, userId?: string): Promise<any>;
    updateStatus(id: string, status: string, userId?: string): Promise<ShipmentModel>;
    submitPOD(id: string, podDto: any, user: any): Promise<{
        success: boolean;
        pod: ProofOfDeliveryModel;
        shipment: ShipmentModel;
    }>;
}
