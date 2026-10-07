import { describe, expect, it } from 'vitest';
import type { EffectivePermissions } from '../acl/acl.service.js';
import type { LimitDef } from '../acl/limits.js';
import { allScope, branchScope, type ScopeDef } from '../acl/scopes.js';
import type { ReqCtx } from '../auth/auth-user.js';
import { PeriodLocks } from '../period/period-locks.js';
import { computeActionStates, type ActionStateEnv } from './action-states.js';
import type { EntityAction } from './entity-action.js';

const ctx: ReqCtx = { scope: 'all', limits: {}, user: { id: 1, platformUserId: 1, companyId: 1, epoch: 1, branchId: 2, branchIds: [2], roleId: 1, aclVersion: 0, partyId: null, name: 'T' } };
const row = (values: Record<string, unknown>) => ({ get: (key: string) => values[key] }) as never;
const amount: LimitDef<never> = { key: 'amount', label: 'Up to amount', type: 'money', value: (r: { get(k: string): number }) => r.get('total') } as never;

const approve: EntityAction = { name: 'approve', label: 'Approve', from: { status: ['draft'] }, limits: [amount] };
const reopen: EntityAction = { name: 'reopen', label: 'Reopen', ignoresPeriodLock: true };
const restricted: EntityAction = { name: 'close', label: 'Close', available: (r) => (r.get('hasOpenItems') ? 'Open items remain' : null) };

const env: ActionStateEnv<never> = {
  resource: 'invoice',
  actions: [approve, reopen, restricted] as never,
  limits: {},
  periodField: 'invoiceDate',
  scopes: new Map<string, ScopeDef>([['all', allScope], ['branch', branchScope]]),
  scopeEnv: { partyFields: [] },
  model: { getAttributes: () => ({}) },
  actionPermission: (action) => `invoice.${action.permission ?? action.name}`,
};
const grants = (entries: Record<string, { scope: string; limits?: Record<string, number> }>): EffectivePermissions =>
  new Map(Object.entries(entries).map(([code, g]) => [code, { scope: g.scope, limits: g.limits ?? {} }]));

describe('_actions: what each button can do on this row', () => {
  const full = grants({ 'invoice.update': { scope: 'all' }, 'invoice.delete': { scope: 'all' }, 'invoice.approve': { scope: 'all', limits: { amount: 1000 } }, 'invoice.reopen': { scope: 'all' }, 'invoice.close': { scope: 'all' } });

  it('is allowed when permission, state and limit all pass', () => {
    const states = computeActionStates(env, ctx, row({ status: 'draft', total: 500, branchId: 2 }), full, null);
    expect(states.approve).toEqual({ allowed: true, reason: null });
    expect(states.update?.allowed).toBe(true);
  });

  it('gives the reason: no permission, wrong state, over limit, outside scope, unavailable', () => {
    expect(computeActionStates(env, ctx, row({ status: 'draft', total: 500 }), grants({}), null).approve).toEqual({ allowed: false, reason: 'You do not have permission' });
    expect(computeActionStates(env, ctx, row({ status: 'paid', total: 500 }), full, null).approve?.reason).toContain('not possible while status is "paid"');
    expect(computeActionStates(env, ctx, row({ status: 'draft', total: 5000 }), full, null).approve?.reason).toBe('Above your limit of 1,000');
    const branchOnly = grants({ 'invoice.update': { scope: 'branch' } });
    expect(computeActionStates(env, ctx, row({ branchId: 9 }), branchOnly, null).update?.reason).toBe('Outside your access scope');
    expect(computeActionStates(env, ctx, row({ hasOpenItems: true }), full, null).close?.reason).toBe('Open items remain');
  });

  it('a locked period blocks edits, but not an action that ignores it, nor a caller with period.unlock', () => {
    const locks = new PeriodLocks([{ branchId: 0, lockedUntil: '2026-03-31' }] as never);
    const old = row({ invoiceDate: '2026-02-01', status: 'draft', total: 1 });
    const states = computeActionStates(env, ctx, old, full, locks);
    expect(states.update?.reason).toMatch(/locked/);
    expect(states.reopen?.allowed).toBe(true);
    const unlocker = new Map([...full, ['period.unlock', { scope: 'all', limits: {} }]]);
    expect(computeActionStates(env, ctx, old, unlocker, locks).update?.allowed).toBe(true);
  });
});
