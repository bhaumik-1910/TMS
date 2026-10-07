import { limitReason, type LimitDef } from '../acl/limits.js';
import type { EffectivePermissions } from '../acl/acl.service.js';
import type { ScopeDef, ScopeEnv } from '../acl/scopes.js';
import type { ReqCtx } from '../auth/auth-user.js';
import type { TenantModel } from '../db/tenant.model.js';
import type { PeriodLocks } from '../period/period-locks.js';
import { periodDates, startStateReason } from './row-checks.js';
import type { ActionState, EntityAction } from './entity-action.js';

export interface ActionStateEnv<M extends TenantModel> {
  resource: string;
  actions: readonly EntityAction<M>[];
  /** CRUD limits, keyed `update` / `delete` / `create`. */
  limits: Partial<Record<string, readonly LimitDef<M>[]>>;
  periodField: string | null;
  scopes: Map<string, ScopeDef>;
  scopeEnv: ScopeEnv;
  model: { getAttributes(): Record<string, unknown> };
  actionPermission(action: EntityAction<M>): string;
}

/**
 * Whether each action (and edit/delete) can run on a loaded record right now: permission, scope,
 * start state, authority limit, period lock and the action's `available()`. Computed in memory
 * from data already loaded; check steps are not run, so the real call can still refuse.
 */
export function computeActionStates<M extends TenantModel>(
  env: ActionStateEnv<M>,
  ctx: ReqCtx,
  row: M,
  granted: EffectivePermissions,
  locks: PeriodLocks | null,
): Record<string, ActionState> {
  const out: Record<string, ActionState> = {};
  const decide = (name: string, code: string, extra: { action?: EntityAction<M>; limits?: readonly LimitDef<M>[] }): ActionState => {
    const grant = granted.get(code);
    if (!grant) return { allowed: false, reason: 'You do not have permission' };
    const own: ReqCtx = { ...ctx, scope: grant.scope, limits: grant.limits };
    const scope = env.scopes.get(grant.scope);
    if (!scope) return { allowed: false, reason: `Unknown access scope "${grant.scope}"` };
    if (scope.allows && !scope.allows(own, row as never, env.scopeEnv)) return { allowed: false, reason: 'Outside your access scope' };
    const { action } = extra;
    const state = action ? startStateReason(action, row) : null;
    if (state) return { allowed: false, reason: state };
    if (locks && env.periodField && !action?.ignoresPeriodLock && granted.get('period.unlock') === undefined) {
      const branch = (row.get('branchId') ?? null) as number | null;
      for (const date of periodDates(name === 'update' ? 'update' : name, row, null, env.periodField)) {
        const locked = locks.blocks(date, branch);
        if (locked) return { allowed: false, reason: locked };
      }
    }
    const limit = limitReason(own, row, extra.limits);
    if (limit) return { allowed: false, reason: limit };
    const unavailable = action?.available?.(row, own) ?? null;
    return unavailable ? { allowed: false, reason: unavailable } : { allowed: true, reason: null };
  };
  out.update = decide('update', `${env.resource}.update`, { limits: env.limits.update });
  out.delete = decide('delete', `${env.resource}.delete`, { limits: env.limits.delete });
  for (const action of env.actions) {
    out[action.name] = decide(action.name, env.actionPermission(action), { action, limits: action.limits ?? env.limits[action.name] });
  }
  return out;
}
