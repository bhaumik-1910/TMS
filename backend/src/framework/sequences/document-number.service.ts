import { Inject, Injectable } from '@nestjs/common';
import { QueryTypes, type Transaction } from 'sequelize';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from '../options.js';
import { sequelizeOf } from '../tenancy/guards.js';
import { PARTITION } from '../tenancy/partition.js';

/** Gap-free per tenant, per type, per year. One atomic upsert, safe across instances. */
@Injectable()
export class DocumentNumberService {
  constructor(@Inject(FRAMEWORK_OPTIONS) private readonly options: FrameworkOptions) {}

  /** `docType` is a key of `FrameworkOptions.sequences.prefixes` (`invoice` gives `INV/260001`). */
  async next(t: Transaction, companyId: number, docType: string, on: Date | string = new Date()): Promise<string> {
    const prefix = this.options.sequences.prefixes[docType];
    if (!prefix) throw new Error(`No number prefix for document type "${docType}". Add it to FrameworkOptions.sequences.prefixes.`);
    const date = typeof on === 'string' ? new Date(on) : on;
    const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
    const period = String(year).slice(-2);
    const column = PARTITION.column;
    const rows = await sequelizeOf(t).query<{ next_value: number }>(
      `INSERT INTO document_sequences (${column}, doc_type, period, next_value, created_at, updated_at)
       VALUES (:companyId, :docType, :period, 1, now(), now())
       ON CONFLICT (${column}, doc_type, period)
       DO UPDATE SET next_value = document_sequences.next_value + 1, updated_at = now()
       RETURNING next_value`,
      { replacements: { companyId, docType, period }, type: QueryTypes.SELECT, transaction: t },
    );
    const value = rows[0]?.next_value ?? 1;
    return `${prefix}/${period}${String(value).padStart(4, '0')}`;
  }
}
