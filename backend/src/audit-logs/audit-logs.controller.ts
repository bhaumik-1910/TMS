import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/audit-logs')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'TMS_ADMIN', 'COMPLIANCE_MANAGER')
  @ApiOperation({ summary: 'View immutable system audit logs (Admin/Compliance)' })
  async findAll(
    @CurrentUser() user: any,
    @Query('module') module?: string,
    @Query('entityType') entityType?: string,
  ) {
    const orgId = user.roles.includes('SUPER_ADMIN') ? undefined : user.organizationId;
    return this.auditLogsService.findAll(orgId, module, entityType);
  }
}
