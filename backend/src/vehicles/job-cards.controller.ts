import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobCardsService } from './job-cards.service';

@ApiTags('Workshop Maintenance & Job Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/job-cards')
export class JobCardsController {
  constructor(private readonly jobCardsService: JobCardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all job cards' })
  async findAll(@Query() query: any) {
    return this.jobCardsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single job card' })
  async findOne(@Param('id') id: string) {
    return this.jobCardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new job card' })
  async create(@Body() body: any) {
    return this.jobCardsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job card' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.jobCardsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job card' })
  async remove(@Param('id') id: string) {
    return this.jobCardsService.remove(id);
  }
}
