import { DispatchService } from './dispatch.service';
export declare class DispatchController {
    private dispatchService;
    constructor(dispatchService: DispatchService);
    findAll(orgId: string, status?: string): Promise<any>;
    getDispatchBoard(orgId: string): Promise<Record<string, any[]>>;
    create(user: any, body: any): Promise<import("../database/models").DispatchModel>;
    updateTrip(id: string, body: any): Promise<import("../database/models").DispatchModel>;
    deleteTrip(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    updateStatus(id: string, status: string, userId: string): Promise<import("../database/models").DispatchModel>;
    addTripExpense(id: string, body: any): Promise<import("../database/models").TripExpenseModel>;
    getTripExpenses(id: string): Promise<import("../database/models").TripExpenseModel[]>;
    closeTrip(id: string, body: any): Promise<import("../database/models").DispatchModel>;
}
