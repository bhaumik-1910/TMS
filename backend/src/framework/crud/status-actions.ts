import type { TenantModel } from '../db/tenant.model.js';
import type { EntityAction } from './entity-action.js';

interface StatusActionOptions {
  /** Singular noun for messages: "branch". */
  noun: string;
  /** Column holding the state. */
  field?: string;
  active?: string;
  inactive?: string;
  /** States `activate` may start from. */
  activateFrom?: readonly string[];
  /** States `deactivate` may start from. */
  deactivateFrom?: readonly string[];
}

/**
 * The `activate` and `deactivate` actions most masters share. They only set the status; an
 * entity's own checks and side effects go in `ops/deactivate/` and `ops/activate/`.
 */
export function statusActions<M extends TenantModel>(options: StatusActionOptions): EntityAction<M>[] {
  const field = options.field ?? 'status';
  const active = options.active ?? 'active';
  const inactive = options.inactive ?? 'inactive';

  const setTo = (value: string): EntityAction<M>['run'] => async ({ row, ctx, t }) => {
    await row.update({ [field]: value, updatedById: ctx.user.id } as never, { transaction: t });
  };

  return [
    {
      name: 'deactivate',
      label: 'Deactivate',
      from: { [field]: options.deactivateFrom ?? [active] },
      confirm: `Deactivate this ${options.noun}?`,
      danger: true,
      run: setTo(inactive),
      effect: `${field} -> ${inactive}`,
    },
    {
      name: 'activate',
      label: 'Activate',
      from: { [field]: options.activateFrom ?? [inactive] },
      confirm: `Activate this ${options.noun}?`,
      run: setTo(active),
      effect: `${field} -> ${active}`,
    },
  ];
}
