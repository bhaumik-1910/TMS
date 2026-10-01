import { BaseSequelizeService } from '../common/base/base.service';
import { DispatchModel, ShipmentModel, VehicleModel, DriverModel, TripExpenseModel, AuditLogModel } from '../database/models';
export declare class DispatchService extends BaseSequelizeService<DispatchModel> {
    private readonly dispatchModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly tripExpenseModel;
    private readonly auditLogModel;
    constructor(dispatchModel: typeof DispatchModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, tripExpenseModel: typeof TripExpenseModel, auditLogModel: typeof AuditLogModel);
    findAll(organizationId?: string, status?: string): Promise<any>;
    getDispatchBoard(organizationId: string): Promise<Record<string, any[]>>;
    create(organizationId: string, data: any, userId?: string): Promise<DispatchModel>;
    updateStatus(id: string, status: string, userId?: string): Promise<DispatchModel>;
    addTripExpense(dispatchId: string, data: any): Promise<TripExpenseModel>;
    getTripExpenses(dispatchId: string): Promise<TripExpenseModel[]>;
    closeTrip(dispatchId: string, data: {
        startOdometer: number;
        endOdometer: number;
        fuelLitres: number;
        driverAllowance: number;
    }): Promise<DispatchModel>;
}
