import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { LocationModel } from '../master-data/master-data.model';
import { VehicleModel, DriverModel } from '../fleet/fleet.model';
export declare class TransportOrderModel extends Model<TransportOrderModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    customerId: string;
    customer: CustomerModel;
    orderNumber: string;
    priority: string;
    originLocationId: string;
    originLocation: LocationModel;
    destinationLocationId: string;
    destinationLocation: LocationModel;
    requestedPickupDate: Date;
    requestedDeliveryDate: Date;
    totalWeight: number;
    totalVolume: number;
    totalPackages: number;
    createdBy?: string;
    status: string;
    specialInstructions?: string;
    items: OrderItemModel[];
    shipments: ShipmentModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class OrderItemModel extends Model<OrderItemModel> {
    id: string;
    transportOrderId: string;
    transportOrder: TransportOrderModel;
    description: string;
    quantity: number;
    packageType: string;
    packageTypeId?: string;
    cargoTypeId?: string;
    weight: number;
    volume: number;
    fragile: boolean;
    hazardous: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ShipmentModel extends Model<ShipmentModel> {
    id: string;
    transportOrderId: string;
    transportOrder: TransportOrderModel;
    shipmentNumber: string;
    customerId?: string;
    customer?: CustomerModel;
    carrierId?: string;
    carrier?: CarrierModel;
    vehicleId?: string;
    vehicle?: VehicleModel;
    driverId?: string;
    driver?: DriverModel;
    routeId?: string;
    mode: string;
    distanceKm: number;
    plannedPickup?: Date;
    actualPickup?: Date;
    plannedDelivery?: Date;
    actualDelivery?: Date;
    totalWeight: number;
    totalVolume: number;
    status: string;
    freightCost: number;
    items: ShipmentItemModel[];
    routes: RouteModel[];
    dispatches: DispatchModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ShipmentItemModel extends Model<ShipmentItemModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    orderItemId: string;
    orderItem: OrderItemModel;
    allocatedQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RouteModel extends Model<RouteModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    routeName: string;
    totalDistanceKm: number;
    estimatedDurationMinutes: number;
    geometryPolyline?: string;
    stops: RouteStopModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class RouteStopModel extends Model<RouteStopModel> {
    id: string;
    routeId: string;
    route: RouteModel;
    locationId: string;
    location: LocationModel;
    stopSequence: number;
    stopType: string;
    estimatedArrival?: Date;
    actualArrival?: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LoadPlanModel extends Model<LoadPlanModel> {
    id: string;
    planNumber: string;
    vehicleId: string;
    vehicle: VehicleModel;
    plannedWeightKg: number;
    plannedVolumeCbm: number;
    weightUtilizationPercent: number;
    volumeUtilizationPercent: number;
    status: string;
    items: LoadPlanItemModel[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class LoadPlanItemModel extends Model<LoadPlanItemModel> {
    id: string;
    loadPlanId: string;
    loadPlan: LoadPlanModel;
    orderItemId: string;
    orderItem: OrderItemModel;
    plannedQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DispatchModel extends Model<DispatchModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    vehicleId: string;
    vehicle: VehicleModel;
    driverId: string;
    driver: DriverModel;
    carrierId?: string;
    carrier?: CarrierModel;
    dispatchNumber: string;
    dispatchTime: Date;
    status: string;
    completeTime?: Date;
    startOdometer: number;
    endOdometer: number;
    totalKm: number;
    fuelLitres: number;
    tripExpenseTotal: number;
    driverSettlementAmount: number;
    closureStatus: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TenderRequestModel extends Model<TenderRequestModel> {
    id: string;
    shipmentId: string;
    shipment: ShipmentModel;
    carrierId: string;
    carrier: CarrierModel;
    offeredRate: number;
    expirationTime: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
