import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List routes with stops and distances' })
  async findAll(@CurrentUser('organizationId') orgId: string) {
    return this.routesService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route details and stops' })
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new route with stops' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.routesService.create(orgId, body);
  }
}
