import { OnModuleInit } from '@nestjs/common';
import { InvoiceModel, InvoiceItemModel, PaymentModel, ShipmentModel, CarrierRateModel, ClaimModel, ClaimItemModel, BillingInvoiceModel, PurchaseBillModel, SettlementModel } from '../database/models';
import { OpsRunnerService } from '../framework/ops/ops-runner.service';
import { DocumentSequenceService } from '../foundation/document-sequences/document-sequence.service';
export declare class BillingService implements OnModuleInit {
    private readonly invoiceModel;
    private readonly invoiceItemModel;
    private readonly paymentModel;
    private readonly shipmentModel;
    private readonly carrierRateModel;
    private readonly claimModel;
    private readonly claimItemModel;
    private readonly billingInvoiceModel;
    private readonly purchaseBillModel;
    private readonly settlementModel;
    private readonly opsRunner;
    private readonly sequenceService;
    constructor(invoiceModel: typeof InvoiceModel, invoiceItemModel: typeof InvoiceItemModel, paymentModel: typeof PaymentModel, shipmentModel: typeof ShipmentModel, carrierRateModel: typeof CarrierRateModel, claimModel: typeof ClaimModel, claimItemModel: typeof ClaimItemModel, billingInvoiceModel: typeof BillingInvoiceModel, purchaseBillModel: typeof PurchaseBillModel, settlementModel: typeof SettlementModel, opsRunner: OpsRunnerService, sequenceService: DocumentSequenceService);
    onModuleInit(): Promise<void>;
    findAllSettlements(query?: {
        search?: string;
        status?: string;
        settlementType?: string;
    }): Promise<SettlementModel[]>;
    createSettlement(data: any): Promise<any>;
    updateSettlement(id: string, data: any): Promise<SettlementModel>;
    deleteSettlement(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findAllPurchaseBills(query?: {
        search?: string;
        status?: string;
        type?: string;
    }): Promise<PurchaseBillModel[]>;
    createPurchaseBill(data: any): Promise<any>;
    updatePurchaseBill(id: string, data: any): Promise<PurchaseBillModel>;
    deletePurchaseBill(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findAllBillingInvoices(query?: {
        search?: string;
        status?: string;
    }): Promise<BillingInvoiceModel[]>;
    createBillingInvoice(data: any): Promise<any>;
    updateBillingInvoice(id: string, data: any): Promise<BillingInvoiceModel>;
    deleteBillingInvoice(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
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
