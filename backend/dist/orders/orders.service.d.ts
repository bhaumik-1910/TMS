import { BaseSequelizeService } from '../common/base/base.service';
import { TransportOrderModel, OrderItemModel, ShipmentModel, ShipmentItemModel, AuditLogModel } from '../database/models';
export declare class OrdersService extends BaseSequelizeService<TransportOrderModel> {
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly shipmentModel;
    private readonly shipmentItemModel;
    private readonly auditLogModel;
    constructor(orderModel: typeof TransportOrderModel, orderItemModel: typeof OrderItemModel, shipmentModel: typeof ShipmentModel, shipmentItemModel: typeof ShipmentItemModel, auditLogModel: typeof AuditLogModel);
    findAll(organizationId?: string, status?: string, customerId?: string): Promise<any>;
    findOne(id: any): Promise<any>;
    create(organizationId: string, userId: string, data: any): Promise<any>;
    updateStatus(id: string, newStatus: string, userId?: string): Promise<TransportOrderModel>;
}
