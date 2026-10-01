import { ProofOfDeliveryModel, ShipmentModel, VehicleModel, DriverModel, InvoiceModel, InvoiceItemModel, NotificationModel } from '../database/models';
export declare class PodService {
    private readonly podModel;
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly invoiceModel;
    private readonly invoiceItemModel;
    private readonly notificationModel;
    constructor(podModel: typeof ProofOfDeliveryModel, shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, invoiceModel: typeof InvoiceModel, invoiceItemModel: typeof InvoiceItemModel, notificationModel: typeof NotificationModel);
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
