import { OrganizationModel, UserModel, VehicleModel, DriverModel, TransportOrderModel, ShipmentModel, AuditLogModel } from '../database/models';
export declare class AdminConsoleService {
    private readonly orgModel;
    private readonly userModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly orderModel;
    private readonly shipmentModel;
    private readonly auditLogModel;
    constructor(orgModel: typeof OrganizationModel, userModel: typeof UserModel, vehicleModel: typeof VehicleModel, driverModel: typeof DriverModel, orderModel: typeof TransportOrderModel, shipmentModel: typeof ShipmentModel, auditLogModel: typeof AuditLogModel);
    getSystemOverview(): Promise<{
        organizations: {
            total: number;
            active: number;
            suspended: number;
        };
        users: {
            total: number;
            active: number;
        };
        fleet: {
            totalVehicles: number;
            inTransitVehicles: number;
            totalDrivers: number;
            activeDrivers: number;
        };
        transport: {
            totalOrders: number;
            totalShipments: number;
        };
    }>;
    getOrganizations(): Promise<{
        _count: {
            users: number;
            vehicles: number;
            drivers: number;
            transportOrders: number;
        };
        id: string;
        name: string;
        code: string;
        email?: string;
        phone?: string;
        address?: string;
        timezone: string;
        currency: string;
        status: string;
        logoUrl?: string;
        users: UserModel[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | any;
        version?: number | any;
        _attributes: OrganizationModel;
        dataValues: OrganizationModel;
        _creationAttributes: OrganizationModel;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<OrganizationModel, OrganizationModel>;
    }[]>;
    getSystemHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        services: {
            apiGateway: {
                status: string;
                latencyMs: number;
            };
            database: {
                status: string;
                engine: string;
                latencyMs: number;
            };
            webSocketTelemetry: {
                status: string;
                protocol: string;
            };
            backgroundJobs: {
                status: string;
                workers: number;
            };
            notificationEngine: {
                status: string;
                channel: string;
            };
        };
        system: {
            nodeVersion: string;
            memoryUsageMb: number;
            platform: NodeJS.Platform;
        };
    }>;
    getSecurityAudit(): Promise<AuditLogModel[]>;
}
