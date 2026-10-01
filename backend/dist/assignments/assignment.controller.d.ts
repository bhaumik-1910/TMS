import { AssignmentService } from './assignment.service';
export declare class AssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AssignmentService);
    getAssignments(resourceType: string, resourceId: string): Promise<{
        resourceType: string;
        resourceId: string;
        assignments: ({
            type: import("./assignment.constants").AssignmentType;
            label: string;
            assignedId: any;
            name: any;
            email: any;
            rating?: undefined;
            phone?: undefined;
        } | {
            type: import("./assignment.constants").AssignmentType;
            label: string;
            assignedId: any;
            name: any;
            rating: any;
            email?: undefined;
            phone?: undefined;
        } | {
            type: import("./assignment.constants").AssignmentType;
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
        history: import("../database/models").AuditLogModel[];
    }>;
    assign(resourceType: string, resourceId: string, body: {
        assignmentType: string;
        targetId: string;
        reason?: string;
    }, req: any): Promise<{
        success: boolean;
        resourceType: string;
        resourceId: string;
        assignmentType: string;
        newAssigneeId: string;
        updatedResource: any;
    }>;
}
