import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(user: any, role?: string): Promise<{
        kpis: {
            totalOrders: number;
            activeShipments: number;
            deliveredShipments: number;
            otdPercent: number;
            totalVehicles: number;
            inTransitVehicles: number;
            fleetUtilization: number;
            totalRevenue: number;
            pendingRevenue: number;
        };
        monthlyTrends: {
            month: string;
            orders: number;
            delivered: number;
            spend: number;
        }[];
        carrierRankings: {
            companyName: string;
            rating: number;
            _count: {
                shipments: number;
            };
        }[];
        recentShipments: import("../database/models").ShipmentModel[];
        roleView: string;
    }>;
}
