import { TransportOrderModel, CustomerModel, LocationModel, OrderItemModel, VehicleModel, ShipmentModel, LoadPlanModel } from '../database/models';
export declare class PlanningService {
    private readonly orderModel;
    private readonly vehicleModel;
    private readonly shipmentModel;
    private readonly loadPlanModel;
    constructor(orderModel: typeof TransportOrderModel, vehicleModel: typeof VehicleModel, shipmentModel: typeof ShipmentModel, loadPlanModel: typeof LoadPlanModel);
    getPlannerWorkspace(organizationId: string): Promise<{
        unplannedOrders: {
            orderItems: OrderItemModel[];
            id: string;
            organizationId: string;
            organization: import("../database/models").OrganizationModel;
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
            deletedAt?: Date | any;
            version?: number | any;
            _attributes: TransportOrderModel;
            dataValues: TransportOrderModel;
            _creationAttributes: TransportOrderModel;
            isNewRecord: boolean;
            sequelize: import("sequelize").Sequelize;
            _model: import("sequelize").Model<TransportOrderModel, TransportOrderModel>;
        }[];
        availableVehicles: {
            id: string;
            vehicleNumber: string;
            make: string;
            model: string;
            type: string;
            depot: string;
            capacityWeight: number;
            capacityVolume: number;
        }[];
        plannedShipments: ShipmentModel[];
    }>;
    optimizeLoad(organizationId: string, vehicleId: string, orderIds: string[]): Promise<{
        loadPlan: LoadPlanModel;
        vehicle: {
            id: string;
            number: string;
            capacityWeight: number;
            capacityVolume: number;
        };
        metrics: {
            totalWeight: number;
            totalVolume: number;
            weightUtilization: number;
            volumeUtilization: number;
            ordersCount: number;
        };
    }>;
}
