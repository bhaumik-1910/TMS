import { AssignmentType } from './assignment.constants';
import { ShipmentModel, TransportOrderModel, AuditLogModel, NotificationModel, DispatchModel } from '../database/models';
export declare class AssignmentService {
    private readonly shipmentModel;
    private readonly orderModel;
    private readonly auditLogModel;
    private readonly notificationModel;
    private readonly dispatchModel;
    constructor(shipmentModel: typeof ShipmentModel, orderModel: typeof TransportOrderModel, auditLogModel: typeof AuditLogModel, notificationModel: typeof NotificationModel, dispatchModel: typeof DispatchModel);
    getAssignments(resourceType: string, resourceId: string): Promise<{
        resourceType: string;
        resourceId: string;
        assignments: ({
            type: AssignmentType;
            label: string;
            assignedId: any;
            name: any;
            email: any;
            rating?: undefined;
            phone?: undefined;
        } | {
            type: AssignmentType;
            label: string;
            assignedId: any;
            name: any;
            rating: any;
            email?: undefined;
            phone?: undefined;
        } | {
            type: AssignmentType;
            label: string;
            assignedId: any;
            name: string;
            phone: any;
            email?: undefined;
            rating?: undefined;
        } | {
            type: string;
            label: string;
            assignedId: any;
            name: any;
            email?: undefined;
            rating?: undefined;
            phone?: undefined;
        })[];
        history: AuditLogModel[];
    }>;
    assign(resourceType: string, resourceId: string, assignmentType: AssignmentType | string, targetId: string, user: any, reason?: string): Promise<{
        success: boolean;
        resourceType: string;
        resourceId: string;
        assignmentType: string;
        newAssigneeId: string;
        updatedResource: any;
    }>;
}
