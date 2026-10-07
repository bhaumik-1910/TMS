import { Body, Delete, ForbiddenException, Get, Inject, Param, ParseIntPipe, Patch, Post, Query, type Type } from '@nestjs/common';
import { AclService, type Grant } from '../acl/acl.service.js';
import type { ReqCtx } from '../auth/auth-user.js';
import { Ctx, RequirePermission } from '../auth/decorators.js';
import { ListQueryDto } from './list-query.dto.js';

export interface CrudRoutes<S> {
  service: S;
  list(ctx: ReqCtx, query: ListQueryDto): Promise<unknown>;
  get(ctx: ReqCtx, id: number, actions?: string, deleted?: string): Promise<unknown>;
  create(ctx: ReqCtx, dto: object, confirm?: string): Promise<unknown>;
  update(ctx: ReqCtx, id: number, dto: object, confirm?: string): Promise<unknown>;
  remove(ctx: ReqCtx, id: number, confirm?: string): Promise<unknown>;
  actions(ctx: ReqCtx): Promise<unknown>;
  history(ctx: ReqCtx, id: number): Promise<unknown>;
  view(ctx: ReqCtx, id: number, name: string): Promise<unknown>;
  actAll(ctx: ReqCtx, name: string, body: Record<string, unknown>): Promise<unknown>;
  act(ctx: ReqCtx, id: number, name: string, input: Record<string, unknown>): Promise<unknown>;
}

interface CrudOptions<S> {
  /** Permission resource, such as `vehicle`. */
  resource: string;
  service: Type<S>;
  create: Type<object>;
  update: Type<object>;
  /** Query DTO with module filters; defaults to the plain list query. */
  query?: Type<ListQueryDto>;
}

/**
 * The five standard routes of a tenant collection, guarded by `resource.view|create|update|delete`.
 * Extend the returned class under `@Controller('path')` and add module routes beside them.
 */
export function crudController<S extends object>(
  options: CrudOptions<S>,
): Type<CrudRoutes<S>> {
  const { resource } = options;

  abstract class CrudBase {
    @Inject(options.service) readonly service: S;
    @Inject(AclService) readonly acl: AclService;

    /** Named actions this caller may run (`activate`, `deactivate`, ...), with their allowed-from state. */
    @Get('actions')
    @RequirePermission(resource, 'view')
    async actions(@Ctx() ctx: ReqCtx) {
      const granted = await this.acl.effective(ctx.user);
      return (this.service as AnyService).describeActions().filter((action) => granted.has(action.permission));
    }

    /** Run one named action. Needs its own permission, checked here against the caller's scope. */
    @Post(':id/actions/:name')
    @RequirePermission(resource, 'view')
    async act(
      @Ctx() ctx: ReqCtx,
      @Param('id', ParseIntPipe) id: number,
      @Param('name') name: string,
      @Body() input: Record<string, unknown>,
    ) {
      const service = this.service as AnyService;
      const grant = await this.grantOf(ctx, service.actionPermission(service.actionDef(name)));
      return service.perform({ ...ctx, ...grant }, id, name, input ?? {});
    }

    /** The scope and limits the caller holds for `code`, or 403. */
    protected async grantOf(ctx: ReqCtx, code: string): Promise<Grant> {
      const grant = (await this.acl.effective(ctx.user)).get(code);
      if (!grant) throw new ForbiddenException(`You do not have permission: ${code}`);
      return grant;
    }

    /** A named read of one record: print data, usage summary... Defined by `ops/view-<name>/`. */
    @Get(':id/views/:name')
    @RequirePermission(resource, 'view')
    view(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number, @Param('name') name: string) {
      return (this.service as AnyService).view(ctx, id, name);
    }

    /** A `bulk` action on `{ ids }` or a `collection` action (import, recalculation). */
    @Post('actions/:name')
    @RequirePermission(resource, 'view')
    async actAll(@Ctx() ctx: ReqCtx, @Param('name') name: string, @Body() body: Record<string, unknown>) {
      const service = this.service as AnyService;
      const grant = await this.grantOf(ctx, service.actionPermission(service.actionDef(name)));
      return service.performAction({ ...ctx, ...grant }, name, body ?? {});
    }

    @Get()
    @RequirePermission(resource, 'view')
    list(@Ctx() ctx: ReqCtx, @Query() query: ListQueryDto) {
      return (this.service as AnyService).list(ctx, query);
    }

    /** Everything that happened to one row: created, edited (which fields), actions, by whom. */
    @Get(':id/history')
    @RequirePermission(resource, 'view')
    history(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number) {
      return (this.service as AnyService).history(ctx, id);
    }

    @Get(':id')
    @RequirePermission(resource, 'view')
    get(
      @Ctx() ctx: ReqCtx,
      @Param('id', ParseIntPipe) id: number,
      @Query('actions') actions?: string,
      @Query('deleted') deleted?: string,
    ) {
      return (this.service as AnyService).get(ctx, id, undefined, { actions: actions === '1', deleted: deleted === '1' });
    }

    @Post()
    @RequirePermission(resource, 'create')
    create(@Ctx() ctx: ReqCtx, @Body() dto: object, @Query('confirm') confirm?: string) {
      return (this.service as AnyService).create(ctx, dto, undefined, confirm === 'true');
    }

    @Patch(':id')
    @RequirePermission(resource, 'update')
    update(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number, @Body() dto: object, @Query('confirm') confirm?: string) {
      return (this.service as AnyService).update(ctx, id, dto, undefined, confirm === 'true');
    }

    @Delete(':id')
    @RequirePermission(resource, 'delete')
    remove(@Ctx() ctx: ReqCtx, @Param('id', ParseIntPipe) id: number, @Query('confirm') confirm?: string) {
      return (this.service as AnyService).remove(ctx, id, undefined, confirm === 'true');
    }
  }

  // The DTO classes differ per module, so the validation pipe is told them here.
  const proto = CrudBase.prototype;
  Reflect.defineMetadata('design:paramtypes', [Object, options.query ?? ListQueryDto], proto, 'list');
  Reflect.defineMetadata('design:paramtypes', [Object, options.create, String], proto, 'create');
  Reflect.defineMetadata('design:paramtypes', [Object, Number, String, Object], proto, 'act');
  Reflect.defineMetadata('design:paramtypes', [Object, Number], proto, 'history');
  Reflect.defineMetadata('design:paramtypes', [Object, Number, String, String], proto, 'get');
  Reflect.defineMetadata('design:paramtypes', [Object, Number, String], proto, 'view');
  Reflect.defineMetadata('design:paramtypes', [Object, String, Object], proto, 'actAll');
  Reflect.defineMetadata('design:paramtypes', [Object, Number, options.update, String], proto, 'update');

  return CrudBase as unknown as Type<CrudRoutes<S>>;
}

interface AnyService {
  list(ctx: ReqCtx, query: ListQueryDto): Promise<unknown>;
  get(ctx: ReqCtx, id: number, t?: undefined, options?: { actions?: boolean; deleted?: boolean }): Promise<unknown>;
  create(ctx: ReqCtx, dto: object, t?: undefined, confirmed?: boolean): Promise<unknown>;
  update(ctx: ReqCtx, id: number, dto: object, t?: undefined, confirmed?: boolean): Promise<unknown>;
  remove(ctx: ReqCtx, id: number, t?: undefined, confirmed?: boolean): Promise<unknown>;
  history(ctx: ReqCtx, id: number): Promise<unknown>;
  describeActions(): Array<{ permission: string }>;
  actionDef(name: string): unknown;
  actionPermission(action: unknown): string;
  perform(ctx: ReqCtx, id: number, name: string, input: Record<string, unknown>): Promise<unknown>;
  performAction(ctx: ReqCtx, name: string, body: Record<string, unknown>): Promise<unknown>;
  view(ctx: ReqCtx, id: number, name: string): Promise<unknown>;
}
