import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type Order, type Transaction, type WhereOptions } from 'sequelize';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { TenantCrudService } from '../../framework/crud/tenant-crud.service.js';
import { ExceptionRecord, type ExceptionType, type Severity } from './exception.model.js';
import type { CreateExceptionDto, ExceptionQueryDto } from './exceptions.dto.js';

export interface RaiseException {
  companyId: number;
  branchId?: number | null;
  type: ExceptionType;
  severity?: Severity;
  title: string;
  detail?: string | null;
  refType: string;
  refId: number;
  userId?: number | null;
}

@Injectable()
export class ExceptionsService extends TenantCrudService<ExceptionRecord, CreateExceptionDto, Partial<CreateExceptionDto>, ExceptionQueryDto> {
  protected readonly searchFields = ['title', 'detail'];
  protected readonly sortable = ['occurredOn', 'severity', 'type', 'title', 'createdAt'];
  protected readonly defaultOrder: Order = [['occurredOn', 'DESC'], ['id', 'DESC']];
  protected readonly label = 'Exception';

  constructor(@InjectModel(ExceptionRecord) protected readonly model: typeof ExceptionRecord) {
    super();
  }

  protected filters(query: ExceptionQueryDto): WhereOptions[] {
    const out: WhereOptions[] = [];
    if (query.type) out.push({ type: query.type });
    if (query.severity) out.push({ severity: query.severity });
    if (query.open === 'true') out.push({ resolvedAt: null });
    if (query.open === 'false') out.push({ resolvedAt: { [Op.ne]: null } });
    return out;
  }

  /** Records a problem once per cause: an unresolved row for the same ref and type is not repeated. */
  async raise(input: RaiseException, t: Transaction): Promise<void> {
    const open = await this.model.count({
      where: { companyId: input.companyId, type: input.type, refType: input.refType, refId: input.refId, resolvedAt: null },
      transaction: t,
    });
    if (open) return;
    await this.model.create(
      {
        companyId: input.companyId,
        branchId: input.branchId ?? null,
        type: input.type,
        severity: input.severity ?? 'medium',
        title: input.title,
        detail: input.detail ?? null,
        refType: input.refType,
        refId: input.refId,
        occurredOn: new Date().toISOString().slice(0, 10),
        createdById: input.userId ?? null,
      },
      { transaction: t },
    );
  }

  /** Clears open rows when their cause is fixed. */
  async clear(companyId: number, type: ExceptionType, refType: string, refId: number, t: Transaction): Promise<void> {
    await this.model.update(
      { resolvedAt: new Date() },
      { where: { companyId, type, refType, refId, resolvedAt: null }, transaction: t },
    );
  }

  async resolve(ctx: ReqCtx, id: number): Promise<ExceptionRecord> {
    const row = await this.findOne(ctx, id);
    await row.update({ resolvedAt: new Date(), resolvedById: ctx.user.id, updatedById: ctx.user.id });
    return this.get(ctx, id);
  }
}
