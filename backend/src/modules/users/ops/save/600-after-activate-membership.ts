import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { MembershipService } from '../../../platform/memberships.service.js';
import type { CreateUserDto } from '../../dto/user.dto.js';
import type { User } from '../../user.model.js';
import type { SaveState } from './_state.js';

/** Cross-store write, second half: after the tenant user is committed, the membership can sign in. */
@Injectable()
export default class ActivateMembership implements Step<User, SaveState, CreateUserDto> {
  describe = 'only on create';

  constructor(private readonly memberships: MembershipService) {}

  when({ before }: OpContext<User, SaveState, CreateUserDto>): boolean {
    return before === null;
  }

  async after({ row, user, afterCommit }: OpContext<User, SaveState, CreateUserDto>): Promise<void> {
    afterCommit(() => this.memberships.activate(user.companyId, row.platformUserId));
  }
}
