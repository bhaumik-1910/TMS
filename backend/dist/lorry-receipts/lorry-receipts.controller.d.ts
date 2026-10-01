import { LorryReceiptsService } from './lorry-receipts.service';
export declare class LorryReceiptsController {
    private lrService;
    constructor(lrService: LorryReceiptsService);
    findAll(orgId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    generateLR(body: any): Promise<any>;
}
