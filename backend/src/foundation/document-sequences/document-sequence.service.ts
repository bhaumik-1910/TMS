import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';
import { DocumentSequenceModel } from '../../database/models/foundation/document-sequence.model';

export const DEFAULT_PREFIXES: Record<string, string> = {
  lr: 'LR',
  trip: 'TRIP',
  invoice: 'INV',
  purchase_bill: 'PB',
  settlement: 'STL',
  fuel: 'FUEL',
  advance: 'ADV',
  order: 'ORD',
  dispatch: 'DSP',
};

@Injectable()
export class DocumentSequenceService {
  constructor(
    @InjectModel(DocumentSequenceModel)
    private readonly sequenceModel: typeof DocumentSequenceModel,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Generates the current financial year string, e.g. "24-25" or "26"
   */
  getPeriod(on: Date | string = new Date()): string {
    const d = typeof on === 'string' ? new Date(on) : on;
    const year = Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    // Indian Financial Year: April 1 to March 31
    if (month >= 4) {
      const nextYear = (year + 1) % 100;
      return `${String(year).slice(-2)}-${String(nextYear).padStart(2, '0')}`;
    } else {
      const prevYear = (year - 1) % 100;
      return `${String(prevYear).padStart(2, '0')}-${String(year).slice(-2)}`;
    }
  }

  /**
   * Atomically gets the next sequence number and increments the counter
   * E.g. nextNumber(1, 'lr') => 'LR/24-25/0001'
   */
  async next(
    organizationId: string | number,
    docType: string,
    on: Date | string = new Date(),
    tx?: Transaction,
  ): Promise<string> {
    const normalizedType = docType.toLowerCase();
    const prefix = DEFAULT_PREFIXES[normalizedType] || normalizedType.toUpperCase();
    const period = this.getPeriod(on);

    const query = `
      INSERT INTO document_sequences (organization_id, doc_type, period, prefix, next_value, created_at, updated_at)
      VALUES (:organizationId, :docType, :period, :prefix, 1, NOW(), NOW())
      ON CONFLICT (organization_id, doc_type, period)
      DO UPDATE SET next_value = document_sequences.next_value + 1, updated_at = NOW()
      RETURNING next_value;
    `;

    const rows = await this.sequelize.query<{ next_value: number }>(query, {
      replacements: {
        organizationId: String(organizationId),
        docType: normalizedType,
        period,
        prefix,
      },
      type: QueryTypes.SELECT,
      transaction: tx,
    });

    const val = rows[0]?.next_value ?? 1;
    return `${prefix}/${period}/${String(val).padStart(4, '0')}`;
  }

  /**
   * Lists all registered sequences for an organization
   */
  async list(organizationId: string | number): Promise<DocumentSequenceModel[]> {
    return this.sequenceModel.findAll({
      where: { organizationId: String(organizationId) },
      order: [['docType', 'ASC']],
    });
  }
}
