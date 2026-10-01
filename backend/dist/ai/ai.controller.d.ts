import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    query(orgId: string, query: string): Promise<{
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
