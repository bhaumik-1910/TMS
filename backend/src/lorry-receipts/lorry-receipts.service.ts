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
import { OpsRunnerService } from '../framework/ops/ops-runner.service';
import { DocumentSequenceService } from '../foundation/document-sequences/document-sequence.service';
import { checkPeriodLockStep } from './ops/save/010-check-period-lock';
import { checkCreditLimitStep } from './ops/save/020-check-credit-limit';

@Injectable()
export class LorryReceiptsService {
  constructor(
    @InjectModel(LorryReceiptModel)
    private readonly lrModel: typeof LorryReceiptModel,
    private readonly opsRunner: OpsRunnerService,
    private readonly sequenceService: DocumentSequenceService,
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
    lrNumber?: string;
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
    branchId?: number;
    lrDate?: string;
  }) {
    const orgId = data.organizationId || '1';

    return this.opsRunner.run({
      resource: 'LorryReceipt',
      op: 'generate',
      user: {
        id: data.userId || '1',
        organizationId: orgId,
        branchId: data.branchId,
      },
      data,
      steps: [checkPeriodLockStep, checkCreditLimitStep],
      execute: async (c) => {
        let lr = await this.lrModel.findOne({
          where: { shipmentId: data.shipmentId },
          transaction: c.t,
        });

        if (lr) {
          c.state.existingRecord = lr.toJSON();
          await lr.update(
            {
              consignorName: data.consignorName,
              consigneeName: data.consigneeName,
            },
            { transaction: c.t },
          );
        } else {
          // Gap-free atomic numbering from Ankpal DocumentSequenceService
          const lrNumber =
            data.lrNumber ||
            (await this.sequenceService.next(c.organizationId, 'lr', data.lrDate, c.t));

          lr = await this.lrModel.create(
            {
              lrNumber,
              shipmentId: data.shipmentId,
              consignorName: data.consignorName,
              consigneeName: data.consigneeName,
              chargedWeightKg: 0,
              totalFreightAmount: data.declaredValue || 45000,
              status: 'ISSUED',
            },
            { transaction: c.t },
          );
        }

        return lr;
      },
    });
  }
}
