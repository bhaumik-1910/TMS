import { LorryReceiptModel } from '../database/models';
import { OpsRunnerService } from '../framework/ops/ops-runner.service';
import { DocumentSequenceService } from '../foundation/document-sequences/document-sequence.service';
export declare class LorryReceiptsService {
    private readonly lrModel;
    private readonly opsRunner;
    private readonly sequenceService;
    constructor(lrModel: typeof LorryReceiptModel, opsRunner: OpsRunnerService, sequenceService: DocumentSequenceService);
    findAll(organizationId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    generateLR(data: {
        shipmentId: string;
        lrNumber?: string;
        ewayBillNumber?: string;
        ewayBillExpiry?: Date;
        consignorName: string;
        consignorAddress?: string;
        consigneeName: string;
        consigneeAddress?: string;
        declaredValue?: number;
        billingTerms?: string;
        userId?: string;
        organizationId?: string;
        branchId?: number;
        lrDate?: string;
    }): Promise<any>;
}
