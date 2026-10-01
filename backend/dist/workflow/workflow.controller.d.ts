import { WorkflowService } from './workflow.service';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    getWorkflowState(entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH', entityId: string, req: any): Promise<{
        entityType: "ORDER" | "SHIPMENT" | "DISPATCH";
        entityId: string;
        currentState: string;
        availableTransitions: import("./workflow.constants").WorkflowTransitionRule[];
        history: import("../database/models").AuditLogModel[];
    }>;
    transition(entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH', entityId: string, body: {
        targetState: string;
        reason?: string;
        metadata?: any;
    }, req: any): Promise<{
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
