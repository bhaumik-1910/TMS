import { OrdersService } from './orders.service';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAll(orgId: string, status?: string, customerId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(user: any, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    updateStatus(id: string, newStatus: string, userId: string): Promise<import("../database/models").TransportOrderModel>;
}
