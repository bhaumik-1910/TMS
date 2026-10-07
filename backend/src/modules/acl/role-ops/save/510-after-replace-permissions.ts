import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import type { CreateRoleDto, UpdateRoleDto } from '../../dto/role.dto.js';
import { RolePermissionsService } from '../../role-permissions.service.js';
import type { Role } from '../../../../framework/acl/role.model.js';

type Dto = CreateRoleDto | UpdateRoleDto;

/** Saves the permission matrix sent with the role, when one was sent. */
@Injectable()
export default class ReplacePermissions implements Step<Role, object, Dto> {
  constructor(private readonly grants: RolePermissionsService) {}

  async after({ row, dto, t }: OpContext<Role, object, Dto>): Promise<void> {
    if (dto.permissions) await this.grants.replace(row, dto.permissions, t);
  }
}
