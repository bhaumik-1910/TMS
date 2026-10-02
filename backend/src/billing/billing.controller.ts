import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  @Get('records')
  @ApiOperation({ summary: 'List all billing invoices from database' })
  async getBillingRecords(@Query() query: any) {
    return this.billingService.findAllBillingInvoices(query);
  }

  @Post('records')
  @ApiOperation({ summary: 'Create new billing invoice in database' })
  async createBillingRecord(@Body() body: any) {
    return this.billingService.createBillingInvoice(body);
  }

  @Patch('records/:id')
  @ApiOperation({ summary: 'Update billing invoice in database' })
  async updateBillingRecord(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updateBillingInvoice(id, body);
  }

  @Delete('records/:id')
  @ApiOperation({ summary: 'Delete billing invoice from database' })
  async deleteBillingRecord(@Param('id') id: string) {
    return this.billingService.deleteBillingInvoice(id);
  }

  @Get('purchase-bills')
  @ApiOperation({ summary: 'List all purchase bills from database' })
  async getPurchaseBills(@Query() query: any) {
    return this.billingService.findAllPurchaseBills(query);
  }

  @Post('purchase-bills')
  @ApiOperation({ summary: 'Create new purchase bill in database' })
  async createPurchaseBill(@Body() body: any) {
    return this.billingService.createPurchaseBill(body);
  }

  @Patch('purchase-bills/:id')
  @ApiOperation({ summary: 'Update purchase bill in database' })
  async updatePurchaseBill(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updatePurchaseBill(id, body);
  }

  @Delete('purchase-bills/:id')
  @ApiOperation({ summary: 'Delete purchase bill from database' })
  async deletePurchaseBill(@Param('id') id: string) {
    return this.billingService.deletePurchaseBill(id);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'List all trip settlements from database' })
  async getSettlements(@Query() query: any) {
    return this.billingService.findAllSettlements(query);
  }

  @Post('settlements')
  @ApiOperation({ summary: 'Create new trip settlement in database' })
  async createSettlement(@Body() body: any) {
    return this.billingService.createSettlement(body);
  }

  @Patch('settlements/:id')
  @ApiOperation({ summary: 'Update trip settlement in database' })
  async updateSettlement(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updateSettlement(id, body);
  }

  @Delete('settlements/:id')
  @ApiOperation({ summary: 'Delete trip settlement from database' })
  async deleteSettlement(@Param('id') id: string) {
    return this.billingService.deleteSettlement(id);
  }

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
