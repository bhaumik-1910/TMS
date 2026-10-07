import type { PeriodLock } from './period-lock.model.js';

/** `YYYY-MM-DD` of a date column value (string, Date or unset). */
export function dayOf(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  const text = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

/** The locks of one company, loaded once, then asked about any number of records in memory. */
export class PeriodLocks {
  private readonly all: string | null;
  private readonly byBranch = new Map<number, string>();

  constructor(rows: Array<Pick<PeriodLock, 'branchId' | 'lockedUntil'>>) {
    let all: string | null = null;
    for (const row of rows) {
      const day = dayOf(row.lockedUntil);
      if (!day) continue;
      if (row.branchId === 0) all = day;
      else this.byBranch.set(row.branchId, day);
    }
    this.all = all;
  }

  /** The latest locked day that applies to a record of `branchId`, or null. */
  lockedUntil(branchId: number | null | undefined): string | null {
    const branch = branchId ? this.byBranch.get(branchId) ?? null : null;
    if (this.all && branch) return this.all > branch ? this.all : branch;
    return this.all ?? branch;
  }

  /** The reason a record dated `date` of `branchId` is locked, or null when it is open. */
  blocks(date: unknown, branchId: number | null | undefined): string | null {
    const day = dayOf(date);
    const until = this.lockedUntil(branchId);
    if (!day || !until || day > until) return null;
    return `The period up to ${until} is locked`;
  }
}
