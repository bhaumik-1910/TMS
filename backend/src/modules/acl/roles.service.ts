import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Includeable, Order } from 'sequelize';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { opsFolder } from '../../framework/crud/ops-loader.js';
import { TenantCrudService, type Attrs } from '../../framework/crud/tenant-crud.service.js';
import type { CreateRoleDto, UpdateRoleDto } from './dto/role.dto.js';
import { Permission } from '../../framework/acl/permission.model.js';
import { RolePermission } from '../../framework/acl/role-permission.model.js';
import { Role } from '../../framework/acl/role.model.js';
import { roleActions } from './roles.actions.js';

/** Role: configuration only. What each operation does is in `role-ops/<operation>/`, in file order. */
@Injectable()
export class RolesService extends TenantCrudService<Role, CreateRoleDto, UpdateRoleDto> {
  readonly resource = 'role';
  protected readonly opsDir = opsFolder(__filename, 'role-ops');
  protected readonly label = 'Role';
  protected readonly searchFields = ['name', 'code'];
  protected readonly sortable = ['name', 'code', 'description', 'status', 'createdAt'];
  protected readonly defaultOrder: Order = [['name', 'ASC']];
  protected readonly dependents = [{ table: 'users', column: 'role_id', label: 'users' }];
  protected readonly actions = roleActions;

  constructor(@InjectModel(Role) protected readonly model: typeof Role) {
    super();
  }

  protected detailInclude(): Includeable[] {
    return [{ model: RolePermission, include: [{ model: Permission, attributes: ['code'] }] }];
  }

  protected async toCreate(_ctx: ReqCtx, dto: CreateRoleDto): Promise<Attrs> {
    const { permissions: _permissions, ...values } = dto;
    return { ...values, code: values.code.toUpperCase() };
  }

  protected async toUpdate(_ctx: ReqCtx, dto: UpdateRoleDto): Promise<Attrs> {
    const { permissions: _permissions, ...values } = dto;
    if (values.code) values.code = values.code.toUpperCase();
    return values;
  }
}
