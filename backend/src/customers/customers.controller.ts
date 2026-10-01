import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  async findAll(@CurrentUser('organizationId') orgId: string, @Query('search') search?: string) {
    return this.customersService.findAll(orgId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.customersService.create(orgId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.customersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
