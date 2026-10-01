import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    findAll(user: any, query: any, orgContext?: string): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    assignResources(id: string, body: any, userId: string): Promise<any>;
    updateStatus(id: string, status: string, userId: string): Promise<import("../database/models").ShipmentModel>;
    submitPOD(id: string, podDto: any, user: any): Promise<{
        success: boolean;
        pod: import("../database/models").ProofOfDeliveryModel;
        shipment: import("../database/models").ShipmentModel;
    }>;
}
