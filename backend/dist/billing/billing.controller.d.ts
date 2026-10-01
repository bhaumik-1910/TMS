import { BillingService } from './billing.service';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
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
