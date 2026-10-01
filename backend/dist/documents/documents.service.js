"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
let DocumentsService = class DocumentsService {
    constructor(documentModel, documentTypeModel) {
        this.documentModel = documentModel;
        this.documentTypeModel = documentTypeModel;
    }
    async findAll(organizationId, entityType, entityId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        return this.documentModel.findAll({
            where,
            include: [{ model: models_1.DocumentTypeModel, required: false }],
            order: [['createdAt', 'DESC']],
        });
    }
    async create(organizationId, data) {
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
    async getExpiringDocuments(organizationId, daysAhead = 30) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        return this.documentModel.findAll({
            where,
            include: [{ model: models_1.DocumentTypeModel, required: false }],
            order: [['createdAt', 'ASC']],
        });
    }
    async getDocumentTypes() {
        return this.documentTypeModel.findAll({
            order: [['name', 'ASC']],
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.DocumentModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.DocumentTypeModel)),
    __metadata("design:paramtypes", [Object, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map