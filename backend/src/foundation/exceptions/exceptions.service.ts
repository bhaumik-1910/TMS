import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExceptionModel } from '../../database/models/foundation/exception.model';

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectModel(ExceptionModel)
    private readonly exceptionModel: typeof ExceptionModel,
  ) {}

  async list(organizationId: string | number, status?: 'all' | 'open' | 'resolved'): Promise<ExceptionModel[]> {
    const where: any = { organizationId: String(organizationId) };
    if (status === 'open') {
      where.resolvedAt = null;
    } else if (status === 'resolved') {
      where.resolvedAt = { $ne: null };
    }

    return this.exceptionModel.findAll({
      where,
      order: [
        ['severity', 'ASC'], // high first
        ['occurredOn', 'DESC'],
      ],
    });
  }

  async resolve(organizationId: string | number, id: number, userId?: number): Promise<ExceptionModel> {
    const item = await this.exceptionModel.findOne({
      where: { id, organizationId: String(organizationId) },
    });
    if (!item) throw new NotFoundException(`Exception #${id} not found`);

    await item.update({
      resolvedAt: new Date(),
      resolvedById: userId,
    });

    return item;
  }
}
