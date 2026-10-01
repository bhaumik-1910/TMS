import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Modular Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Scoped operational overview KPIs' })
  async getOverview(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getOverview(user, orgContext);
  }

  @Get('shipments')
  @ApiOperation({ summary: 'Scoped active shipments feed' })
  async getShipments(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getShipments(user, orgContext);
  }

  @Get('fleet')
  @ApiOperation({ summary: 'Scoped fleet status counts' })
  async getFleet(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getFleet(user, orgContext);
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'Scoped operational exceptions' })
  async getExceptions(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getExceptions(user, orgContext);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Financial dashboard metrics' })
  async getFinancial(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getFinancial(user, orgContext);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Activity timeline stream' })
  async getActivity(
    @CurrentUser() user: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.dashboardService.getActivity(user, orgContext);
  }
}
