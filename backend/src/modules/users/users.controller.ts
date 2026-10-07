import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { Ctx, RequirePermission } from '../../framework/auth/decorators.js';
import { crudController } from '../../framework/crud/crud-controller.js';
import { CreateUserDto, ReplaceOverridesDto, UpdateUserDto } from './dto/user.dto.js';
import { UserOverridesService } from './user-overrides.service.js';
import { UsersService } from './users.service.js';

@Controller(['users', 'api/users'])
export class UsersController extends crudController({
  resource: 'user',
  service: UsersService,
  create: CreateUserDto,
  update: UpdateUserDto,
}) {
  constructor(private readonly overrides: UserOverridesService) {
    super();
  }

  @Get(':id/overrides')
  @RequirePermission('user', 'view')
  listOverrides(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number) {
    return this.overrides.list(ctx, id);
  }

  @Put(':id/overrides')
  @RequirePermission('role', 'update')
  replaceOverrides(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceOverridesDto) {
    return this.overrides.replace(ctx, id, dto.items);
  }
}
