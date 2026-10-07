import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { MembershipService } from '../../../platform/memberships.service.js';
import type { User } from '../../user.model.js';

/** Deleting the company profile also ends the person's access to this company and frees the seat. */
@Injectable()
export default class RemoveMembership implements Step<User> {
  constructor(private readonly memberships: MembershipService) {}

  async after({ row, user, afterCommit }: OpContext<User>): Promise<void> {
    afterCommit(() => this.memberships.remove(user.companyId, row.platformUserId));
  }
}
