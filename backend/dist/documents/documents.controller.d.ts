import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    findAll(orgId: string, entityType?: string, entityId?: string): Promise<import("../database/models").DocumentModel[]>;
    getDocumentTypes(): Promise<import("../database/models").DocumentTypeModel[]>;
    getExpiring(orgId: string, days?: string): Promise<import("../database/models").DocumentModel[]>;
    create(orgId: string, body: any): Promise<import("../database/models").DocumentModel>;
}
