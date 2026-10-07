import { PodService } from './pod.service';
export declare class PodController {
    private podService;
    constructor(podService: PodService);
    findAll(query: any): Promise<import("../database/models").PodRecordModel[]>;
    create(body: any): Promise<import("../database/models").PodRecordModel>;
    findOne(id: string): Promise<import("../database/models").ProofOfDeliveryModel | import("../database/models").PodRecordModel>;
    update(id: string, body: any): Promise<import("../database/models").PodRecordModel>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitPOD(body: any): Promise<import("../database/models").ProofOfDeliveryModel>;
}
