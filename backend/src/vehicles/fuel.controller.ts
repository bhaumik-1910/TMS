import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FuelService } from './fuel.service';

@ApiTags('Fuel & Fleet Consumption')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  @ApiOperation({ summary: 'List all fuel entries' })
  async findAll() {
    return this.fuelService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Record new fuel entry' })
  async create(@Body() body: any) {
    return this.fuelService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fuel entry' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.fuelService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete fuel entry' })
  async remove(@Param('id') id: string) {
    return this.fuelService.remove(id);
  }
}
