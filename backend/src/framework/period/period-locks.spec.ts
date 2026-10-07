import { describe, expect, it } from 'vitest';
import { dayOf, PeriodLocks } from './period-locks.js';

describe('period locks', () => {
  const locks = new PeriodLocks([
    { branchId: 0, lockedUntil: '2026-03-31' },
    { branchId: 5, lockedUntil: '2026-06-30' },
  ] as never);

  it('a company-wide lock covers every branch', () => {
    expect(locks.blocks('2026-03-31', 1)).toMatch(/up to 2026-03-31 is locked/);
    expect(locks.blocks('2026-04-01', 1)).toBeNull();
  });

  it('a branch lock adds to the company lock for that branch only; the later day wins', () => {
    expect(locks.blocks('2026-05-15', 5)).toMatch(/2026-06-30/);
    expect(locks.blocks('2026-05-15', 1)).toBeNull();
    expect(locks.lockedUntil(5)).toBe('2026-06-30');
  });

  it('a record without a date is never locked', () => {
    expect(locks.blocks(null, 5)).toBeNull();
    expect(new PeriodLocks([]).blocks('2000-01-01', 1)).toBeNull();
  });

  it('reads dates from strings and Date values', () => {
    expect(dayOf(new Date('2026-01-02T10:00:00Z'))).toBe('2026-01-02');
    expect(dayOf('2026-01-02T00:00:00.000Z')).toBe('2026-01-02');
    expect(dayOf('garbage')).toBeNull();
  });
});
