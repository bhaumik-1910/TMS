import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import {
  CarrierModel,
  CarrierContractModel,
  CarrierRateModel,
  CarrierDocumentModel,
} from '../database/models';

@Injectable()
export class CarriersService extends BaseSequelizeService<CarrierModel> {
  constructor(
    @InjectModel(CarrierModel)
    private readonly carrierModel: typeof CarrierModel,
    @InjectModel(CarrierRateModel)
    private readonly carrierRateModel: typeof CarrierRateModel,
  ) {
    super(carrierModel);
  }

  async findAll(organizationId?: string, search?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { carrierCode: { [Op.iLike]: `%${search}%` } },
        { contactName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const carriers = await this.carrierModel.findAll({
      where,
      include: [
        { model: CarrierContractModel, required: false },
        { model: CarrierRateModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return carriers.map((c) => {
      const plain = c.get({ plain: true });
      return {
        ...plain,
        _count: {
          shipments: 0,
          tenderRequests: 0,
        },
      };
    });
  }

  override async findOne(id: any): Promise<any> {
    if (typeof id === 'string') {
      const carrier = await this.carrierModel.findByPk(id, {
        include: [
          { model: CarrierContractModel, required: false },
          { model: CarrierRateModel, required: false },
          { model: CarrierDocumentModel, required: false },
        ],
      });
      if (!carrier) throw new NotFoundException('Carrier not found');
      const plain = carrier.get({ plain: true });
      return {
        ...plain,
        tenderRequests: [],
      };
    }
    return super.findOne(id);
  }

  override async create(organizationIdOrData: any, body?: any): Promise<any> {
    const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
    const data = body || organizationIdOrData;

    return this.carrierModel.create({
      organizationId,
      carrierCode: data.carrierCode || `CARR-${Date.now().toString().slice(-4)}`,
      companyName: data.companyName,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      taxNumber: data.taxNumber || null,
      rating: parseFloat(data.rating || '4.8'),
      status: data.status || 'ACTIVE',
    });
  }

  async remove(id: string) {
    return this.delete(id);
  }

  async addRate(carrierId: string, rateData: any) {
    return this.carrierRateModel.create({
      carrierId,
      originLocationId: rateData.originLocationId,
      destinationLocationId: rateData.destinationLocationId,
      baseRate: parseFloat(rateData.baseRate) || 0.0,
      rateType: rateData.rateType || 'PER_KM',
      validFrom: new Date(rateData.validFrom || Date.now()),
      validTo: new Date(rateData.validTo || Date.now() + 365 * 24 * 3600 * 1000),
      status: 'ACTIVE',
    });
  }
}
