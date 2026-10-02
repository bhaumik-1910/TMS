import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverAdvancesService } from './driver-advances.service';

@ApiTags('Driver Advances & Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/driver-advances')
export class DriverAdvancesController {
  constructor(private readonly driverAdvancesService: DriverAdvancesService) {}

  @Get()
  @ApiOperation({ summary: 'List all driver advances and trip expenses' })
  async findAll() {
    return this.driverAdvancesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new advance or expense voucher' })
  async create(@Body() body: any) {
    return this.driverAdvancesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update advance or expense voucher' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.driverAdvancesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete advance or expense voucher' })
  async remove(@Param('id') id: string) {
    return this.driverAdvancesService.remove(id);
  }
}
