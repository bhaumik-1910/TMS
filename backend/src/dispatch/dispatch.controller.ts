import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/dispatch')
export class DispatchController {
  constructor(private dispatchService: DispatchService) {}

  @Get()
  @ApiOperation({ summary: 'List all dispatches' })
  async findAll(@CurrentUser('organizationId') orgId: string, @Query('status') status?: string) {
    return this.dispatchService.findAll(orgId, status);
  }

  @Get('board')
  @ApiOperation({ summary: 'Get dispatch Kanban board by status columns' })
  async getDispatchBoard(@CurrentUser('organizationId') orgId: string) {
    return this.dispatchService.getDispatchBoard(orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create dispatch and assign vehicle/driver transactionally' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.dispatchService.create(user?.organizationId, body, user?.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip allocation' })
  async updateTrip(@Param('id') id: string, @Body() body: any) {
    return this.dispatchService.updateTrip(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip allocation' })
  async deleteTrip(@Param('id') id: string) {
    return this.dispatchService.deleteTrip(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dispatch status (IN_TRANSIT, DELIVERY, COMPLETED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.dispatchService.updateStatus(id, status, userId);
  }

  @Post(':id/expenses')
  @ApiOperation({ summary: 'Log trip execution expense (Fuel, Allowance, Toll, Tyre, Service)' })
  async addTripExpense(@Param('id') id: string, @Body() body: any) {
    return this.dispatchService.addTripExpense(id, body);
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get all logged expenses for trip dispatch' })
  async getTripExpenses(@Param('id') id: string) {
    return this.dispatchService.getTripExpenses(id);
  }

  @Post(':id/close-trip')
  @ApiOperation({ summary: 'Close trip with final KM, fuel entry, and driver settlement (Stage 9 in diagram)' })
  async closeTrip(@Param('id') id: string, @Body() body: any) {
    return this.dispatchService.closeTrip(id, body);
  }
}
