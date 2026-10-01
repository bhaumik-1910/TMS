import { DataAccessService } from '../common/data-access/data-access.service';
import { TransportOrderModel, ShipmentModel, VehicleModel, InvoiceModel, AuditLogModel } from '../database/models';
export declare class DashboardService {
    private readonly orderModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly invoiceModel;
    private readonly auditLogModel;
    private readonly dataAccess;
    constructor(orderModel: typeof TransportOrderModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, invoiceModel: typeof InvoiceModel, auditLogModel: typeof AuditLogModel, dataAccess: DataAccessService);
    getOverview(user: any, orgContext?: string): Promise<{
        kpis: {
            totalOrders: number;
            activeShipments: number;
            deliveredShipments: number;
            otdPercent: number;
            totalVehicles: number;
            inTransitVehicles: number;
            fleetUtilization: number;
            totalRevenue: number;
        };
        scope: import("../common/data-access/data-scope.enum").DataScope;
        organizationContext: string;
    }>;
    getShipments(user: any, orgContext?: string, limit?: number): Promise<any[]>;
    getFleet(user: any, orgContext?: string): Promise<{
        total: number;
        inTransit: number;
        available: number;
        maintenance: number;
    }>;
    getExceptions(user: any, orgContext?: string): Promise<{
        id: string;
        severity: string;
        type: string;
        asset: string;
        message: string;
        time: string;
    }[]>;
    getFinancial(user: any, orgContext?: string): Promise<{
        totalInvoiced: number;
        paidReceivables: number;
        pendingClearance: number;
        invoiceCount: number;
    }>;
    getActivity(user: any, orgContext?: string): Promise<AuditLogModel[]>;
}
