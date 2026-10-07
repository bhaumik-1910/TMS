import { Body, Controller, Get, Put } from '@nestjs/common';
import { IsObject } from 'class-validator';
import type { ReqCtx } from '../auth/auth-user.js';
import { Ctx, RequirePermission } from '../auth/decorators.js';
import { SettingsService } from './settings.service.js';

export class SaveSettingsDto {
  @IsObject()
  values: Record<string, unknown>;
}

/** The settings page: definitions to build the form from, and the current values. */
@Controller(['settings', 'api/settings', 'api/v1/settings'])
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @RequirePermission('settings', 'view')
  async get(@Ctx() ctx: ReqCtx) {
    return { definitions: this.service.definitions(), values: await this.service.all(ctx.user.companyId) };
  }

  @Put()
  @RequirePermission('settings', 'update')
  async save(@Ctx() ctx: ReqCtx, @Body() dto: SaveSettingsDto) {
    return { definitions: this.service.definitions(), values: await this.service.set(ctx, dto.values) };
  }
}
