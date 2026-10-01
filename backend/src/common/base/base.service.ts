import { NotFoundException } from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import { WhereOptions, Includeable, Order, FindOptions } from 'sequelize';

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseSequelizeService<T extends Model> {
  constructor(protected readonly model: any) {}

  async findAll(...args: any[]): Promise<any> {
    const where = typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
    const include = Array.isArray(args[1]) ? args[1] : [];
    const order = args[2] || [['createdAt', 'DESC']];
    return this.model.findAll({
      where,
      include,
      order,
    }) as unknown as Promise<T[]>;
  }

  async findPaginated(
    where: WhereOptions = {},
    pagination: PaginationQueryDto = {},
    include: Includeable[] = [],
    customOrder?: Order,
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Number(pagination.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(pagination.limit) || 20));
    const offset = (page - 1) * limit;

    const order: Order = customOrder || [
      [pagination.sortBy || 'createdAt', pagination.sortOrder || 'DESC'],
    ];

    const { rows, count } = await this.model.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });

    return {
      data: rows as unknown as T[],
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string, include: Includeable[] = []): Promise<T> {
    const record = await this.model.findByPk(id, { include });
    if (!record) {
      throw new NotFoundException(
        `${this.model.name.replace('Model', '')} with ID ${id} not found`,
      );
    }
    return record as unknown as T;
  }

  async findOne(options: FindOptions): Promise<T | null> {
    const record = await this.model.findOne(options);
    return record as unknown as T | null;
  }

  async create(...args: any[]): Promise<any> {
    const [dto, options] = args;
    const record = await this.model.create(dto, options);
    return record as unknown as T;
  }

  async update(id: string, dto: any, options?: any): Promise<T> {
    const record = await this.findById(id);
    await record.update(dto, options);
    return record;
  }

  async delete(id: string): Promise<void> {
    const record = await this.findById(id);
    await record.destroy();
  }

  async count(where: WhereOptions = {}): Promise<number> {
    return this.model.count({ where });
  }

  async withTransaction<R>(operation: (transaction: any) => Promise<R>): Promise<R> {
    const sequelize = this.model.sequelize;
    if (!sequelize) throw new Error('Sequelize instance not found on model');
    return sequelize.transaction(operation);
  }
}
