import { ConflictException, UnprocessableEntityException } from '@nestjs/common';

export type FieldErrors = Record<string, string[]>;

export interface Blocker {
  code: string;
  message: string;
  count?: number;
  refType?: string;
  rowId?: number | string;
}

/**
 * Collects every validation or business issue of one operation:
 * - field errors (attached to specific form inputs)
 * - blockers (hard stops, e.g. period locked, credit limit exceeded)
 * - warnings (can proceed with confirmation)
 */
export class Issues {
  readonly fields: FieldErrors = {};
  readonly blockers: Blocker[] = [];
  readonly warnings: Blocker[] = [];

  field(name: string, message: string): this {
    (this.fields[name] ??= []).push(message);
    return this;
  }

  block(code: string, message: string, extra: Partial<Blocker> = {}): this {
    this.blockers.push({ code, message, ...extra });
    return this;
  }

  warn(code: string, message: string, extra: Partial<Blocker> = {}): this {
    this.warnings.push({ code, message, ...extra });
    return this;
  }

  get failed(): boolean {
    return Object.keys(this.fields).length > 0 || this.blockers.length > 0;
  }

  /** Throws 422 if any field errors or blockers occurred */
  throwIfFailed(message?: string): void {
    if (!this.failed) return;
    const first = this.blockers[0]?.message ?? Object.values(this.fields)[0]?.[0];
    throw new UnprocessableEntityException({
      statusCode: 422,
      message: message ?? first ?? 'Validation failed',
      errors: this.fields,
      blockers: this.blockers,
    });
  }

  /** Throws 409 if warnings exist and confirmation was not provided */
  throwIfUnconfirmed(confirmed: boolean): void {
    if (confirmed || this.warnings.length === 0) return;
    throw new ConflictException({
      statusCode: 409,
      message: this.warnings[0]?.message ?? 'Please confirm action',
      warnings: this.warnings,
      needsConfirm: true,
    });
  }
}
