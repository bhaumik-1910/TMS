import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  ProofOfDeliveryModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  InvoiceModel,
  InvoiceItemModel,
  NotificationModel,
  CustomerModel,
  TransportOrderModel,
  LocationModel,
  PodRecordModel,
} from '../database/models';

@Injectable()
export class PodService implements OnModuleInit {
  constructor(
    @InjectModel(ProofOfDeliveryModel)
    private readonly podModel: typeof ProofOfDeliveryModel,
    @InjectModel(PodRecordModel)
    private readonly podRecordModel: typeof PodRecordModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(DriverModel)
    private readonly driverModel: typeof DriverModel,
    @InjectModel(InvoiceModel)
    private readonly invoiceModel: typeof InvoiceModel,
    @InjectModel(InvoiceItemModel)
    private readonly invoiceItemModel: typeof InvoiceItemModel,
    @InjectModel(NotificationModel)
    private readonly notificationModel: typeof NotificationModel,
  ) {}

  async onModuleInit() {
    try {
      const sequelize = this.podRecordModel.sequelize;
      if (!sequelize) return;

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS pod_records (
          id VARCHAR(255) PRIMARY KEY,
          "podId" VARCHAR(100) UNIQUE NOT NULL,
          "lrRef" VARCHAR(100) NOT NULL,
          "customer" VARCHAR(255) NOT NULL,
          "deliveryDate" VARCHAR(100),
          "receiver" VARCHAR(255),
          "deliveredQty" VARCHAR(100),
          "shortage" VARCHAR(100) DEFAULT '0',
          "source" VARCHAR(100) DEFAULT 'Driver App',
          "status" VARCHAR(100) DEFAULT 'Pending',
          "remarks" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      const [rows]: any = await sequelize.query(`SELECT count(*) as cnt FROM pod_records;`);
      if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
        const seedPods = [
          {
            id: 'POD/240044',
            podId: 'POD/240044',
            lrRef: 'LR/240044',
            customer: 'HPCL',
            deliveryDate: '2026-10-22',
            receiver: 'Rajan Mehta',
            deliveredQty: '25 MT',
            shortage: '0',
            source: 'Driver App',
            status: 'AI Verified',
            remarks: 'Consignment verified with e-signature and physical stamp',
          },
          {
            id: 'POD/240043',
            podId: 'POD/240043',
            lrRef: 'LR/240043',
            customer: 'Pidilite Industries',
            deliveryDate: '2026-10-21',
            receiver: 'Akhil Sharma',
            deliveredQty: '7.8 MT',
            shortage: '0.2 MT',
            source: 'Driver App',
            status: 'Disputed',
            remarks: 'Minor leakage observed on pallet 3',
          },
          {
            id: 'POD/240042',
            podId: 'POD/240042',
            lrRef: 'LR/240042',
            customer: 'Marico',
            deliveryDate: '2026-10-20',
            receiver: 'Vijay Nair',
            deliveredQty: '15 Pallets',
            shortage: '0',
            source: 'Branch Scan',
            status: 'Verified',
            remarks: 'Direct warehouse receipt verified',
          },
          {
            id: 'POD/240047',
            podId: 'POD/240047',
            lrRef: 'LR/240047',
            customer: 'Reliance',
            deliveryDate: '—',
            receiver: '—',
            deliveredQty: '—',
            shortage: '—',
            source: '—',
            status: 'Pending',
            remarks: 'En route delivery in progress',
          },
        ];

        for (const p of seedPods) {
          await sequelize.query(`
            INSERT INTO pod_records (id, "podId", "lrRef", "customer", "deliveryDate", "receiver", "deliveredQty", "shortage", "source", "status", "remarks", "createdAt", "updatedAt")
            VALUES ('${p.id}', '${p.podId}', '${p.lrRef}', '${p.customer}', '${p.deliveryDate}', '${p.receiver}', '${p.deliveredQty}', '${p.shortage}', '${p.source}', '${p.status}', '${p.remarks}', NOW(), NOW())
            ON CONFLICT ("podId") DO NOTHING;
          `);
        }
      }
    } catch (err) {
      console.warn('Could not auto-initialize pod_records table:', err?.message || err);
    }
  }

  // --- POD REGISTER CRUD ---
  async findAllRecords(query?: any) {
    const where: any = {};
    if (query?.search) {
      const s = `%${query.search}%`;
      where[Op.or] = [
        { podId: { [Op.iLike]: s } },
        { lrRef: { [Op.iLike]: s } },
        { customer: { [Op.iLike]: s } },
        { receiver: { [Op.iLike]: s } },
      ];
    }
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.source && query.source !== 'ALL') {
      where.source = query.source;
    }

    return this.podRecordModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOneRecord(id: string) {
    const item = await this.podRecordModel.findOne({
      where: {
        [Op.or]: [{ id }, { podId: id }, { lrRef: id }],
      },
    });
    if (!item) throw new NotFoundException(`POD record ${id} not found`);
    return item;
  }

  async createRecord(dto: any) {
    const podId = dto.podId || dto.id || `POD/${240048 + Math.floor(Math.random() * 900)}`;
    const id = dto.id || podId;
    const lrRef = dto.lrRef || dto.lrReference || `LR/${podId.replace(/[^0-9]/g, '') || '240048'}`;

    const payload = {
      id,
      podId,
      lrRef,
      customer: dto.customer || 'Reliance',
      deliveryDate: dto.deliveryDate || new Date().toISOString().slice(0, 10),
      receiver: dto.receiver || dto.receiverName || 'Plant Incharge',
      deliveredQty: dto.deliveredQty || '25 MT',
      shortage: dto.shortage !== undefined ? String(dto.shortage) : '0',
      source: dto.source || dto.podSource || 'Driver App',
      status: dto.status || 'Pending',
      remarks: dto.remarks || '',
    };

    const [item, created] = await this.podRecordModel.findOrCreate({
      where: {
        [Op.or]: [{ id: payload.id }, { podId: payload.podId }],
      },
      defaults: payload,
    });

    if (!created) {
      await item.update(payload);
    }
    return item;
  }

  async updateRecord(id: string, dto: any) {
    const item = await this.findOneRecord(id);
    const updatedData: any = {};
    if (dto.podId !== undefined) updatedData.podId = dto.podId;
    if (dto.lrRef !== undefined) updatedData.lrRef = dto.lrRef;
    if (dto.customer !== undefined) updatedData.customer = dto.customer;
    if (dto.deliveryDate !== undefined) updatedData.deliveryDate = dto.deliveryDate;
    if (dto.receiver !== undefined || dto.receiverName !== undefined) updatedData.receiver = dto.receiver || dto.receiverName;
    if (dto.deliveredQty !== undefined) updatedData.deliveredQty = dto.deliveredQty;
    if (dto.shortage !== undefined) updatedData.shortage = String(dto.shortage);
    if (dto.source !== undefined || dto.podSource !== undefined) updatedData.source = dto.source || dto.podSource;
    if (dto.status !== undefined) updatedData.status = dto.status;
    if (dto.remarks !== undefined) updatedData.remarks = dto.remarks;

    await item.update(updatedData);
    return item;
  }

  async removeRecord(id: string) {
    const item = await this.findOneRecord(id);
    await item.destroy();
    return { success: true, message: `POD record ${id} deleted successfully` };
  }


  async submitPOD(data: {
    shipmentId: string;
    receiverName: string;
    receiverContact?: string;
    otp?: string;
    signatureUrl?: string;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
    remarks?: string;
  }) {
    const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
      include: [{ model: TransportOrderModel }],
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    const sequelize = this.podModel.sequelize;
    if (!sequelize) throw new Error('Sequelize not found');

    return sequelize.transaction(async (transaction) => {
      // 1. Create or update Proof of Delivery
      let pod = await this.podModel.findOne({
        where: { shipmentId: data.shipmentId },
        transaction,
      });

      const podValues = {
        shipmentId: data.shipmentId,
        receiverName: data.receiverName,
        receiverPhone: data.receiverContact || null,
        otpCode: data.otp || null,
        signatureData: data.signatureUrl || null,
        photoUrl: data.photoUrl || null,
        deliveryLatitude: data.latitude || null,
        deliveryLongitude: data.longitude || null,
        deliveredAt: new Date(),
      };

      if (pod) {
        await pod.update(podValues, { transaction });
      } else {
        pod = await this.podModel.create(podValues, { transaction });
      }

      // 2. Update shipment to DELIVERED
      await shipment.update(
        {
          status: 'DELIVERED',
          actualDelivery: new Date(),
        },
        { transaction },
      );

      // 3. Release vehicle and driver
      if (shipment.vehicleId) {
        await this.vehicleModel.update(
          { status: 'AVAILABLE' },
          { where: { id: shipment.vehicleId }, transaction },
        );
      }
      if (shipment.driverId) {
        await this.driverModel.update(
          { status: 'AVAILABLE' },
          { where: { id: shipment.driverId }, transaction },
        );
      }

      // 4. Auto-generate Customer Invoice for delivered shipment
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const weight = shipment.totalWeight || 100;
      const baseFreight = Math.round(weight * 0.75 + 150);
      const taxAmount = Math.round(baseFreight * 0.1 * 100) / 100;
      const totalAmount = baseFreight + taxAmount;
      const orgId = shipment.transportOrder?.organizationId;

      if (orgId) {
        const invoice = await this.invoiceModel.create(
          {
            organizationId: orgId,
            invoiceNumber,
            shipmentId: shipment.id,
            customerId: shipment.customerId || null,
            dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            subTotal: baseFreight,
            taxAmount,
            totalAmount,
            status: 'UNPAID',
            invoiceType: 'CUSTOMER_BILLING',
          },
          { transaction },
        );

        await this.invoiceItemModel.create(
          {
            invoiceId: invoice.id,
            description: 'Standard Freight Transportation',
            quantity: 1,
            unitPrice: baseFreight,
            amount: baseFreight,
            totalAmount: baseFreight,
          },
          { transaction },
        );

        await this.invoiceItemModel.create(
          {
            invoiceId: invoice.id,
            description: 'Fuel Surcharge & Handling',
            quantity: 1,
            unitPrice: taxAmount,
            amount: taxAmount,
            totalAmount: taxAmount,
          },
          { transaction },
        );

        // 5. Notification
        await this.notificationModel.create(
          {
            organizationId: orgId,
            title: `POD Verified - Shipment ${shipment.shipmentNumber}`,
            message: `Delivered to ${data.receiverName}. Invoice ${invoiceNumber} generated.`,
            type: 'SUCCESS',
            channel: 'IN_APP',
          },
          { transaction },
        );
      }

      return pod;
    });
  }

  async getPOD(shipmentId: string) {
    const pod = await this.podModel.findOne({
      where: { shipmentId },
      include: [
        {
          model: ShipmentModel,
          include: [
            { model: CustomerModel },
            { model: DriverModel },
            { model: VehicleModel },
            {
              model: TransportOrderModel,
              include: [
                { model: LocationModel, as: 'originLocation' },
                { model: LocationModel, as: 'destinationLocation' },
              ],
            },
          ],
        },
      ],
    });
    if (!pod) throw new NotFoundException('Proof of Delivery not found for this shipment');
    return pod;
  }
}
