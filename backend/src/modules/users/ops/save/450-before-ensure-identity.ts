import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { MembershipService } from '../../../platform/memberships.service.js';
import type { CreateUserDto } from '../../dto/user.dto.js';
import type { User } from '../../user.model.js';
import type { SaveState } from './_state.js';

/**
 * Cross-store write, first half: the person's sign-in identity and a `pending` membership go to
 * the control plane (its own transaction), and the tenant row below points at them. The membership
 * only becomes `active` after this operation commits (`600-after-activate-membership.ts`), so a
 * failed save never leaves a login that works. An existing identity keeps its own password.
 */
@Injectable()
export default class EnsureIdentity implements Step<User, SaveState, CreateUserDto> {
  describe = 'only on create';

  constructor(private readonly memberships: MembershipService) {}

  when({ before }: OpContext<User, SaveState, CreateUserDto>): boolean {
    return before === null;
  }

  async before(c: OpContext<User, SaveState, CreateUserDto>): Promise<void> {
    const { email, name, password } = c.dto;
    const id = await c.control(async (ct) => {
      const platformUserId = await this.memberships.ensureIdentity(ct, { email, name, password });
      await this.memberships.addPending(ct, c.user.companyId, platformUserId);
      return platformUserId;
    });
    c.state.platformUserId = id;
    c.row.platformUserId = id;
  }
}
