import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
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
    getShipments(user: any, orgContext?: string): Promise<any[]>;
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
    getActivity(user: any, orgContext?: string): Promise<import("../database/models").AuditLogModel[]>;
}
