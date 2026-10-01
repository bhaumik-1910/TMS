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
} from '../database/models';

@Injectable()
export class LorryReceiptsService {
  constructor(
    @InjectModel(LorryReceiptModel)
    private readonly lrModel: typeof LorryReceiptModel,
  ) {}

  async findAll(organizationId?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where['$shipment.transportOrder.organizationId$'] = organizationId;
    }

    return this.lrModel.findAll({
      where,
      include: [
        {
          model: ShipmentModel,
          include: [
            { model: CustomerModel, required: false },
            { model: VehicleModel, required: false },
            { model: DriverModel, required: false },
            {
              model: TransportOrderModel,
              required: false,
              include: [
                { model: LocationModel, as: 'originLocation', required: false },
                { model: LocationModel, as: 'destinationLocation', required: false },
              ],
            },
            { model: ShipmentItemModel, required: false },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<any> {
    const lr = await this.lrModel.findByPk(id, {
      include: [
        {
          model: ShipmentModel,
          include: [
            { model: CustomerModel, required: false },
            { model: VehicleModel, required: false },
            { model: DriverModel, required: false },
            { model: CarrierModel, required: false },
            {
              model: TransportOrderModel,
              required: false,
              include: [
                { model: LocationModel, as: 'originLocation', required: false },
                { model: LocationModel, as: 'destinationLocation', required: false },
              ],
            },
            { model: ShipmentItemModel, required: false },
          ],
        },
      ],
    });
    if (!lr) throw new NotFoundException('Lorry receipt not found');
    return lr;
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
  }) {
    const lrNumber = `LR-${Date.now().toString().slice(-6)}`;

    let lr = await this.lrModel.findOne({ where: { shipmentId: data.shipmentId } });
    if (lr) {
      await lr.update({
        consignorName: data.consignorName,
        consigneeName: data.consigneeName,
      });
    } else {
      lr = await this.lrModel.create({
        lrNumber,
        shipmentId: data.shipmentId,
        consignorName: data.consignorName,
        consigneeName: data.consigneeName,
        chargedWeightKg: 0,
        totalFreightAmount: data.declaredValue || 45000,
        status: 'ISSUED',
      });
    }

    return this.findOne(lr.id);
  }
}
