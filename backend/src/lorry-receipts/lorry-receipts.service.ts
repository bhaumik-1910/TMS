import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  LorryReceiptModel,
  ShipmentModel,
  CustomerModel,
  VehicleModel,
  DriverModel,
  CarrierModel,
  TransportOrderModel,
  LocationModel,
  ShipmentItemModel,
  AuditLogModel,
} from '../database/models';

@Injectable()
export class LorryReceiptsService {
  constructor(
    @InjectModel(LorryReceiptModel)
    private readonly lrModel: typeof LorryReceiptModel,
  ) {}

  async findAll(organizationId?: string): Promise<any> {
    try {
      const records = await this.lrModel.findAll({
        include: [
          {
            model: ShipmentModel,
            required: false,
            include: [
              { model: CustomerModel, required: false },
              { model: VehicleModel, required: false },
              { model: DriverModel, required: false },
              {
                model: TransportOrderModel,
                required: false,
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      if (organizationId && organizationId !== 'SYSTEM') {
        return records.filter((lr: any) => {
          const org = lr.shipment?.transportOrder?.organizationId;
          return !org || org === organizationId;
        });
      }

      return records;
    } catch (err) {
      console.error('Error fetching lorry receipts:', err);
      try {
        return await this.lrModel.findAll({ order: [['createdAt', 'DESC']] });
      } catch (innerErr) {
        console.error('Fallback query error:', innerErr);
        return [];
      }
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const lr = await this.lrModel.findByPk(id, {
        include: [
          {
            model: ShipmentModel,
            required: false,
            include: [
              { model: CustomerModel, required: false },
              { model: VehicleModel, required: false },
              { model: DriverModel, required: false },
              { model: CarrierModel, required: false },
              {
                model: TransportOrderModel,
                required: false,
              },
            ],
          },
        ],
      });
      if (!lr) return await this.lrModel.findByPk(id);
      return lr;
    } catch (err) {
      console.error(`Error finding LR ${id}:`, err);
      return await this.lrModel.findByPk(id);
    }
  }

  async generateLR(data: {
    shipmentId: string;
    ewayBillNumber?: string;
    ewayBillExpiry?: Date;
    consignorName: string;
    consignorAddress?: string;
    consigneeName: string;
    consigneeAddress?: string;
    declaredValue?: number;
    billingTerms?: string;
    userId?: string;
    organizationId?: string;
  }) {
    let lr = await this.lrModel.findOne({ where: { shipmentId: data.shipmentId } });

    if (lr) {
      const oldVal = { consignorName: lr.consignorName, consigneeName: lr.consigneeName };
      await lr.update({
        consignorName: data.consignorName,
        consigneeName: data.consigneeName,
      });

      // Audit trail record inspired by Ops Framework entity_events
      if (data.organizationId) {
        await AuditLogModel.create({
          organizationId: data.organizationId,
          userId: data.userId,
          action: 'UPDATE',
          module: 'OPERATIONS',
          entityType: 'LorryReceipt',
          entityId: lr.id,
          oldValue: JSON.stringify(oldVal),
          newValue: JSON.stringify({ consignorName: data.consignorName, consigneeName: data.consigneeName }),
        } as any);
      }
    } else {
      // Deterministic sequential voucher numbering
      const totalCount = await this.lrModel.count();
      const currentYear = new Date().getFullYear();
      const sequenceValue = String(totalCount + 1).padStart(4, '0');
      const lrNumber = `LR-${currentYear}-${sequenceValue}`;

      lr = await this.lrModel.create({
        lrNumber,
        shipmentId: data.shipmentId,
        consignorName: data.consignorName,
        consigneeName: data.consigneeName,
        chargedWeightKg: 0,
        totalFreightAmount: data.declaredValue || 45000,
        status: 'ISSUED',
      });

      if (data.organizationId) {
        await AuditLogModel.create({
          organizationId: data.organizationId,
          userId: data.userId,
          action: 'CREATE',
          module: 'OPERATIONS',
          entityType: 'LorryReceipt',
          entityId: lr.id,
          newValue: JSON.stringify({ lrNumber, shipmentId: data.shipmentId, status: 'ISSUED' }),
        } as any);
      }
    }

    return this.findOne(lr.id);
  }
}
