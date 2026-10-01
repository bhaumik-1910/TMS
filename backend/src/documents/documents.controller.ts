import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Documents & Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents filtered by entity' })
  async findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.documentsService.findAll(orgId, entityType, entityId);
  }

  @Get('types')
  @ApiOperation({ summary: 'List all document types' })
  async getDocumentTypes() {
    return this.documentsService.getDocumentTypes();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get documents expiring in next 30 days' })
  async getExpiring(@CurrentUser('organizationId') orgId: string, @Query('days') days?: string) {
    return this.documentsService.getExpiringDocuments(orgId, days ? parseInt(days) : 30);
  }

  @Post()
  @ApiOperation({ summary: 'Upload/register document' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.documentsService.create(orgId, body);
  }
}
