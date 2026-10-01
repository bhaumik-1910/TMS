import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentModel, DocumentTypeModel } from '../database/models';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel)
    private readonly documentModel: typeof DocumentModel,
    @InjectModel(DocumentTypeModel)
    private readonly documentTypeModel: typeof DocumentTypeModel,
  ) {}

  async findAll(organizationId?: string, entityType?: string, entityId?: string) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    return this.documentModel.findAll({
      where,
      include: [{ model: DocumentTypeModel, required: false }],
      order: [['createdAt', 'DESC']],
    });
  }

  async create(organizationId: string, data: any) {
    return this.documentModel.create({
      organizationId,
      entityType: data.entityType || 'SHIPMENT',
      entityId: data.entityId || 'SYS-001',
      typeId: data.documentTypeId || null,
      fileName: data.fileName || `${(data.title || 'document').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileUrl: data.fileUrl || '/sample-documents/doc-sample.pdf',
      mimeType: data.mimeType || 'application/pdf',
      fileSizeBytes: data.fileSizeBytes || 10240,
    });
  }

  async getExpiringDocuments(organizationId: string, daysAhead: number = 30) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }

    return this.documentModel.findAll({
      where,
      include: [{ model: DocumentTypeModel, required: false }],
      order: [['createdAt', 'ASC']],
    });
  }

  async getDocumentTypes() {
    return this.documentTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }
}
