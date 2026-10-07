import type { Transaction } from 'sequelize';
import type { Issues } from './issues';

export type Phase = 'check' | 'before' | 'after';

export const PHASE_BANDS: Record<Phase, [number, number]> = {
  check: [1, 399],
  before: [400, 499],
  after: [501, 999],
};

export interface AuthContext {
  id: number | string;
  email?: string;
  organizationId: string;
  branchId?: number;
  roles?: string[];
  permissions?: string[];
}

/**
 * Shared Context passed sequentially through every step of an operation.
 */
export interface OpContext<TData = any, TState = Record<string, any>> {
  op: string;
  resource: string;
  user: AuthContext;
  organizationId: string;
  t: Transaction;
  data: TData;
  state: TState;
  issues: Issues;
  result?: any;

  /** Run optional sub-task in isolated savepoint */
  savepoint<T>(work: (t: Transaction) => Promise<T>): Promise<T>;

  /** Register callbacks to run strictly AFTER transaction commits */
  afterCommit(work: () => void | Promise<void>): void;

  /** Dynamic dependency lookup */
  get<T>(token: any): T;
}

export interface OpStep<TContext extends OpContext = OpContext> {
  file?: string;
  number?: number;
  phase?: Phase;
  when?(c: TContext): boolean;
  run(c: TContext): Promise<void>;
}
