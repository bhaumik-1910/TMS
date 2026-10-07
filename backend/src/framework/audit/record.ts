import type { Transaction } from 'sequelize';
import type { ReqCtx } from '../auth/auth-user.js';
import { EntityEvent } from './entity-event.model.js';

/** One audit row, in the same transaction as the change it describes. Listed by `GET /<resource>/:id/history`. */
export async function recordEvent(
  t: Transaction,
  ctx: ReqCtx,
  entityType: string,
  entityId: number,
  event: string,
  data: Record<string, unknown> | null,
): Promise<void> {
  await EntityEvent.create(
    { companyId: ctx.user.companyId, entityType, entityId, event, userId: ctx.user.id, data } as never,
    { transaction: t },
  );
}
