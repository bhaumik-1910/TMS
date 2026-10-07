import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Includeable, Order } from 'sequelize';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { opsFolder } from '../../framework/crud/ops-loader.js';
import { TenantCrudService, type Attrs } from '../../framework/crud/tenant-crud.service.js';
import { Role } from '../../framework/acl/role.model.js';
import { Branch } from '../branches/branch.model.js';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';
import { User } from './user.model.js';
import { userActions } from './users.actions.js';

/** User: configuration only. What each operation does is in `ops/<operation>/`, in file order. */
@Injectable()
export class UsersService extends TenantCrudService<User, CreateUserDto, UpdateUserDto> {
  readonly resource = 'user';
  protected readonly opsDir = opsFolder(__filename);
  protected readonly label = 'User';
  protected readonly searchFields = ['name', 'email', 'code', 'phone'];
  protected readonly sortable = ['code', 'name', 'email', 'phone', 'status', 'userType', 'lastLoginAt', 'role.name', 'branch.name', 'createdAt'];
  protected readonly defaultOrder: Order = [['name', 'ASC']];
  protected readonly actions = userActions;

  constructor(@InjectModel(User) protected readonly model: typeof User) {
    super();
  }

  protected listInclude(): Includeable[] {
    return [
      { model: Role, attributes: ['id', 'name', 'code'] },
      { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
    ];
  }

  protected detailInclude(): Includeable[] {
    return [...this.listInclude(), { model: Branch, as: 'branches', attributes: ['id', 'name', 'code'], through: { attributes: [] } }];
  }

  protected async toCreate(_ctx: ReqCtx, dto: CreateUserDto): Promise<Attrs> {
    const { password: _password, branchIds: _branchIds, ...values } = dto;
    return { ...values, email: values.email.toLowerCase(), code: values.code.toUpperCase() };
  }

  protected async toUpdate(_ctx: ReqCtx, dto: UpdateUserDto): Promise<Attrs> {
    const { branchIds: _branchIds, ...values } = dto;
    if (values.code) values.code = values.code.toUpperCase();
    return values;
  }
}
