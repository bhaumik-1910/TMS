import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Vehicles & Fleet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List fleet vehicles with telemetry' })
  async findAll(@CurrentUser('organizationId') orgId: string, @Query('status') status?: string) {
    return this.vehiclesService.findAll(orgId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle details, maintenance and trips' })
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register new vehicle' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.vehiclesService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle information' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.vehiclesService.update(id, body);
  }

  @Post(':id/maintenance')
  @ApiOperation({ summary: 'Record maintenance log' })
  async addMaintenance(@Param('id') id: string, @Body() body: any) {
    return this.vehiclesService.addMaintenance(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vehicle' })
  async remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
