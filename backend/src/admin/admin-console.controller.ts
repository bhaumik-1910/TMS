import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminConsoleService } from './admin-console.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Super Admin Platform Console')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('api/v1/admin')
export class AdminConsoleController {
  constructor(private adminConsoleService: AdminConsoleService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform-wide administrative overview' })
  async getSystemOverview() {
    return this.adminConsoleService.getSystemOverview();
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List all platform tenant organizations' })
  async getOrganizations() {
    return this.adminConsoleService.getOrganizations();
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Real-time infrastructure health and latency' })
  async getSystemHealth() {
    return this.adminConsoleService.getSystemHealth();
  }

  @Get('security-audit')
  @ApiOperation({ summary: 'Platform security audit events' })
  async getSecurityAudit() {
    return this.adminConsoleService.getSecurityAudit();
  }
}
