import type { EntityAction } from '../../framework/crud/entity-action.js';
import { statusActions } from '../../framework/crud/status-actions.js';
import type { Branch } from './branch.model.js';

/** What can be done to a branch besides editing it. Checks and effects are in `ops/<name>/`. */
export const branchActions: EntityAction<Branch>[] = [
  ...statusActions<Branch>({ noun: 'branch' }),
  // Bulk example: same permission as deactivate. No `run` here; ops/deactivate-many/500-execute.ts does the change.
  {
    name: 'deactivate-many',
    label: 'Deactivate selected',
    kind: 'bulk',
    permission: 'deactivate',
    from: { status: ['active'] },
    confirm: 'Deactivate the selected branches?',
    danger: true,
    effect: 'status -> inactive',
  },
  // Collection example: no record. Steps in ops/refresh-stats/.
  { name: 'refresh-stats', label: 'Refresh statistics', kind: 'collection', permission: 'update', effect: 'steps only' },
];
