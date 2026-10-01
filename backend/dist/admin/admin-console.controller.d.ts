import { AdminConsoleService } from './admin-console.service';
export declare class AdminConsoleController {
    private adminConsoleService;
    constructor(adminConsoleService: AdminConsoleService);
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
        users: import("../database/models").UserModel[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | any;
        version?: number | any;
        _attributes: import("../database/models").OrganizationModel;
        dataValues: import("../database/models").OrganizationModel;
        _creationAttributes: import("../database/models").OrganizationModel;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<import("../database/models").OrganizationModel, import("../database/models").OrganizationModel>;
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
    getSecurityAudit(): Promise<import("../database/models").AuditLogModel[]>;
}
