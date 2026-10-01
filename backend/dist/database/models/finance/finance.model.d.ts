import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { ShipmentModel, DispatchModel } from '../operations/operations.model';
export declare class InvoiceModel extends Model<InvoiceModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    customerId?: string;
    customer?: CustomerModel;
    carrierId?: string;
    carrier?: CarrierModel;
    shipmentId?: string;
    shipment?: ShipmentModel;
    invoiceNumber: string;
    invoiceType: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    contractedAmount: number;
    varianceAmount: number;
    invoiceDate: Date;
    dueDate: Date;
    status: string;
    items: InvoiceItemModel[];
    payments: PaymentModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class InvoiceItemModel extends Model<InvoiceItemModel> {
    id: string;
    invoiceId: string;
    invoice: InvoiceModel;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaymentModel extends Model<PaymentModel> {
    id: string;
    invoiceId: string;
    invoice: InvoiceModel;
    paymentReference: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    transactionId?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TripExpenseModel extends Model<TripExpenseModel> {
    id: string;
    dispatchId: string;
    dispatch: DispatchModel;
    expenseType: string;
    amount: number;
    receiptUrl?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ClaimModel extends Model<ClaimModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    claimNumber: string;
    claimType: string;
    claimedAmount: number;
    approvedAmount: number;
    status: string;
    reason?: string;
    items: ClaimItemModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ClaimItemModel extends Model<ClaimItemModel> {
    id: string;
    claimId: string;
    claim: ClaimModel;
    itemDescription: string;
    quantityDamaged: number;
    claimedCost: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AccountingSyncModel extends Model<AccountingSyncModel> {
    id: string;
    entityType: string;
    entityId: string;
    externalSystem: string;
    externalId?: string;
    syncStatus: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
