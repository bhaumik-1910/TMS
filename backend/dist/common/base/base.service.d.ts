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
export declare abstract class BaseSequelizeService<T extends Model> {
    protected readonly model: any;
    constructor(model: any);
    findAll(...args: any[]): Promise<any>;
    findPaginated(where?: WhereOptions, pagination?: PaginationQueryDto, include?: Includeable[], customOrder?: Order): Promise<PaginatedResult<T>>;
    findById(id: string, include?: Includeable[]): Promise<T>;
    findOne(options: FindOptions): Promise<T | null>;
    create(...args: any[]): Promise<any>;
    update(id: string, dto: any, options?: any): Promise<T>;
    delete(id: string): Promise<void>;
    count(where?: WhereOptions): Promise<number>;
    withTransaction<R>(operation: (transaction: any) => Promise<R>): Promise<R>;
}
