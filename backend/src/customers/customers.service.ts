import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import { CustomerModel } from '../database/models';

@Injectable()
export class CustomersService extends BaseSequelizeService<CustomerModel> {
  constructor(
    @InjectModel(CustomerModel)
    private readonly customerModel: typeof CustomerModel,
  ) {
    super(customerModel);
  }

  async findAll(organizationId?: string, search?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { customerCode: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const customers = await this.customerModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return customers.map((c) => {
      const plain = c.get({ plain: true });
      return {
        ...plain,
        _count: {
          transportOrders: 0,
          shipments: 0,
          invoices: 0,
        },
      };
    });
  }

  override async findOne(id: any): Promise<any> {
    if (typeof id === 'string') {
      const customer = await this.customerModel.findByPk(id);
      if (!customer) throw new NotFoundException('Customer not found');
      const plain = customer.get({ plain: true });
      return {
        ...plain,
        transportOrders: [],
        shipments: [],
        invoices: [],
      };
    }
    return super.findOne(id);
  }

  override async create(organizationIdOrData: any, body?: any): Promise<any> {
    const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
    const data = body || organizationIdOrData;

    return this.customerModel.create({
      organizationId,
      customerCode: data.customerCode || `CUST-${Date.now().toString().slice(-4)}`,
      companyName: data.companyName,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.phone || null,
      billingAddress: data.billingAddress || null,
      shippingAddress: data.shippingAddress || null,
      creditLimit: parseFloat(data.creditLimit || '50000'),
      paymentTerms: data.paymentTerms || 'NET_30',
      status: data.status || 'ACTIVE',
    });
  }

  async remove(id: string) {
    return this.delete(id);
  }
}
