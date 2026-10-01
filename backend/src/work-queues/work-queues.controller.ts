import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WorkQueuesService } from './work-queues.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/work-queues')
@UseGuards(JwtAuthGuard)
export class WorkQueuesController {
  constructor(private readonly workQueuesService: WorkQueuesService) {}

  @Get('my')
  async getMyQueue(@Req() req: any) {
    return this.workQueuesService.getMyQueue(req.user);
  }

  @Get('planning')
  async getPlanningQueue(@Req() req: any) {
    return this.workQueuesService.getPlanningQueue(req.user);
  }

  @Get('dispatch')
  async getDispatchQueue(@Req() req: any) {
    return this.workQueuesService.getDispatchQueue(req.user);
  }

  @Get('finance')
  async getFinanceQueue(@Req() req: any) {
    return this.workQueuesService.getFinanceQueue(req.user);
  }

  @Get('compliance')
  async getComplianceQueue(@Req() req: any) {
    return this.workQueuesService.getComplianceQueue(req.user);
  }

  @Get('support')
  async getSupportQueue(@Req() req: any) {
    return this.workQueuesService.getSupportQueue(req.user);
  }
}
