import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Live Tracking & Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get('fleet')
  @ApiOperation({ summary: 'Get current GPS coordinates of all active fleet vehicles' })
  async getActiveFleetLocations(@CurrentUser('organizationId') orgId: string) {
    return this.trackingService.getActiveFleetLocations(orgId);
  }

  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get live tracking data, route trail, ETA, and geofence alerts for shipment' })
  async getShipmentTracking(@Param('id') id: string) {
    return this.trackingService.getShipmentTracking(id);
  }

  @Post('telemetry')
  @ApiOperation({ summary: 'Simulate or ingest GPS telemetry point from driver app/device' })
  async recordTelemetry(@Body() body: any) {
    return this.trackingService.recordTelemetry(body);
  }

  @Get('geofences')
  @ApiOperation({ summary: 'Get tenant geofences' })
  async getGeofences(@CurrentUser('organizationId') orgId: string) {
    return this.trackingService.getGeofences(orgId);
  }
}
