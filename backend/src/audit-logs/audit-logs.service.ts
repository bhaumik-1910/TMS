import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLogModel, UserModel } from '../database/models';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
  ) {}

  async findAll(organizationId?: string, module?: string, entityType?: string) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (module) where.module = module;
    if (entityType) where.entityType = entityType;

    return this.auditLogModel.findAll({
      where,
      include: [
        {
          model: UserModel,
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
  }
}
