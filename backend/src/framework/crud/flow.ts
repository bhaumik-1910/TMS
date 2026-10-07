import type { LimitDef } from '../acl/limits.js';
import type { TenantModel } from '../db/tenant.model.js';
import type { EntityAction } from './entity-action.js';
import type { OpsRegistry } from './ops-loader.js';
import type { Phase } from './op-context.js';

export interface FlowOperation {
  name: string;
  /** `write` (create/update/delete), `row`/`bulk`/`collection` actions, `list` or `view`. */
  kind: string;
  permission: string;
  from: Record<string, readonly string[]> | null;
  inputs: string[];
  /** Authority limits a grant of this operation can carry (`amount`). */
  limits: string[];
  /** The main change between the `before` and `after` steps. */
  effect: string;
  /** Step files in run order. */
  steps: Array<{ file: string; phase: Phase; conditional: boolean; describe?: string }>;
}

export interface EntityFlow {
  entity: string;
  resource: string;
  label: string;
  dependents: string[];
  /** The date that decides a record's period lock, when the service has one. */
  periodField: string | null;
  scopes: string[];
  softDelete: boolean;
  operations: FlowOperation[];
}

export interface FlowEnv<M extends TenantModel> {
  ops: OpsRegistry;
  model: { name: string };
  resource: string;
  label: string;
  dependents: Array<{ table: string; column: string; label: string }>;
  actions: readonly EntityAction<M>[];
  limits: Partial<Record<string, readonly LimitDef<M>[]>>;
  periodField: string | null;
  scopes: string[];
  softDelete: boolean;
  actionPermission(action: EntityAction<M>): string;
}

/** Every operation with its steps in run order, for the generated flow document. */
export function describeEntityFlow<M extends TenantModel>(env: FlowEnv<M>): EntityFlow {
  const steps = (name: string) =>
    env.ops.steps(name).map((loaded) => ({
      file: loaded.file,
      phase: loaded.phase,
      conditional: typeof loaded.impl.when === 'function',
      ...(loaded.impl.describe ? { describe: loaded.impl.describe } : {}),
    }));
  const operation = (name: string, effect: string, extra: Partial<FlowOperation> = {}): FlowOperation => {
    const execute = env.ops.execute(name);
    return {
      name,
      kind: 'write',
      permission: `${env.resource}.${name}`,
      from: null,
      inputs: [],
      limits: (env.limits[name] ?? []).map((limit) => limit.key),
      ...extra,
      effect: execute ? `${execute.file} (replaces: ${extra.effect ?? effect})${execute.impl.describe ? ' - ' + execute.impl.describe : ''}` : (extra.effect ?? effect),
      steps: steps(name),
    };
  };
  const named = (prefix: 'list-' | 'view-') => env.ops.names().filter((name) => name.startsWith(prefix)).sort();
  const read = (name: string, effect: string, kind: string) => operation(name, effect, { kind, permission: `${env.resource}.view` });

  return {
    entity: env.model.name,
    resource: env.resource,
    label: env.label,
    dependents: env.dependents.map((d) => `${d.table}.${d.column} (${d.label})`),
    periodField: env.periodField,
    scopes: env.scopes,
    softDelete: env.softDelete,
    operations: [
      operation('create', 'insert row'),
      operation('update', 'save row'),
      operation('delete', env.softDelete ? 'soft delete row' : 'delete row'),
      ...env.actions.map((action) =>
        operation(action.name, action.effect ?? (action.run || action.runCollection ? 'run' : 'steps only'), {
          kind: action.kind ?? 'row',
          permission: env.actionPermission(action),
          from: action.from ?? null,
          inputs: (action.inputs ?? []).map((input) => input.id),
          limits: (action.limits ?? env.limits[action.name] ?? []).map((limit) => limit.key),
        }),
      ),
      ...(env.ops.has('list') ? [read('list', 'query + page', 'list')] : []),
      ...named('list-').map((name) => read(name, 'query + page', 'list')),
      ...named('view-').map((name) => read(name, 'result from steps', 'view')),
    ],
  };
}
