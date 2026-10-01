import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PodService } from './pod.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Proof of Delivery (POD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/pod')
export class PodController {
  constructor(private podService: PodService) {}

  @Get(':shipmentId')
  @ApiOperation({ summary: 'Get Proof of Delivery for shipment' })
  async getPOD(@Param('shipmentId') shipmentId: string) {
    return this.podService.getPOD(shipmentId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit POD with digital signature, receiver name, photo and OTP' })
  async submitPOD(@Body() body: any) {
    return this.podService.submitPOD(body);
  }
}
