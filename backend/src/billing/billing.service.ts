import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  InvoiceModel,
  InvoiceItemModel,
  PaymentModel,
  CustomerModel,
  ShipmentModel,
  TransportOrderModel,
  LocationModel,
  ProofOfDeliveryModel,
  CarrierRateModel,
  ClaimModel,
  ClaimItemModel,
  CarrierModel,
} from '../database/models';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(InvoiceModel)
    private readonly invoiceModel: typeof InvoiceModel,
    @InjectModel(InvoiceItemModel)
    private readonly invoiceItemModel: typeof InvoiceItemModel,
    @InjectModel(PaymentModel)
    private readonly paymentModel: typeof PaymentModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(CarrierRateModel)
    private readonly carrierRateModel: typeof CarrierRateModel,
    @InjectModel(ClaimModel)
    private readonly claimModel: typeof ClaimModel,
    @InjectModel(ClaimItemModel)
    private readonly claimItemModel: typeof ClaimItemModel,
  ) {}

  async findAllInvoices(organizationId?: string, status?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (status) where.status = status;

    const invoices = await this.invoiceModel.findAll({
      where,
      include: [
        { model: CustomerModel, required: false },
        {
          model: ShipmentModel,
          required: false,
          include: [
            {
              model: TransportOrderModel,
              required: false,
              include: [
                { model: LocationModel, as: 'originLocation', required: false },
                { model: LocationModel, as: 'destinationLocation', required: false },
              ],
            },
          ],
        },
        { model: InvoiceItemModel, required: false },
        { model: PaymentModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return invoices.map((inv) => {
      const plain = inv.get({ plain: true });
      return {
        ...plain,
        invoiceItems: plain.items || [],
      };
    });
  }

  async findInvoice(id: string): Promise<any> {
    const invoice = await this.invoiceModel.findByPk(id, {
      include: [
        { model: CustomerModel, required: false },
        {
          model: ShipmentModel,
          required: false,
          include: [
            {
              model: TransportOrderModel,
              required: false,
              include: [
                { model: LocationModel, as: 'originLocation', required: false },
                { model: LocationModel, as: 'destinationLocation', required: false },
              ],
            },
            { model: ProofOfDeliveryModel, required: false },
          ],
        },
        { model: InvoiceItemModel, required: false },
        { model: PaymentModel, required: false },
      ],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const plain = invoice.get({ plain: true });
    return {
      ...plain,
      invoiceItems: plain.items || [],
    };
  }

  async recordPayment(invoiceId: string, data: any) {
    const invoice = await this.findInvoice(invoiceId);

    const payment = await this.paymentModel.create({
      invoiceId,
      amount: parseFloat(data.amount) || 0.0,
      paymentMethod: data.paymentMethod || 'WIRE_TRANSFER',
      paymentReference: `PAY-${Date.now().toString().slice(-6)}`,
      transactionId: data.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
      status: 'COMPLETED',
    });

    const allPayments = await this.paymentModel.findAll({ where: { invoiceId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const newStatus = totalPaid >= invoice.totalAmount ? 'PAID' : 'PARTIAL';
    await this.invoiceModel.update(
      { status: newStatus },
      { where: { id: invoiceId } },
    );

    return { payment, invoiceStatus: newStatus };
  }

  async auditCarrierInvoice(data: {
    shipmentId: string;
    carrierId: string;
    billedAmount: number;
    distanceKm: number;
  }) {
    const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
      include: [{ model: TransportOrderModel }],
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    const rate = await this.carrierRateModel.findOne({
      where: {
        carrierId: data.carrierId,
        originLocationId: shipment.transportOrder?.originLocationId,
        destinationLocationId: shipment.transportOrder?.destinationLocationId,
      },
    });

    const baseRate = rate?.baseRate || 2.2;
    const expectedCost = Math.round(data.distanceKm * baseRate * 100) / 100;
    const variance = Math.round((data.billedAmount - expectedCost) * 100) / 100;
    const variancePercent = Math.round((variance / (expectedCost || 1)) * 100 * 10) / 10;

    let auditStatus = 'APPROVED';
    const issues: string[] = [];

    if (variance > 50 || variancePercent > 5) {
      auditStatus = 'DISPUTED';
      issues.push(`Overcharged by $${variance} (${variancePercent}% higher than contract rate)`);
    } else if (variance < -50) {
      issues.push(`Billed amount is $${Math.abs(variance)} below contract rate`);
    }

    return {
      shipmentId: data.shipmentId,
      carrierId: data.carrierId,
      distanceKm: data.distanceKm,
      contractBaseRate: baseRate,
      expectedCost,
      billedAmount: data.billedAmount,
      variance,
      variancePercent,
      auditStatus,
      issues,
      auditDate: new Date().toISOString(),
    };
  }

  async findAllClaims(organizationId?: string): Promise<any> {
    const isSystem = !organizationId || organizationId === 'SYSTEM';

    return this.claimModel.findAll({
      include: [
        {
          model: ShipmentModel,
          required: false,
          include: [
            { model: CustomerModel, required: false },
            { model: CarrierModel, required: false },
            {
              model: TransportOrderModel,
              required: false,
              where: !isSystem ? { organizationId } : undefined,
            },
          ],
        },
        { model: ClaimItemModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async createClaim(data: any) {
    const claimNumber = `CLM-${Date.now().toString().slice(-6)}`;
    const claim = await this.claimModel.create({
      claimNumber,
      shipmentId: data.shipmentId,
      claimType: data.type || 'DAMAGE',
      claimedAmount: parseFloat(data.amount) || 0.0,
      reason: data.description || 'Cargo damage during transit',
      status: 'FILED',
    });

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await this.claimItemModel.create({
          claimId: claim.id,
          itemDescription: item.description || 'Damaged freight item',
          quantityDamaged: parseInt(item.quantity, 10) || 1,
          claimedCost: parseFloat(item.amount) || 0.0,
        });
      }
    }

    return this.claimModel.findByPk(claim.id, {
      include: [{ model: ClaimItemModel }],
    });
  }

  async updateClaimStatus(id: string, status: string) {
    const claim = await this.claimModel.findByPk(id);
    if (!claim) throw new NotFoundException('Claim not found');
    await claim.update({ status });
    return claim;
  }
}
