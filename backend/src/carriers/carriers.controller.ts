import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CarriersService } from './carriers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Carriers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/carriers')
export class CarriersController {
  constructor(private carriersService: CarriersService) {}

  @Get()
  @ApiOperation({ summary: 'List all carriers with contracts and rates' })
  async findAll(@CurrentUser('organizationId') orgId: string, @Query('search') search?: string) {
    return this.carriersService.findAll(orgId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carrier details' })
  async findOne(@Param('id') id: string) {
    return this.carriersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create carrier' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.carriersService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update carrier' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.carriersService.update(id, body);
  }

  @Post(':id/rates')
  @ApiOperation({ summary: 'Add lane rate for carrier' })
  async addRate(@Param('id') id: string, @Body() body: any) {
    return this.carriersService.addRate(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete carrier' })
  async remove(@Param('id') id: string) {
    return this.carriersService.remove(id);
  }
}
