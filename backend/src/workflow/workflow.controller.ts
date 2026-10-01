import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':entityType/:entityId')
  async getWorkflowState(
    @Param('entityType') entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH',
    @Param('entityId') entityId: string,
    @Req() req: any,
  ) {
    return this.workflowService.getWorkflowState(entityType.toUpperCase() as any, entityId, req.user);
  }

  @Post(':entityType/:entityId/transition')
  async transition(
    @Param('entityType') entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH',
    @Param('entityId') entityId: string,
    @Body() body: { targetState: string; reason?: string; metadata?: any },
    @Req() req: any,
  ) {
    return this.workflowService.transition(
      entityType.toUpperCase() as any,
      entityId,
      body.targetState,
      req.user,
      body.reason,
      body.metadata,
    );
  }
}
