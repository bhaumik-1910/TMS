import { Body, Controller, Get, Put } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { ReqCtx } from '../auth/auth-user.js';
import { Ctx, RequirePermission } from '../auth/decorators.js';
import { PeriodLockService } from './period-lock.service.js';

export class SetPeriodLockDto {
  /** 0 or omitted: every branch. */
  @IsOptional()
  @IsInt()
  @Min(0)
  branchId?: number;

  /** `YYYY-MM-DD`, or null to clear the lock. */
  @IsOptional()
  @IsString()
  lockedUntil?: string | null;
}

/** The period lock page: what is locked now, and a way to move it. */
@Controller(['period-locks', 'api/period-locks', 'api/v1/period-locks'])
export class PeriodController {
  constructor(private readonly service: PeriodLockService) {}

  @Get()
  @RequirePermission('period', 'view')
  list(@Ctx() ctx: ReqCtx) {
    return this.service.list(ctx);
  }

  @Put()
  @RequirePermission('period', 'update')
  async set(@Ctx() ctx: ReqCtx, @Body() dto: SetPeriodLockDto) {
    await this.service.set(ctx, dto.branchId ?? 0, dto.lockedUntil ?? null);
    return this.service.list(ctx);
  }
}
