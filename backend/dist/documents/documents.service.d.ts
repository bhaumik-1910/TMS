import { DocumentModel, DocumentTypeModel } from '../database/models';
export declare class DocumentsService {
    private readonly documentModel;
    private readonly documentTypeModel;
    constructor(documentModel: typeof DocumentModel, documentTypeModel: typeof DocumentTypeModel);
    findAll(organizationId?: string, entityType?: string, entityId?: string): Promise<DocumentModel[]>;
    create(organizationId: string, data: any): Promise<DocumentModel>;
    getExpiringDocuments(organizationId: string, daysAhead?: number): Promise<DocumentModel[]>;
    getDocumentTypes(): Promise<DocumentTypeModel[]>;
}
