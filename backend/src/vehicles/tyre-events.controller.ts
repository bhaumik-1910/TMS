import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TyreEventsService } from './tyre-events.service';

@ApiTags('Tyre Operations & Fleet Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class TyreEventsController {
  constructor(private readonly tyreEventsService: TyreEventsService) {}

  // --- TYRE INVENTORY ENDPOINTS ---
  @Get('tyres')
  @ApiOperation({ summary: 'List all tyre inventory' })
  async findAllTyres(@Query() query: any) {
    return this.tyreEventsService.findAllTyres(query);
  }

  @Post('tyres')
  @ApiOperation({ summary: 'Create new tyre unit' })
  async createTyre(@Body() body: any) {
    return this.tyreEventsService.createTyre(body);
  }

  @Patch('tyres/:id')
  @ApiOperation({ summary: 'Update tyre unit' })
  async updateTyre(@Param('id') id: string, @Body() body: any) {
    return this.tyreEventsService.updateTyre(id, body);
  }

  @Delete('tyres/:id')
  @ApiOperation({ summary: 'Delete tyre unit' })
  async removeTyre(@Param('id') id: string) {
    return this.tyreEventsService.removeTyre(id);
  }

  // --- TYRE EVENTS ENDPOINTS ---
  @Get('tyre-events')
  @ApiOperation({ summary: 'List all tyre events' })
  async findAllEvents(@Query() query: any) {
    return this.tyreEventsService.findAll(query);
  }

  @Get('tyre-events/:id')
  @ApiOperation({ summary: 'Get single tyre event' })
  async findOneEvent(@Param('id') id: string) {
    return this.tyreEventsService.findOne(id);
  }

  @Post('tyre-events')
  @ApiOperation({ summary: 'Record new tyre event' })
  async createEvent(@Body() body: any) {
    return this.tyreEventsService.create(body);
  }

  @Patch('tyre-events/:id')
  @ApiOperation({ summary: 'Update tyre event' })
  async updateEvent(@Param('id') id: string, @Body() body: any) {
    return this.tyreEventsService.update(id, body);
  }

  @Delete('tyre-events/:id')
  @ApiOperation({ summary: 'Delete tyre event' })
  async removeEvent(@Param('id') id: string) {
    return this.tyreEventsService.remove(id);
  }
}
