import { OnModuleInit } from '@nestjs/common';
import { BaseSequelizeService } from '../common/base/base.service';
import { DispatchModel, ShipmentModel, VehicleModel, DriverModel, TripExpenseModel, AuditLogModel } from '../database/models';
import { OpsRunnerService } from '../framework/ops/ops-runner.service';
import { DocumentSequenceService } from '../foundation/document-sequences/document-sequence.service';
export declare class DispatchService extends BaseSequelizeService<DispatchModel> implements OnModuleInit {
    private readonly dispatchModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly tripExpenseModel;
    private readonly auditLogModel;
    private readonly opsRunner;
    private readonly sequenceService;
    constructor(dispatchModel: typeof DispatchModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, tripExpenseModel: typeof TripExpenseModel, auditLogModel: typeof AuditLogModel, opsRunner: OpsRunnerService, sequenceService: DocumentSequenceService);
    onModuleInit(): Promise<void>;
    findAll(organizationId?: string, status?: string): Promise<any>;
    getDispatchBoard(organizationId: string): Promise<Record<string, any[]>>;
    create(organizationId: string, data: any, userId?: string): Promise<any>;
    updateTrip(id: string, data: any): Promise<DispatchModel>;
    deleteTrip(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
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
