import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users & RBAC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER')
  @ApiOperation({ summary: 'List users in organization' })
  async findAll(@CurrentUser() user: any) {
    const orgId = user.roles.includes('SUPER_ADMIN') ? undefined : user.organizationId;
    return this.usersService.findAll(orgId);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all RBAC roles with their permissions' })
  async getRoles() {
    return this.usersService.getRoles();
  }

  @Post('roles')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Create a new custom role with permissions' })
  async createRole(@Body() body: any, @CurrentUser() user: any) {
    return this.usersService.createRole(body, user.userId || user.id, user.organizationId);
  }

  @Patch('roles/:id')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Update a role and its permission matrix' })
  async updateRole(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.usersService.updateRole(id, body, user.userId || user.id, user.organizationId);
  }

  @Delete('roles/:id')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Delete a custom role' })
  async deleteRole(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.deleteRole(id, user.userId || user.id, user.organizationId);
  }

  @Post(':id/roles')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Assign multiple roles to a user' })
  async assignUserRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[], @CurrentUser() user: any) {
    return this.usersService.assignUserRoles(id, roleIds, user.userId || user.id, user.organizationId);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all granular system permissions' })
  async getPermissions() {
    return this.usersService.getPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Create user with role assignment' })
  async create(@Body() body: any, @CurrentUser() user: any) {
    return this.usersService.create(body, user.organizationId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Update user and role assignment' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'TMS_ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
