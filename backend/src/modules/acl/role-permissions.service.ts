import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type Transaction } from 'sequelize';
import { PermissionMeta } from '../../framework/acl/limits.js';
import { Permission } from '../../framework/acl/permission.model.js';
import { RolePermission } from '../../framework/acl/role-permission.model.js';
import { Role } from '../../framework/acl/role.model.js';
import type { AclScope, Limits } from '../../framework/auth/auth-user.js';
import { fieldErrors } from '../../framework/errors.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../../framework/options.js';
import { DEFAULT_ROLES, resolveGrants } from './registry/default-roles.js';

export interface PermissionGrant {
  code: string;
  scope: AclScope;
  limits?: Limits;
}

/** Writes a role's permission set and seeds the default roles for a new tenant. */
@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectModel(Role) private readonly roles: typeof Role,
    @InjectModel(Permission) private readonly permissions: typeof Permission,
    @InjectModel(RolePermission) private readonly rolePermissions: typeof RolePermission,
    private readonly meta: PermissionMeta,
    @Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions,
  ) {}

  /**
   * What is wrong with a set of grants: an unknown permission, a scope the resource does not offer,
   * a limit the permission does not declare or a negative number. Empty when all is well.
   */
  problems(grants: readonly PermissionGrant[]): string[] {
    const catalog = new Map(this.options.catalog.map((entry) => [entry.code, entry]));
    const out: string[] = [];
    for (const grant of grants) {
      const entry = catalog.get(grant.code);
      if (!entry) {
        out.push(`Unknown permission ${grant.code}`);
        continue;
      }
      if (!entry.scopes.includes(grant.scope)) out.push(`${grant.code}: scope "${grant.scope}" is not offered (${entry.scopes.join(', ')})`);
      const allowed = new Set([...entry.limits, ...this.meta.limits(grant.code)].map((limit) => limit.key));
      for (const [key, value] of Object.entries(grant.limits ?? {})) {
        if (!allowed.has(key)) out.push(`${grant.code}: "${key}" is not a limit of this permission`);
        else if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) out.push(`${grant.code}: limit "${key}" must be a number from 0`);
      }
    }
    return out;
  }

  private async idsByCode(codes: string[], t: Transaction): Promise<Map<string, number>> {
    const rows = await this.permissions.findAll({ where: { code: { [Op.in]: codes } }, attributes: ['id', 'code'], transaction: t });
    return new Map(rows.map((row) => [row.code, row.id as number]));
  }

  /** Bulk replace and bump `aclVersion`. Anything `problems()` reports is a 422. */
  async replace(role: Role, grants: PermissionGrant[], t: Transaction): Promise<void> {
    const problems = this.problems(grants);
    if (problems.length) throw fieldErrors({ permissions: problems });
    const ids = await this.idsByCode(grants.map((grant) => grant.code), t);
    const missing = grants.find((grant) => !ids.has(grant.code));
    if (missing) throw fieldErrors({ permissions: [`Unknown permission ${missing.code}`] });
    await this.rolePermissions.destroy({ where: { roleId: role.id }, transaction: t });
    await this.rolePermissions.bulkCreate(
      grants.map((grant) => ({
        companyId: role.companyId,
        roleId: role.id,
        permissionId: ids.get(grant.code),
        scope: grant.scope,
        limits: grant.limits ?? {},
      })),
      { transaction: t },
    );
    await role.increment('aclVersion', { transaction: t });
  }

  /** The nine prototype roles for a new company. Returns role id by code. */
  async seedDefaults(companyId: number, t: Transaction): Promise<Map<string, number>> {
    const out = new Map<string, number>();
    for (const def of DEFAULT_ROLES) {
      const role = await this.roles.create(
        { companyId, code: def.code, name: def.name, description: def.description, isSystem: def.isSystem ?? false } as never,
        { transaction: t },
      );
      const grants = [...resolveGrants(def)].map(([code, grant]) => ({ code, ...grant }));
      await this.replace(role, grants, t);
      out.set(def.code, role.id as number);
    }
    return out;
  }
}
