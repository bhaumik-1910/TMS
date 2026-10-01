import { Sequelize } from 'sequelize-typescript';
export declare class HealthController {
    private readonly sequelize;
    constructor(sequelize: Sequelize);
    getHealth(): Promise<{
        status: string;
        service: string;
        orm: string;
        timestamp: string;
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
    }>;
    getReadiness(): Promise<{
        status: string;
        database: string;
        orm: string;
        timestamp: string;
        environment: string;
    }>;
}
