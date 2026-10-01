import { AuditLogModel } from '../database/models';
export declare class AuditLogsService {
    private readonly auditLogModel;
    constructor(auditLogModel: typeof AuditLogModel);
    findAll(organizationId?: string, module?: string, entityType?: string): Promise<AuditLogModel[]>;
}
