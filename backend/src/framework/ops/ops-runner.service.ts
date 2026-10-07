import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Issues } from './issues';
import type { OpContext, OpStep, AuthContext } from './op-context';
import { EntityEventService } from '../../foundation/entity-events/entity-event.service';

export interface RunOpParams<TData = any, TState = Record<string, any>> {
  resource: string;
  op: string;
  user: AuthContext;
  data: TData;
  initialState?: TState;
  steps: OpStep[];
  execute: (c: OpContext<TData, TState>) => Promise<any>;
  audit?: boolean;
}

@Injectable()
export class OpsRunnerService {
  private readonly logger = new Logger(OpsRunnerService.name);

  constructor(
    private readonly sequelize: Sequelize,
    private readonly moduleRef: ModuleRef,
    private readonly entityEventService: EntityEventService,
  ) {}

  /**
   * Executes an operation through the deterministic Ankpal Ops Pipeline (check -> before -> execute -> after -> afterCommit)
   */
  async run<TData = any, TState = Record<string, any>>(
    params: RunOpParams<TData, TState>,
  ): Promise<any> {
    const { resource, op, user, data, steps, execute, audit = true } = params;
    const afterCommitCallbacks: Array<() => void | Promise<void>> = [];

    return this.sequelize.transaction(async (t: Transaction) => {
      // 1. Build OpContext
      const c: OpContext<TData, TState> = {
        op,
        resource,
        user,
        organizationId: user.organizationId,
        t,
        data,
        state: (params.initialState || {}) as TState,
        issues: new Issues(),
        savepoint: async <TResult>(work: (subTx: Transaction) => Promise<TResult>): Promise<TResult> => {
          // Sequelize savepoint
          return (this.sequelize as any).transaction({ transaction: t }, work);
        },
        afterCommit: (work) => {
          afterCommitCallbacks.push(work);
        },
        get: <TToken>(token: any): TToken => {
          return this.moduleRef.get(token, { strict: false });
        },
      };

      // 2. Sort steps by number
      const sortedSteps = [...steps].sort((a, b) => (a.number || 0) - (b.number || 0));

      // 3. Phase: check (001-399)
      const checkSteps = sortedSteps.filter((s) => !s.number || s.number < 400);
      for (const step of checkSteps) {
        if (!step.when || step.when(c)) {
          await step.run(c);
        }
      }
      c.issues.throwIfFailed(`Validation failed on ${resource}.${op}`);

      // 4. Phase: before (400-499)
      const beforeSteps = sortedSteps.filter((s) => s.number && s.number >= 400 && s.number < 500);
      for (const step of beforeSteps) {
        if (!step.when || step.when(c)) {
          await step.run(c);
        }
      }
      c.issues.throwIfFailed(`Pre-condition failed on ${resource}.${op}`);

      // 5. Phase: execute (500)
      const initialRecord = (c.state as any)?.existingRecord || null;
      c.result = await execute(c);

      // 6. Phase: after (501-999)
      const afterSteps = sortedSteps.filter((s) => s.number && s.number > 500);
      for (const step of afterSteps) {
        if (!step.when || step.when(c)) {
          await step.run(c);
        }
      }
      c.issues.throwIfFailed(`Post-execution check failed on ${resource}.${op}`);

      // 7. Automated Audit Logging (Ankpal entity_events)
      if (audit && c.result?.id) {
        const diffData = initialRecord
          ? this.entityEventService.diff(initialRecord, c.result?.toJSON ? c.result.toJSON() : c.result)
          : (c.result?.toJSON ? c.result.toJSON() : c.result);

        await this.entityEventService.record(
          c.organizationId,
          resource,
          Number(c.result.id) || 0,
          op,
          Number(user.id) || null,
          diffData,
          t,
        );
      }

      // Schedule afterCommit invocation
      t.afterCommit(async () => {
        for (const cb of afterCommitCallbacks) {
          try {
            await cb();
          } catch (err) {
            this.logger.error(`Error in afterCommit hook on ${resource}.${op}:`, err);
          }
        }
      });

      return c.result;
    });
  }
}
