import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { BranchModel } from '../../database/models/foundation/branch.model';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(BranchModel)
    private readonly branchModel: typeof BranchModel,
  ) {}

  async findAll(organizationId: string | number): Promise<BranchModel[]> {
    return this.branchModel.findAll({
      where: { organizationId: String(organizationId) },
      order: [
        ['isHeadOffice', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  async findOne(organizationId: string | number, id: number): Promise<BranchModel> {
    const branch = await this.branchModel.findOne({
      where: { id, organizationId: String(organizationId) },
    });
    if (!branch) {
      throw new NotFoundException(`Branch #${id} not found`);
    }
    return branch;
  }

  async create(organizationId: string | number, data: Partial<BranchModel>, tx?: Transaction): Promise<BranchModel> {
    const existing = await this.branchModel.findOne({
      where: { organizationId: String(organizationId), code: data.code },
    });
    if (existing) {
      throw new BadRequestException(`Branch code "${data.code}" already exists in this organization`);
    }

    return this.branchModel.create(
      {
        ...data,
        organizationId: String(organizationId),
      },
      { transaction: tx },
    );
  }

  async update(organizationId: string | number, id: number, data: Partial<BranchModel>, tx?: Transaction): Promise<BranchModel> {
    const branch = await this.findOne(organizationId, id);
    if (data.code && data.code !== branch.code) {
      const existing = await this.branchModel.findOne({
        where: { organizationId: String(organizationId), code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Branch code "${data.code}" already in use`);
      }
    }

    await branch.update(data, { transaction: tx });
    return branch;
  }

  async remove(organizationId: string | number, id: number, tx?: Transaction): Promise<void> {
    const branch = await this.findOne(organizationId, id);
    if (branch.isHeadOffice) {
      throw new BadRequestException('Cannot delete the Head Office branch');
    }
    await branch.destroy({ transaction: tx });
  }
}
