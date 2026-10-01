import { Controller, Get, Patch, Post, Param, Body, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Shipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Get()
  @RequirePermissions('shipment:view')
  @ApiOperation({ summary: 'List shipments scoped by user DataScope and organization context' })
  async findAll(
    @CurrentUser() user: any,
    @Query() query: any,
    @Headers('x-organization-context') orgContext?: string,
  ) {
    return this.shipmentsService.findAll(user, query, orgContext);
  }

  @Get(':id')
  @RequirePermissions('shipment:view')
  @ApiOperation({ summary: 'Get shipment full details verified against resource policy' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.shipmentsService.findOne(id, user);
  }

  @Patch(':id/assign')
  @RequirePermissions('dispatch:assign', 'shipment:update')
  @ApiOperation({ summary: 'Assign vehicle, driver, carrier or route to shipment' })
  async assignResources(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ) {
    return this.shipmentsService.assignResources(id, body, userId);
  }

  @Patch(':id/status')
  @RequirePermissions('dispatch:dispatch', 'shipment:update')
  @ApiOperation({ summary: 'Update shipment status (PLANNED, ASSIGNED, IN_TRANSIT, DELIVERED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.shipmentsService.updateStatus(id, status, userId);
  }

  @Post(':id/pod')
  @RequirePermissions('pod:submit')
  @ApiOperation({ summary: 'Submit proof of delivery with digital signature and photo' })
  async submitPOD(
    @Param('id') id: string,
    @Body() podDto: any,
    @CurrentUser() user: any,
  ) {
    return this.shipmentsService.submitPOD(id, podDto, user);
  }
}
