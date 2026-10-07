import { describe, expect, it } from 'vitest';
import { fakeOpContext, runSteps, type AnyStep, type FakeOpOptions } from '../../../../framework/crud/testing/op-test.js';
import type { DeactivateState } from './_state.js';
import assessOpenWork from './010-check-assess-open-work.js';
import enforceRules from './020-check-enforce-rules.js';
import callerWorksHere from './030-check-caller-works-here.js';
import savepointDemo from './450-before-savepoint-demo.js';
import logSummary from './600-after-log-summary.js';

const checks: AnyStep[] = [assessOpenWork, enforceRules, callerWorksHere] as AnyStep[];
const branch = (extra: Record<string, unknown> = {}) => ({ id: 7, name: 'Surat', status: 'active', isHeadOffice: false, ...extra });
const make = (row: Record<string, unknown>, options: FakeOpOptions<DeactivateState, object> = {}) =>
  fakeOpContext<Record<string, unknown>, DeactivateState, object>({ row, ...options });

describe('branch deactivate steps', () => {
  it('blocks the head office and active users together, from facts step 010 left in state', async () => {
    const c = make(branch({ isHeadOffice: true }), { counts: 3 });
    await runSteps(checks, c);
    expect(c.state).toMatchObject({ isHeadOffice: true, activeUsers: 3, statusBefore: 'active', deactivatedBy: 'Tester' });
    expect(c.issues.blockers.map((b) => b.code)).toEqual(['head_office', 'active_users']);
  });

  it('lets an empty ordinary branch through', async () => {
    const c = make(branch());
    await runSteps(checks, c);
    expect(c.issues.failed).toBe(false);
    expect(c.issues.warnings).toHaveLength(0);
  });

  it('warns, without blocking, only when the caller has access to the branch (step 030 `when`)', async () => {
    const away = make(branch(), { user: { branchIds: [1] } });
    await runSteps(checks, away);
    expect(away.issues.warnings).toHaveLength(0);

    const here = make(branch(), { user: { branchIds: [1, 7] } });
    await runSteps(checks, here);
    expect(here.issues.warnings.map((w) => w.code)).toEqual(['own_branch']);
    expect(here.issues.failed).toBe(false);
  });

  it('keeps going when the optional query fails inside its savepoint', async () => {
    const c = make(branch());
    c.sql = () => Promise.reject(new Error('relation "branch_optional_stats" does not exist'));
    await runSteps([savepointDemo] as AnyStep[], c, ['before']);
    expect(c.savepoints).toBe(1);
    expect(c.state.statsSkipped).toBe(true);
  });

  it('logs only after the commit', async () => {
    const c = make(branch({ status: 'inactive' }), { state: { statusBefore: 'active', deactivatedBy: 'Tester' } });
    await runSteps([logSummary] as AnyStep[], c, ['after']);
    expect(c.afterCommits).toHaveLength(1);
    await c.commit();
    expect(c.afterCommits).toHaveLength(0);
  });
});
