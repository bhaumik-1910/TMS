import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/master-data')
export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  @Get('locations')
  @ApiOperation({ summary: 'Get all tenant locations (warehouses, hubs, depots)' })
  async getLocations(@CurrentUser('organizationId') orgId: string) {
    return this.masterDataService.getLocations(orgId);
  }

  @Post('locations')
  @ApiOperation({ summary: 'Create new location with GPS coordinates' })
  async createLocation(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.masterDataService.createLocation(orgId, body);
  }

  @Get('location-types')
  @ApiOperation({ summary: 'Get location types' })
  async getLocationTypes() {
    return this.masterDataService.getLocationTypes();
  }

  @Get('vehicle-types')
  @ApiOperation({ summary: 'Get vehicle types' })
  async getVehicleTypes() {
    return this.masterDataService.getVehicleTypes();
  }

  @Get('cargo-types')
  @ApiOperation({ summary: 'Get cargo types' })
  async getCargoTypes() {
    return this.masterDataService.getCargoTypes();
  }

  @Get('package-types')
  @ApiOperation({ summary: 'Get package types' })
  async getPackageTypes() {
    return this.masterDataService.getPackageTypes();
  }
}
