import { Injectable } from '@nestjs/common';
import type { OpContext, Step } from '../../../../framework/crud/op-context.js';
import { MembershipService } from '../../../platform/memberships.service.js';
import type { CreateUserDto } from '../../dto/user.dto.js';
import type { User } from '../../user.model.js';
import type { SaveState } from './_state.js';

/** A new person takes a seat of the company's license. */
@Injectable()
export default class CheckSeat implements Step<User, SaveState, CreateUserDto> {
  describe = 'only on create';

  constructor(private readonly memberships: MembershipService) {}

  when({ before }: OpContext<User, SaveState, CreateUserDto>): boolean {
    return before === null;
  }

  async check({ user, issues }: OpContext<User, SaveState, CreateUserDto>): Promise<void> {
    const { used, max } = await this.memberships.seats(user.companyId);
    if (max === 0) issues.block('license', 'This company has no valid license');
    else if (used >= max) issues.block('seats', `All ${max} seats of the license are in use`);
  }
}
