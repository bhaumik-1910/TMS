import { BillingService } from './billing.service';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    getBillingRecords(query: any): Promise<import("../database/models").BillingInvoiceModel[]>;
    createBillingRecord(body: any): Promise<any>;
    updateBillingRecord(id: string, body: any): Promise<import("../database/models").BillingInvoiceModel>;
    deleteBillingRecord(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPurchaseBills(query: any): Promise<import("../database/models").PurchaseBillModel[]>;
    createPurchaseBill(body: any): Promise<any>;
    updatePurchaseBill(id: string, body: any): Promise<import("../database/models").PurchaseBillModel>;
    deletePurchaseBill(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSettlements(query: any): Promise<import("../database/models").SettlementModel[]>;
    createSettlement(body: any): Promise<any>;
    updateSettlement(id: string, body: any): Promise<import("../database/models").SettlementModel>;
    deleteSettlement(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findAllInvoices(orgId: string, status?: string): Promise<any>;
    findInvoice(id: string): Promise<any>;
    recordPayment(id: string, body: any): Promise<{
        payment: import("../database/models").PaymentModel;
        invoiceStatus: string;
    }>;
    auditCarrierInvoice(body: any): Promise<{
        shipmentId: string;
        carrierId: string;
        distanceKm: number;
        contractBaseRate: number;
        expectedCost: number;
        billedAmount: number;
        variance: number;
        variancePercent: number;
        auditStatus: string;
        issues: string[];
        auditDate: string;
    }>;
    findAllClaims(orgId: string): Promise<any>;
    createClaim(body: any): Promise<import("../database/models").ClaimModel>;
    updateClaimStatus(id: string, status: string): Promise<import("../database/models").ClaimModel>;
}
