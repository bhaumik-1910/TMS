import { OnModuleInit } from '@nestjs/common';
import { ProofOfDeliveryModel, ShipmentModel, VehicleModel, DriverModel, InvoiceModel, InvoiceItemModel, NotificationModel, PodRecordModel } from '../database/models';
export declare class PodService implements OnModuleInit {
    private readonly podModel;
    private readonly podRecordModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly invoiceModel;
    private readonly invoiceItemModel;
    private readonly notificationModel;
    constructor(podModel: typeof ProofOfDeliveryModel, podRecordModel: typeof PodRecordModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, invoiceModel: typeof InvoiceModel, invoiceItemModel: typeof InvoiceItemModel, notificationModel: typeof NotificationModel);
    onModuleInit(): Promise<void>;
    findAllRecords(query?: any): Promise<PodRecordModel[]>;
    findOneRecord(id: string): Promise<PodRecordModel>;
    createRecord(dto: any): Promise<PodRecordModel>;
    updateRecord(id: string, dto: any): Promise<PodRecordModel>;
    removeRecord(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitPOD(data: {
        shipmentId: string;
        receiverName: string;
        receiverContact?: string;
        otp?: string;
        signatureUrl?: string;
        photoUrl?: string;
        latitude?: number;
        longitude?: number;
        remarks?: string;
    }): Promise<ProofOfDeliveryModel>;
    getPOD(shipmentId: string): Promise<ProofOfDeliveryModel>;
}
