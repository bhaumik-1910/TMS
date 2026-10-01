import { WorkQueuesService } from './work-queues.service';
export declare class WorkQueuesController {
    private readonly workQueuesService;
    constructor(workQueuesService: WorkQueuesService);
    getMyQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
    getPlanningQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
    getDispatchQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
    getFinanceQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
    getComplianceQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
    getSupportQueue(req: any): Promise<import("./work-queues.service").WorkQueueItem[]>;
}
