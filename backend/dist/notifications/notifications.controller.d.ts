import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: any): Promise<import("../database/models").NotificationModel[]>;
    create(orgId: string, body: any): Promise<import("../database/models").NotificationModel>;
    markAllAsRead(orgId: string): Promise<{
        success: boolean;
    }>;
    markAsRead(id: string): Promise<import("../database/models").NotificationModel>;
    clearRead(orgId: string): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        id: string;
    } | {
        success: boolean;
        id?: undefined;
    }>;
}
