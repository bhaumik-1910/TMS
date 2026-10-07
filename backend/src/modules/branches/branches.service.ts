import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Order } from 'sequelize';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { opsFolder } from '../../framework/crud/ops-loader.js';
import { TenantCrudService, type Attrs } from '../../framework/crud/tenant-crud.service.js';
import { branchActions } from './branches.actions.js';
import { Branch } from './branch.model.js';
import type { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

/** Branch: configuration only. What each operation does is in `ops/<operation>/`, in file order. */
@Injectable()
export class BranchesService extends TenantCrudService<Branch, CreateBranchDto, UpdateBranchDto> {
  readonly resource = 'branch';
  protected readonly opsDir = opsFolder(__filename);
  protected readonly label = 'Branch';
  protected readonly searchFields = ['name', 'code', 'city'];
  protected readonly sortable = ['name', 'code', 'city', 'stateCode', 'status'];
  protected readonly defaultOrder: Order = [['name', 'ASC']];
  protected readonly dependents = [{ table: 'users', column: 'branch_id', label: 'users (home branch)' }];
  protected readonly actions = branchActions;
  /** A branch has no "own" rows; a role can instead be limited to live branches (scope registered in `config/framework.options.ts`). */
  protected readonly scopes = ['all', 'branch', 'active-only'];

  constructor(@InjectModel(Branch) protected readonly model: typeof Branch) {
    super();
  }

  protected async toCreate(_ctx: ReqCtx, dto: CreateBranchDto): Promise<Attrs> {
    return { ...dto, code: dto.code.toUpperCase() };
  }

  protected async toUpdate(_ctx: ReqCtx, dto: UpdateBranchDto): Promise<Attrs> {
    return { ...dto, ...(dto.code ? { code: dto.code.toUpperCase() } : {}) };
  }
}
