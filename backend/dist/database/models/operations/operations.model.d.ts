import { Model } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { LocationModel } from '../master-data/master-data.model';
import { VehicleModel, DriverModel } from '../fleet/fleet.model';
export declare class TransportOrderModel extends Model<TransportOrderModel> {
    id: string;
    organizationId: string;
    organization: OrganizationModel;
    customerId?: string;
    customer?: CustomerModel;
    orderNumber: string;
    priority: string;
    lrNo?: string;
    bookingDate?: string;
    consignor?: string;
    consignee?: string;
    billingParty?: string;
    origin?: string;
    destination?: string;
    route?: string;
    product?: string;
    quantity?: string;
    actualWeight?: string;
    chargedWt?: string;
    freightBasis?: string;
    rate?: string;
    ewayBill?: string;
    assignedVehicle?: string;
    assignedDriver?: string;
    branch?: string;
    originLocationId?: string;
    originLocation?: LocationModel;
    destinationLocationId?: string;
    destinationLocation?: LocationModel;
    requestedPickupDate?: Date;
    requestedDeliveryDate?: Date;
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
    shipmentId?: string;
    shipment?: ShipmentModel;
    vehicleId?: string;
    vehicleObj?: VehicleModel;
    driverId?: string;
    driverObj?: DriverModel;
    carrierId?: string;
    carrier?: CarrierModel;
    dispatchNumber: string;
    tripId?: string;
    lrRef?: string;
    route?: string;
    startDate?: string;
    vehicle?: string;
    driver?: string;
    coDriver?: string;
    odoStart?: string;
    odoEnd?: string;
    plannedKm?: string;
    actualKm?: string;
    hireAmount?: string;
    advanceToOwner?: string;
    fuelBudget?: string;
    tollBudget?: string;
    driverBhatta?: string;
    loadingUnloading?: string;
    dispatchTime?: Date;
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
export declare class DriverAdvanceModel extends Model<DriverAdvanceModel> {
    id: string;
    entryId: string;
    date: string;
    driver: string;
    tripRef: string;
    entryType: string;
    expenseHead: string;
    amount: number;
    paymentMode: string;
    status: string;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TyreEventModel extends Model<TyreEventModel> {
    id: string;
    eventId: string;
    date: string;
    tyreSerial: string;
    vehicle: string;
    eventType: string;
    position: string;
    odometer: string;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TyreInventoryModel extends Model<TyreInventoryModel> {
    id: string;
    serialNo: string;
    brand: string;
    size: string;
    type: string;
    supplier: string;
    cost: number;
    vehicle?: string;
    position?: string;
    fitDate?: string;
    fitOdom: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class JobCardModel extends Model<JobCardModel> {
    id: string;
    jobCardId: string;
    date: string;
    vehicle: string;
    serviceCentre: string;
    workType: string;
    status: string;
    complaint: string;
    partsUsed?: string;
    labourCost: number;
    totalCost: number;
    expectedDowntime?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PodRecordModel extends Model<PodRecordModel> {
    id: string;
    podId: string;
    lrRef: string;
    customer: string;
    deliveryDate?: string;
    receiver?: string;
    deliveredQty?: string;
    shortage: string;
    source: string;
    status: string;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BillingInvoiceModel extends Model<BillingInvoiceModel> {
    id: string;
    invoiceNo: string;
    lrRef: string;
    customer: string;
    baseAmt: string;
    gst: string;
    total: string;
    gstType: string;
    irn: string;
    dueDate?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PurchaseBillModel extends Model<PurchaseBillModel> {
    id: string;
    supplier: string;
    type: string;
    billNo: string;
    date: string;
    baseAmt: string;
    gst: string;
    total: string;
    tds: string;
    tdsSection: string;
    linkedRef: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SettlementModel extends Model<SettlementModel> {
    id: string;
    settlementType: string;
    party: string;
    tripRef: string;
    grossAmt: string;
    advance: string;
    tds: string;
    shortage: string;
    netPayable: string;
    date: string;
    status: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}
