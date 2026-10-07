import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { MembershipService } from '../../../platform/memberships.service.js';
import type { User } from '../../user.model.js';

/** A deactivated user must not keep working on an old refresh token (they live in the control plane). */
@Injectable()
export default class RevokeSignIns implements Step<User> {
  constructor(private readonly memberships: MembershipService) {}

  async after({ row, user, afterCommit }: OpContext<User>): Promise<void> {
    afterCommit(() => this.memberships.revokeSessions(user.companyId, row.platformUserId));
  }
}
