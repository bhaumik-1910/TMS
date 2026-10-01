import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Transport Planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/planning')
export class PlanningController {
  constructor(private planningService: PlanningService) {}

  @Get('workspace')
  @ApiOperation({ summary: 'Get planner workspace with unplanned orders and capacity' })
  async getWorkspace(@CurrentUser('organizationId') orgId: string) {
    return this.planningService.getPlannerWorkspace(orgId);
  }

  @Post('optimize-load')
  @ApiOperation({ summary: 'Calculate load plan and utilization percentages' })
  async optimizeLoad(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.planningService.optimizeLoad(orgId, body.vehicleId, body.orderIds);
  }
}
