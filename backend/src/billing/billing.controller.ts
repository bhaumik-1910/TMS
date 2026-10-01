import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Billing, Freight Audit & Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List customer freight invoices' })
  async findAllInvoices(@CurrentUser('organizationId') orgId: string, @Query('status') status?: string) {
    return this.billingService.findAllInvoices(orgId, status);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice with items, payments, and delivery proof' })
  async findInvoice(@Param('id') id: string) {
    return this.billingService.findInvoice(id);
  }

  @Post('invoices/:id/payments')
  @ApiOperation({ summary: 'Record payment for invoice' })
  async recordPayment(@Param('id') id: string, @Body() body: any) {
    return this.billingService.recordPayment(id, body);
  }

  @Post('freight-audit/compare')
  @ApiOperation({ summary: 'Audit carrier invoice vs contract rate and flag variances' })
  async auditCarrierInvoice(@Body() body: any) {
    return this.billingService.auditCarrierInvoice(body);
  }

  @Get('claims')
  @ApiOperation({ summary: 'List damage/shortage claims' })
  async findAllClaims(@CurrentUser('organizationId') orgId: string) {
    return this.billingService.findAllClaims(orgId);
  }

  @Post('claims')
  @ApiOperation({ summary: 'File freight claim' })
  async createClaim(@Body() body: any) {
    return this.billingService.createClaim(body);
  }

  @Patch('claims/:id/status')
  @ApiOperation({ summary: 'Update claim status (APPROVED, REJECTED, SETTLED)' })
  async updateClaimStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.billingService.updateClaimStatus(id, status);
  }
}
