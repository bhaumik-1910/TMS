import type { AuthUser } from './auth/auth-user.js';
import type { PermissionEntry } from './acl/catalog-types.js';
import type { ScopeDef } from './acl/scopes.js';
import type { SettingDef } from './settings/settings.js';
import type { TenantRef } from './tenancy/context.js';
import type { PartitionConfig } from './tenancy/partition.js';

export const FRAMEWORK_OPTIONS = Symbol('FRAMEWORK_OPTIONS');

export type PlacementStrategy =
  /** Every tenant at one fixed place. */
  | { strategy: 'single'; dbKey?: string; schema: string }
  /** Schema `${prefix}${companyId}` on one database. */
  | { strategy: 'schemaPerTenant'; dbKey?: string; prefix: string }
  /** Looked up in the control plane's `tenant_routing` (cached). */
  | { strategy: 'routed'; cacheMs?: number };

/** Everything the framework needs from the app. */
export interface FrameworkOptions {
  /** Every permission: resource, action, label, group, and the scopes the resource offers. */
  catalog: readonly PermissionEntry[];
  /** Scope providers beyond the built-in `all`, `branch` and `own`. */
  scopes?: ScopeDef[];
  /** Typed company settings. */
  settings?: SettingDef[];
  tenancy: {
    /** Defaults to `companyId` / `company_id` / `companies`. Must be set before models are imported. */
    partition?: Partial<PartitionConfig>;
    /** The tenant of a signed-in user. Defaults to `{ companyId: user.companyId }`. */
    resolve?: (user: AuthUser) => TenantRef;
    placement: PlacementStrategy;
    /** Schema used when a shard has no routing row of its own. */
    sharedSchema?: string;
  };
  auth: {
    /** Maps verified access-token claims to the signed-in user. */
    userClaims: (claims: Record<string, unknown>) => AuthUser;
  };
  sequences: {
    /** Document type to number prefix: `{ invoice: 'INV' }`. */
    prefixes: Record<string, string>;
  };
  /** Encrypts shard connection URIs stored in the control plane. */
  secretKey: string;
  /** `alter` syncs the platform and every routed tenant schema at boot. */
  dbSync?: 'none' | 'alter';
  /** A separate database for the control plane. Unset: the primary connection, schema `platform`. */
  controlDbUri?: string;
  /** Pool sizes of non-primary shards. */
  shardPool?: { cloud?: number; onprem?: number };
}
