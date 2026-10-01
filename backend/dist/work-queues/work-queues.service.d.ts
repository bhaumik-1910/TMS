import { DataAccessService } from '../common/data-access/data-access.service';
import { TransportOrderModel, ShipmentModel, InvoiceModel, VehicleDocumentModel } from '../database/models';
export interface WorkQueueItem {
    id: string;
    resourceType: 'ORDER' | 'SHIPMENT' | 'DISPATCH' | 'INVOICE' | 'DOCUMENT';
    resourceId: string;
    referenceNumber: string;
    title: string;
    origin?: string;
    destination?: string;
    priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
    workflowState: string;
    assignedRole: string;
    assignedUser?: string;
    dueAt: string;
    slaStatus: 'ON_TRACK' | 'DUE_SOON' | 'BREACHED';
    nextActionLabel: string;
    nextActionRoute: string;
}
export declare class WorkQueuesService {
    private readonly orderModel;
    private readonly shipmentModel;
    private readonly invoiceModel;
    private readonly vehicleDocModel;
    private readonly dataAccessService;
    constructor(orderModel: typeof TransportOrderModel, shipmentModel: typeof ShipmentModel, invoiceModel: typeof InvoiceModel, vehicleDocModel: typeof VehicleDocumentModel, dataAccessService: DataAccessService);
    getMyQueue(user: any): Promise<WorkQueueItem[]>;
    getPlanningQueue(user: any): Promise<WorkQueueItem[]>;
    getDispatchQueue(user: any): Promise<WorkQueueItem[]>;
    getDriverQueue(user: any): Promise<WorkQueueItem[]>;
    getCustomerQueue(user: any): Promise<WorkQueueItem[]>;
    getCarrierQueue(user: any): Promise<WorkQueueItem[]>;
    getFinanceQueue(user: any): Promise<WorkQueueItem[]>;
    getComplianceQueue(user: any): Promise<WorkQueueItem[]>;
    getSupportQueue(user: any): Promise<WorkQueueItem[]>;
    getOperationsQueue(user: any): Promise<WorkQueueItem[]>;
}
