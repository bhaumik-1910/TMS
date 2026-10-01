import { NotificationModel, OrganizationModel } from '../database/models';
export declare class NotificationsService {
    private readonly notificationModel;
    private readonly organizationModel;
    constructor(notificationModel: typeof NotificationModel, organizationModel: typeof OrganizationModel);
    findAll(organizationId?: string, userId?: string): Promise<NotificationModel[]>;
    create(data: Partial<NotificationModel>): Promise<NotificationModel>;
    markAsRead(id: string): Promise<NotificationModel>;
    markAllAsRead(organizationId?: string): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        id: string;
    } | {
        success: boolean;
        id?: undefined;
    }>;
    clearRead(organizationId?: string): Promise<{
        success: boolean;
    }>;
}
