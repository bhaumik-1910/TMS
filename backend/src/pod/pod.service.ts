import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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
} from '../database/models';

@Injectable()
export class PodService {
  constructor(
    @InjectModel(ProofOfDeliveryModel)
    private readonly podModel: typeof ProofOfDeliveryModel,
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
