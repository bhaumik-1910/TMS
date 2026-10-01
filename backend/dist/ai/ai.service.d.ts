import { ShipmentModel, TransportOrderModel, VehicleModel, CarrierModel, DocumentModel } from '../database/models';
export declare class AiService {
    private readonly shipmentModel;
    private readonly orderModel;
    private readonly vehicleModel;
    private readonly carrierModel;
    private readonly docModel;
    constructor(shipmentModel: typeof ShipmentModel, orderModel: typeof TransportOrderModel, vehicleModel: typeof VehicleModel, carrierModel: typeof CarrierModel, docModel: typeof DocumentModel);
    processQuery(organizationId: string, query: string): Promise<{
        query: string;
        category: string;
        summary: string;
        data: {
            shipmentNumber: string;
            customer: string;
            status: string;
            vehicle: string;
            destination: string;
        }[];
        suggestedActions: string[];
    } | {
        query: string;
        category: string;
        summary: string;
        data: {
            carrierCode: string;
            name: string;
            rating: number;
            totalShipments: number;
        }[];
        suggestedActions: string[];
    } | {
        query: string;
        category: string;
        summary: string;
        data: {
            vehicleNumber: string;
            type: string;
            capacityWeight: string;
            capacityVolume: string;
            fuelType: string;
        }[];
        suggestedActions: string[];
    } | {
        query: string;
        category: string;
        summary: string;
        data: {
            title: string;
            type: string;
            entityType: string;
            expiryDate: string;
        }[];
        suggestedActions: string[];
    } | {
        query: string;
        category: string;
        summary: string;
        data: ({
            metric: string;
            value: number;
        } | {
            metric: string;
            value: string;
        })[];
        suggestedActions: string[];
    }>;
}
