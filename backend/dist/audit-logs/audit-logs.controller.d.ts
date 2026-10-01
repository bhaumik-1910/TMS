import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(user: any, module?: string, entityType?: string): Promise<import("../database/models").AuditLogModel[]>;
}
