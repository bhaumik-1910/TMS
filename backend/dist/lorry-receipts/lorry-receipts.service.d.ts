import { LorryReceiptModel } from '../database/models';
export declare class LorryReceiptsService {
    private readonly lrModel;
    constructor(lrModel: typeof LorryReceiptModel);
    findAll(organizationId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    generateLR(data: {
        shipmentId: string;
        ewayBillNumber?: string;
        ewayBillExpiry?: Date;
        consignorName: string;
        consignorAddress?: string;
        consigneeName: string;
        consigneeAddress?: string;
        declaredValue?: number;
        billingTerms?: string;
    }): Promise<any>;
}
