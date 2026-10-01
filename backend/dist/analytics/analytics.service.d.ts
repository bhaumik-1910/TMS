import { TransportOrderModel, ShipmentModel, VehicleModel, InvoiceModel, CarrierModel } from '../database/models';
export declare class AnalyticsService {
    private readonly orderModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly invoiceModel;
    private readonly carrierModel;
    constructor(orderModel: typeof TransportOrderModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, invoiceModel: typeof InvoiceModel, carrierModel: typeof CarrierModel);
    getRoleDashboard(role: string, organizationId?: string, userId?: string): Promise<{
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
        recentShipments: ShipmentModel[];
        roleView: string;
    }>;
}
