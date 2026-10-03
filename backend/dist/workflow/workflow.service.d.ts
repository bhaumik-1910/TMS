import { WorkflowTransitionRule } from './workflow.constants';
import { TransportOrderModel, ShipmentModel, DispatchModel, AuditLogModel, NotificationModel } from '../database/models';
export declare class WorkflowService {
    private readonly orderModel;
    private readonly shipmentModel;
    private readonly dispatchModel;
    private readonly auditLogModel;
    private readonly notificationModel;
    constructor(orderModel: typeof TransportOrderModel, shipmentModel: typeof ShipmentModel, dispatchModel: typeof DispatchModel, auditLogModel: typeof AuditLogModel, notificationModel: typeof NotificationModel);
    getWorkflowState(entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH', entityId: string, user: any): Promise<{
        entityType: "ORDER" | "SHIPMENT" | "DISPATCH";
        entityId: string;
        currentState: string;
        availableTransitions: WorkflowTransitionRule[];
        history: AuditLogModel[];
    }>;
    transition(entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH', entityId: string, targetState: string, user: any, reason?: string, metadata?: any): Promise<{
        success: boolean;
        entityType: "ORDER" | "SHIPMENT" | "DISPATCH";
        entityId: string;
        previousState: string;
        currentState: string;
        nextResponsibleRole: string;
        actionLabel: string;
        updatedRecord: any;
    }>;
}
