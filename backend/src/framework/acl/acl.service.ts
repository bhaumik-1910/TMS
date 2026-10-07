import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import type { AclScope, AuthUser, Limits } from '../auth/auth-user.js';
import { TenantDb } from '../tenancy/tenant-db.js';

/** What one permission is granted with: how far it reaches and what authority limits apply. */
export interface Grant {
  scope: AclScope;
  limits: Limits;
}

export type EffectivePermissions = Map<string, Grant>;

const TTL_MS = 60_000;
const MAX_ENTRIES = 5_000;

/**
 * Role permissions plus per-user grants and denies. Cached in process for a minute, keyed by
 * company, user, role and the role's ACL version, so editing a role takes effect on the next
 * refresh. Two companies never share a cache entry even when a user id repeats.
 */
@Injectable()
export class AclService {
  private readonly cache = new Map<string, { at: number; value: EffectivePermissions }>();

  constructor(private readonly db: TenantDb) {}

  private key(companyId: number, userId: number, roleId: number | null, version: number): string {
    return `${companyId}:${userId}:${roleId ?? 0}:${version}`;
  }

  async effective(user: AuthUser): Promise<EffectivePermissions> {
    const key = this.key(user.companyId, user.id, user.roleId, user.aclVersion);
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
    const value = await this.load(user.companyId, user.id, user.roleId);
    if (this.cache.size >= MAX_ENTRIES) this.cache.clear();
    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  /** Drop cached sets for one user of one company (after override edits). */
  forgetUser(companyId: number, userId: number): void {
    const prefix = `${companyId}:${userId}:`;
    for (const key of this.cache.keys()) if (key.startsWith(prefix)) this.cache.delete(key);
  }

  /** Drop everything cached for a company (after a move or a bulk change). */
  forgetCompany(companyId: number): void {
    const prefix = `${companyId}:`;
    for (const key of this.cache.keys()) if (key.startsWith(prefix)) this.cache.delete(key);
  }

  async load(companyId: number, userId: number, roleId: number | null, t?: Transaction): Promise<EffectivePermissions> {
    const out: EffectivePermissions = new Map();
    if (roleId) {
      const rows = await this.db.query<{ code: string; scope: AclScope; limits: Limits | null }>(
        `SELECT p.code, rp.scope, rp.limits FROM role_permissions rp
         JOIN roles r ON r.id = rp.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = :roleId AND rp.company_id = :companyId AND r.status = 'active'`,
        { replacements: { roleId, companyId }, transaction: t },
      );
      for (const row of rows) out.set(row.code, { scope: row.scope, limits: row.limits ?? {} });
    }
    const overrides = await this.db.query<{ code: string; effect: 'grant' | 'deny'; scope: AclScope; limits: Limits | null }>(
      `SELECT p.code, o.effect, o.scope, o.limits FROM user_permission_overrides o
       JOIN permissions p ON p.id = o.permission_id
       WHERE o.user_id = :userId AND o.company_id = :companyId`,
      { replacements: { userId, companyId }, transaction: t },
    );
    for (const row of overrides) {
      if (row.effect === 'deny') out.delete(row.code);
      else out.set(row.code, { scope: row.scope, limits: row.limits ?? {} });
    }
    return out;
  }
}
