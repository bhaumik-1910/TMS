import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List drivers' })
  async findAll(@CurrentUser('organizationId') orgId: string, @Query('status') status?: string) {
    return this.driversService.findAll(orgId, status);
  }

  @Get('active-trip/:driverId')
  @ApiOperation({ summary: 'Get active trip for driver mobile application' })
  async getDriverActiveTrip(@Param('driverId') driverId: string) {
    return this.driversService.getDriverActiveTrip(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver details' })
  async findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create driver' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.driversService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.driversService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete driver' })
  async remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
