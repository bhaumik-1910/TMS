import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Analytics & Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get role-tailored dashboard KPIs, charts, and trends' })
  async getDashboard(@CurrentUser() user: any, @Query('role') role?: string) {
    const userRole = role || user.roles[0] || 'OPERATIONS_MANAGER';
    return this.analyticsService.getRoleDashboard(userRole, user.organizationId, user.userId);
  }
}
