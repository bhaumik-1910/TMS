export interface WorkflowTransitionRule {
    from: string;
    to: string;
    requiredPermission: string;
    requiredRoles?: string[];
    requiredAssignmentField?: string;
    actionLabel: string;
    nextResponsibleRole: string;
    description: string;
}
export declare const ORDER_WORKFLOW_STATES: readonly ["DRAFT", "SUBMITTED", "APPROVED", "PLANNING", "PLANNED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CLOSED", "CANCELLED"];
export declare const ORDER_TRANSITIONS: WorkflowTransitionRule[];
export declare const DISPATCH_WORKFLOW_STATES: readonly ["PLANNED", "ASSIGNED", "DISPATCHED", "DRIVER_ACCEPTED", "PICKUP", "IN_TRANSIT", "DELIVERY", "COMPLETED", "CANCELLED"];
export declare const DISPATCH_TRANSITIONS: WorkflowTransitionRule[];
