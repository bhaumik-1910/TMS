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
        id: plain.id,
        name: plain.companyName,
        companyName: plain.companyName,
        subType: plain.subType || 'Customer',
        branch: plain.branch || 'Ahmedabad',
        gstin: plain.gstin || '—',
        pan: plain.pan || '',
        tdsSection: plain.tdsSection || '194C',
        creditLimit: plain.creditLimitStr || (plain.creditLimit ? `₹${Number(plain.creditLimit).toLocaleString('en-IN')}` : '—'),
        creditDays: plain.creditDays || '30',
        bankName: plain.bankName || 'HDFC Bank',
        accountNo: plain.accountNo || '',
        ifscCode: plain.ifscCode || '',
        mobile: plain.phone || '',
        phone: plain.phone || '',
        email: plain.email || '',
        status: plain.status === 'ACTIVE' || plain.status === 'Active' ? 'Active' : 'Inactive',
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
      companyName: data.name || data.companyName,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.mobile || data.phone || null,
      billingAddress: data.billingAddress || null,
      shippingAddress: data.shippingAddress || null,
      creditLimit: parseFloat(String(data.creditLimit || '50000').replace(/[^0-9.]/g, '')) || 50000,
      creditLimitStr: data.creditLimit ? (String(data.creditLimit).startsWith('₹') ? data.creditLimit : `₹${data.creditLimit}`) : '—',
      paymentTerms: data.paymentTerms || 'NET_30',
      status: (data.status || 'Active').toUpperCase(),
      subType: data.subType || 'Customer',
      branch: data.branch || 'Ahmedabad',
      gstin: data.gstin || null,
      pan: data.pan || null,
      tdsSection: data.tdsSection || '194C',
      creditDays: data.creditDays || '30',
      bankName: data.bankName || null,
      accountNo: data.accountNo || null,
      ifscCode: data.ifscCode || null,
    });
  }

  override async update(id: any, data: any): Promise<any> {
    // Always fetch the raw Sequelize model instance (NOT the plain-object override)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
    let instance: CustomerModel | null = null;

    if (isUuid) {
      instance = await this.customerModel.findByPk(id);
    }
    if (!instance) {
      instance = await this.customerModel.findOne({ where: { customerCode: id } });
    }

    if (!instance) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    const updateData: any = {
      companyName:   data.name        || data.companyName    || instance.companyName,
      email:         data.email         !== undefined ? data.email    : instance.email,
      phone:         (data.mobile       !== undefined ? data.mobile   : data.phone) ?? instance.phone,
      status:        data.status ? (data.status.toUpperCase() === 'ACTIVE' || data.status === 'Active' ? 'ACTIVE' : 'INACTIVE') : instance.status,
      subType:       data.subType       || instance.subType,
      branch:        data.branch        || instance.branch,
      gstin:         data.gstin         !== undefined ? data.gstin        : instance.gstin,
      pan:           data.pan           !== undefined ? data.pan          : instance.pan,
      tdsSection:    data.tdsSection    !== undefined ? data.tdsSection   : instance.tdsSection,
      creditDays:    data.creditDays    !== undefined ? data.creditDays   : instance.creditDays,
      creditLimitStr:data.creditLimit   !== undefined ? data.creditLimit  : instance.creditLimitStr,
      creditLimit:   data.creditLimit   ? parseFloat(String(data.creditLimit).replace(/[^0-9.]/g, '')) || instance.creditLimit : instance.creditLimit,
      bankName:      data.bankName      !== undefined ? data.bankName     : instance.bankName,
      accountNo:     data.accountNo     !== undefined ? data.accountNo    : instance.accountNo,
      ifscCode:      data.ifscCode      !== undefined ? data.ifscCode     : instance.ifscCode,
    };

    if (typeof instance.update === 'function') {
      return instance.update(updateData);
    }
    // Fallback: use static model update
    await this.customerModel.update(updateData, { where: { id } });
    return this.customerModel.findByPk(id);
  }

  async remove(id: string) {
    return this.delete(id);
  }
}
