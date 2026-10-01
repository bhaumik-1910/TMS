import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get(':resourceType/:resourceId')
  async getAssignments(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.assignmentService.getAssignments(resourceType, resourceId);
  }

  @Post(':resourceType/:resourceId')
  async assign(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Body() body: { assignmentType: string; targetId: string; reason?: string },
    @Req() req: any,
  ) {
    return this.assignmentService.assign(
      resourceType,
      resourceId,
      body.assignmentType,
      body.targetId,
      req.user,
      body.reason,
    );
  }
}
