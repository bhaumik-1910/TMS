import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EntityEventModel } from '../../database/models/foundation/entity-event.model';

@Injectable()
export class EntityEventService {
  constructor(
    @InjectModel(EntityEventModel)
    private readonly eventModel: typeof EntityEventModel,
  ) {}

  /**
   * Records an audit event with before/after diffs or metadata
   */
  async record(
    organizationId: string | number,
    entityType: string,
    entityId: number,
    event: string,
    userId: number | null,
    data: Record<string, any> | null,
    tx?: Transaction,
  ): Promise<EntityEventModel> {
    return this.eventModel.create(
      {
        organizationId: String(organizationId),
        entityType,
        entityId,
        event,
        userId,
        data,
      },
      { transaction: tx },
    );
  }

  /**
   * Fetches the full audit history for a specific entity row
   */
  async getHistory(
    organizationId: string | number,
    entityType: string,
    entityId: number,
  ): Promise<EntityEventModel[]> {
    return this.eventModel.findAll({
      where: {
        organizationId: String(organizationId),
        entityType,
        entityId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Helper to compute diff between two objects
   */
  diff(before: Record<string, any>, after: Record<string, any>): Record<string, [any, any]> {
    const changes: Record<string, [any, any]> = {};
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of keys) {
      if (['createdAt', 'updatedAt', 'id'].includes(key)) continue;
      const bVal = before?.[key];
      const aVal = after?.[key];
      if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        changes[key] = [bVal, aVal];
      }
    }
    return changes;
  }
}
