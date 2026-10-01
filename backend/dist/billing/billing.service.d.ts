import { InvoiceModel, InvoiceItemModel, PaymentModel, ShipmentModel, CarrierRateModel, ClaimModel, ClaimItemModel } from '../database/models';
export declare class BillingService {
    private readonly invoiceModel;
    private readonly invoiceItemModel;
    private readonly paymentModel;
    private readonly shipmentModel;
    private readonly carrierRateModel;
    private readonly claimModel;
    private readonly claimItemModel;
    constructor(invoiceModel: typeof InvoiceModel, invoiceItemModel: typeof InvoiceItemModel, paymentModel: typeof PaymentModel, shipmentModel: typeof ShipmentModel, carrierRateModel: typeof CarrierRateModel, claimModel: typeof ClaimModel, claimItemModel: typeof ClaimItemModel);
    findAllInvoices(organizationId?: string, status?: string): Promise<any>;
    findInvoice(id: string): Promise<any>;
    recordPayment(invoiceId: string, data: any): Promise<{
        payment: PaymentModel;
        invoiceStatus: string;
    }>;
    auditCarrierInvoice(data: {
        shipmentId: string;
        carrierId: string;
        billedAmount: number;
        distanceKm: number;
    }): Promise<{
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
    findAllClaims(organizationId?: string): Promise<any>;
    createClaim(data: any): Promise<ClaimModel>;
    updateClaimStatus(id: string, status: string): Promise<ClaimModel>;
}
