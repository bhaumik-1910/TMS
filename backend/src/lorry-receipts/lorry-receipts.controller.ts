import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LorryReceiptsService } from './lorry-receipts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('LR / Consignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/lorry-receipts')
export class LorryReceiptsController {
  constructor(private lrService: LorryReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List all Lorry Receipts (LR / Consignment Notes)' })
  async findAll(@CurrentUser('organizationId') orgId: string) {
    return this.lrService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single LR with E-way bill details' })
  async findOne(@Param('id') id: string) {
    return this.lrService.findOne(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate LR and E-way bill for shipment' })
  async generateLR(@Body() body: any, @CurrentUser() user: any) {
    return this.lrService.generateLR({
      ...body,
      userId: user?.id,
      organizationId: user?.organizationId,
    });
  }
}
