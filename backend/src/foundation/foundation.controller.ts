import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentSequenceService } from './document-sequences/document-sequence.service';
import { PeriodLockService } from './period-locks/period-lock.service';
import { CompanySettingsService } from './company-settings/company-settings.service';
import { BranchesService } from './branches/branches.service';
import { EntityEventService } from './entity-events/entity-event.service';
import { ExceptionsService } from './exceptions/exceptions.service';
import { ErpSyncService } from './erp/erp-sync.service';

@Controller('foundation')
@UseGuards(JwtAuthGuard)
export class FoundationController {
  constructor(
    private readonly sequenceService: DocumentSequenceService,
    private readonly periodLockService: PeriodLockService,
    private readonly settingsService: CompanySettingsService,
    private readonly branchesService: BranchesService,
    private readonly entityEventService: EntityEventService,
    private readonly exceptionsService: ExceptionsService,
    private readonly erpSyncService: ErpSyncService,
  ) {}

  // --- Document Sequences ---
  @Get('sequences')
  async listSequences(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    return this.sequenceService.list(orgId);
  }

  @Get('sequences/next/:doctype')
  async getNextNumber(@Request() req: any, @Param('doctype') docType: string) {
    const orgId = req.user?.organizationId || 1;
    const number = await this.sequenceService.next(orgId, docType);
    return { docType, nextNumber: number };
  }

  // --- Period Locks ---
  @Get('period-locks')
  async listPeriodLocks(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    return this.periodLockService.list(orgId);
  }

  @Post('period-locks')
  async setPeriodLock(
    @Request() req: any,
    @Body() body: { branchId: number; lockedUntil: string },
  ) {
    const orgId = req.user?.organizationId || 1;
    const userId = req.user?.id;
    return this.periodLockService.setLock(orgId, body.branchId, body.lockedUntil, userId);
  }

  @Delete('period-locks/:branchId')
  async removePeriodLock(@Request() req: any, @Param('branchId', ParseIntPipe) branchId: number) {
    const orgId = req.user?.organizationId || 1;
    await this.periodLockService.removeLock(orgId, branchId);
    return { success: true };
  }

  // --- Company Settings ---
  @Get('settings')
  async getSettings(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    return this.settingsService.getAll(orgId);
  }

  @Put('settings')
  async updateSetting(@Request() req: any, @Body() body: { key: string; value: any }) {
    const orgId = req.user?.organizationId || 1;
    return this.settingsService.set(orgId, body.key, body.value);
  }

  // --- Branches ---
  @Get('branches')
  async listBranches(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    return this.branchesService.findAll(orgId);
  }

  @Post('branches')
  async createBranch(@Request() req: any, @Body() body: any) {
    const orgId = req.user?.organizationId || 1;
    return this.branchesService.create(orgId, body);
  }

  @Put('branches/:id')
  async updateBranch(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const orgId = req.user?.organizationId || 1;
    return this.branchesService.update(orgId, id, body);
  }

  @Delete('branches/:id')
  async deleteBranch(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const orgId = req.user?.organizationId || 1;
    await this.branchesService.remove(orgId, id);
    return { success: true };
  }

  // --- Entity Events (Audit Diffs) ---
  @Get('audit-diffs/:entityType/:entityId')
  async getAuditDiffs(
    @Request() req: any,
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    const orgId = req.user?.organizationId || 1;
    return this.entityEventService.getHistory(orgId, entityType, entityId);
  }

  // --- Exceptions Control Tower ---
  @Get('exceptions')
  async listExceptions(
    @Request() req: any,
    @Query('status') status?: 'all' | 'open' | 'resolved',
  ) {
    const orgId = req.user?.organizationId || 1;
    return this.exceptionsService.list(orgId, status);
  }

  @Post('exceptions/:id/resolve')
  async resolveException(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const orgId = req.user?.organizationId || 1;
    const userId = req.user?.id;
    return this.exceptionsService.resolve(orgId, id, userId);
  }

  // --- ERP & Tally Integration ---
  @Get('erp/vouchers')
  async getErpVouchers(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    return this.erpSyncService.getVouchers(orgId);
  }

  @Post('erp/sync')
  async syncErpVouchers(@Request() req: any, @Body() body: { voucherIds?: string[] }) {
    const orgId = req.user?.organizationId || 1;
    return this.erpSyncService.syncVouchers(orgId, body?.voucherIds);
  }

  @Get('erp/tally-xml')
  async getTallyXml(@Request() req: any) {
    const orgId = req.user?.organizationId || 1;
    const xml = await this.erpSyncService.generateTallyXml(orgId);
    return { xml };
  }
}
