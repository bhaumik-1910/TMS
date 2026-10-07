import { Logger } from '@nestjs/common';
import { step } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';
import type { DeactivateState } from './_state.js';

const logger = new Logger('BranchDeactivate');

/**
 * `c.afterCommit` runs only once the whole operation has committed, never on rollback. Use it for
 * anything that must not announce a change that did not happen. `state` carries what the earlier
 * steps found: 010's status before the change, 520's status after it, 040's recent logins, 450's skipped statistics.
 */
export default step<Branch, DeactivateState>({
  async after({ row, state, afterCommit }) {
    afterCommit(() => {
      logger.log(
        `${row.name}: ${state.statusBefore} -> ${state.statusAfter ?? row.status} by ${state.deactivatedBy}; ` +
          `${state.activeUsers ?? 0} active users, ${state.recentLogins ?? 0} recent logins, stats ${state.statsSkipped ? 'skipped' : 'read'}`,
      );
    });
  },
});
