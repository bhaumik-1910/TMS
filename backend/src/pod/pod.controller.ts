import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PodService } from './pod.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Proof of Delivery (POD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/pod')
export class PodController {
  constructor(private podService: PodService) {}

  @Get()
  @ApiOperation({ summary: 'List all POD records' })
  async findAll(@Query() query: any) {
    return this.podService.findAllRecords(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new POD record' })
  async create(@Body() body: any) {
    return this.podService.createRecord(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single POD record or by shipmentId' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.podService.findOneRecord(id);
    } catch {
      return this.podService.getPOD(id);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update POD record' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.podService.updateRecord(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete POD record' })
  async remove(@Param('id') id: string) {
    return this.podService.removeRecord(id);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit POD with digital signature, receiver name, photo and OTP' })
  async submitPOD(@Body() body: any) {
    return this.podService.submitPOD(body);
  }
}
