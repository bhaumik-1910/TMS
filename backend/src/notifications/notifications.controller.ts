import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user/organization' })
  async findAll(@CurrentUser() user: any) {
    const list = await this.notificationsService.findAll(user?.organizationId, user?.userId || user?.id);
    return { success: true, data: list };
  }

  @Post()
  @ApiOperation({ summary: 'Create manual/test alert notification' })
  async create(@CurrentUser('organizationId') orgId: string, @Body() body: any) {
    return this.notificationsService.create({
      ...body,
      organizationId: body.organizationId || orgId,
    });
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('organizationId') orgId: string) {
    return this.notificationsService.markAllAsRead(orgId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete('clear-read')
  @ApiOperation({ summary: 'Clear all read notifications' })
  async clearRead(@CurrentUser('organizationId') orgId: string) {
    return this.notificationsService.clearRead(orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single notification' })
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
