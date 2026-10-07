import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PeriodLockModel } from '../../database/models/foundation/period-lock.model';

@Injectable()
export class PeriodLockService {
  constructor(
    @InjectModel(PeriodLockModel)
    private readonly lockModel: typeof PeriodLockModel,
  ) {}

  /**
   * Fetches all period locks for an organization
   */
  async list(organizationId: string | number): Promise<PeriodLockModel[]> {
    return this.lockModel.findAll({
      where: { organizationId: String(organizationId) },
      order: [['branchId', 'ASC']],
    });
  }

  /**
   * Asserts whether a transaction on `dateStr` is permitted for a given `branchId`.
   * Throws ForbiddenException if `dateStr` <= lockedUntil.
   */
  async checkAllowed(
    organizationId: string | number,
    branchId: number | null,
    dateStr: string,
    operationName = 'perform transaction',
  ): Promise<void> {
    const locks = await this.lockModel.findAll({
      where: { organizationId: String(organizationId) },
    });

    for (const lock of locks) {
      // branchId 0 applies to all branches
      if (lock.branchId === 0 || lock.branchId === branchId) {
        if (dateStr <= lock.lockedUntil) {
          throw new ForbiddenException(
            `Cannot ${operationName} on ${dateStr}. Operations on or before ${lock.lockedUntil} are locked for this branch/period.`,
          );
        }
      }
    }
  }

  /**
   * Sets or updates the lock date for a branch (0 for company-wide)
   */
  async setLock(
    organizationId: string | number,
    branchId: number,
    lockedUntil: string,
    userId?: number,
    tx?: Transaction,
  ): Promise<PeriodLockModel> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lockedUntil)) {
      throw new BadRequestException('lockedUntil must be in YYYY-MM-DD format');
    }

    const [lock, created] = await this.lockModel.findOrCreate({
      where: { organizationId: String(organizationId), branchId },
      defaults: {
        organizationId: String(organizationId),
        branchId,
        lockedUntil,
        createdById: userId,
        updatedById: userId,
      },
      transaction: tx,
    });

    if (!created) {
      await lock.update(
        {
          lockedUntil,
          updatedById: userId,
        },
        { transaction: tx },
      );
    }

    return lock;
  }

  /**
   * Removes a lock for a branch
   */
  async removeLock(organizationId: string | number, branchId: number, tx?: Transaction): Promise<void> {
    await this.lockModel.destroy({
      where: { organizationId: String(organizationId), branchId },
      transaction: tx,
    });
  }
}
