import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Transport Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List transport orders with filtering' })
  async findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.ordersService.findAll(orgId, status, customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transport order details' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new transport order with items' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.ordersService.create(user?.organizationId, user?.userId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transport order / booking' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateOrder(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transport order / booking' })
  async remove(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition order status with business validation' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') newStatus: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.ordersService.updateStatus(id, newStatus, userId);
  }
}
