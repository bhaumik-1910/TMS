import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import type { Role } from '../../../../framework/acl/role.model.js';
import type { CreateRoleDto, UpdateRoleDto } from '../../dto/role.dto.js';
import { RolePermissionsService } from '../../role-permissions.service.js';

/** Scopes must be ones the permission's resource offers, and limits ones the permission declares. */
@Injectable()
export default class CheckGrants implements Step<Role, object, CreateRoleDto | UpdateRoleDto> {
  constructor(private readonly grants: RolePermissionsService) {}

  async check({ dto, issues }: OpContext<Role, object, CreateRoleDto | UpdateRoleDto>): Promise<void> {
    if (!dto.permissions) return;
    for (const problem of this.grants.problems(dto.permissions)) issues.field('permissions', problem);
  }
}
