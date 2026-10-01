import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { ShipmentModel, DispatchModel } from '../operations/operations.model';
import { VehicleModel } from '../fleet/fleet.model';
export declare class TrackingEventModel extends Model<TrackingEventModel> {
    id: string;
    shipmentId?: string;
    shipment?: ShipmentModel;
    vehicleId?: string;
    vehicle?: VehicleModel;
    latitude: number;
    longitude: number;
    speedKmH: number;
    status: string;
    locationAddress?: string;
    timestamp: Date;
}
export declare class GeofenceModel extends Model<GeofenceModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    name: string;
    shapeType: string;
    centerLatitude: number;
    centerLongitude: number;
    radiusMeters: number;
    polygonCoordinatesJson?: string;
    events: GeofenceEventModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class GeofenceEventModel extends Model<GeofenceEventModel> {
    id: string;
    geofenceId: string;
    geofence: GeofenceModel;
    vehicleId: string;
    vehicle: VehicleModel;
    eventType: string;
    eventTime: Date;
}
export declare class ProofOfDeliveryModel extends Model<ProofOfDeliveryModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    receiverName: string;
    receiverPhone?: string;
    signatureData?: string;
    photoUrl?: string;
    otpCode?: string;
    deliveredAt: Date;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LorryReceiptModel extends Model<LorryReceiptModel> {
    id: string;
    dispatchId?: string;
    dispatch?: DispatchModel;
    shipmentId?: string;
    shipment?: ShipmentModel;
    lrNumber: string;
    consignorName: string;
    consigneeName: string;
    chargedWeightKg: number;
    totalFreightAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
