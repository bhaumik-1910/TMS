import { PodService } from './pod.service';
export declare class PodController {
    private podService;
    constructor(podService: PodService);
    getPOD(shipmentId: string): Promise<import("../database/models").ProofOfDeliveryModel>;
    submitPOD(body: any): Promise<import("../database/models").ProofOfDeliveryModel>;
}
