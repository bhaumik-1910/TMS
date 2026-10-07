import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { Ctx, RequirePermission } from '../../framework/auth/decorators.js';
import { ExceptionQueryDto } from './exceptions.dto.js';
import { ExceptionsService } from './exceptions.service.js';

@Controller(['exceptions', 'api/exceptions', 'api/v1/exceptions'])
export class ExceptionsController {
  constructor(private readonly exceptions: ExceptionsService) {}

  @Get()
  @RequirePermission('exception', 'view')
  list(@Ctx() ctx: ReqCtx, @Query() query: ExceptionQueryDto) {
    return this.exceptions.list(ctx, query);
  }

  @Post(':id/resolve')
  @RequirePermission('exception', 'resolve')
  resolve(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number) {
    return this.exceptions.resolve(ctx, id);
  }
}
