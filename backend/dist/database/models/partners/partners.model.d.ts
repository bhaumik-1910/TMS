import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
export declare class CustomerModel extends Model<CustomerModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    customerCode: string;
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    billingAddress?: string;
    shippingAddress?: string;
    paymentTerms: string;
    creditLimit: number;
    status: string;
    subType?: string;
    branch?: string;
    gstin?: string;
    pan?: string;
    tdsSection?: string;
    creditDays?: string;
    bankName?: string;
    accountNo?: string;
    ifscCode?: string;
    creditLimitStr?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CarrierModel extends Model<CarrierModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    carrierCode: string;
    companyName: string;
    contactName?: string;
    address?: string;
    taxNumber?: string;
    scacNumber?: string;
    dotNumber?: string;
    mcNumber?: string;
    email?: string;
    phone?: string;
    onTimeDeliveryRate: number;
    rating: number;
    status: string;
    contracts: CarrierContractModel[];
    rates: CarrierRateModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class CarrierContractModel extends Model<CarrierContractModel> {
    id: string;
    carrierId: string;
    carrier: CarrierModel;
    contractNumber: string;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CarrierRateModel extends Model<CarrierRateModel> {
    id: string;
    carrierId: string;
    carrier: CarrierModel;
    originLocationId: string;
    destinationLocationId: string;
    baseRate: number;
    rateType: string;
    validFrom: Date;
    validTo: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CarrierDocumentModel extends Model<CarrierDocumentModel> {
    id: string;
    carrierId: string;
    carrier: CarrierModel;
    documentType: string;
    documentUrl: string;
    expiryDate?: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
