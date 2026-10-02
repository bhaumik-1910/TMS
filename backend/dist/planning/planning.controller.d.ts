import { PlanningService } from './planning.service';
export declare class PlanningController {
    private planningService;
    constructor(planningService: PlanningService);
    getWorkspace(orgId: string): Promise<{
        unplannedOrders: {
            orderItems: import("../database/models").OrderItemModel[];
            id: string;
            organizationId: string;
            organization: import("../database/models").OrganizationModel;
            customerId?: string;
            customer?: import("../database/models").CustomerModel;
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
            originLocation?: import("../database/models").LocationModel;
            destinationLocationId?: string;
            destinationLocation?: import("../database/models").LocationModel;
            requestedPickupDate?: Date;
            requestedDeliveryDate?: Date;
            totalWeight: number;
            totalVolume: number;
            totalPackages: number;
            createdBy?: string;
            status: string;
            specialInstructions?: string;
            items: import("../database/models").OrderItemModel[];
            shipments: import("../database/models").ShipmentModel[];
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date | any;
            version?: number | any;
            _attributes: import("../database/models").TransportOrderModel;
            dataValues: import("../database/models").TransportOrderModel;
            _creationAttributes: import("../database/models").TransportOrderModel;
            isNewRecord: boolean;
            sequelize: import("sequelize").Sequelize;
            _model: import("sequelize").Model<import("../database/models").TransportOrderModel, import("../database/models").TransportOrderModel>;
        }[];
        availableVehicles: import("../database/models").VehicleModel[];
        plannedShipments: import("../database/models").ShipmentModel[];
    }>;
    optimizeLoad(orgId: string, body: any): Promise<{
        loadPlan: import("../database/models").LoadPlanModel;
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
