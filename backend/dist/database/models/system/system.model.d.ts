import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { UserModel } from '../auth/user.model';
export declare class NotificationModel extends Model<NotificationModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    userId?: string;
    user?: UserModel;
    title: string;
    message: string;
    type: string;
    channel: string;
    isRead: boolean;
    createdAt: Date;
}
export declare class AuditLogModel extends Model<AuditLogModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    userId?: string;
    user?: UserModel;
    action: string;
    module: string;
    entityType: string;
    entityId: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare class AnalyticsDataModel extends Model<AnalyticsDataModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    metricType: string;
    metricKey: string;
    metricValue: number;
    periodDate: Date;
}
export declare class DocumentTypeModel extends Model<DocumentTypeModel> {
    id: string;
    code: string;
    name: string;
    description?: string;
    documents: DocumentModel[];
}
export declare class DocumentModel extends Model<DocumentModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    typeId?: string;
    type?: DocumentTypeModel;
    entityType: string;
    entityId: string;
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSizeBytes: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DemoRequestModel extends Model<DemoRequestModel> {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
