import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import {
  TransportOrderModel,
  OrderItemModel,
  CustomerModel,
  LocationModel,
  ShipmentModel,
  ShipmentItemModel,
  CarrierModel,
  VehicleModel,
  DriverModel,
  DispatchModel,
  UserModel,
  AuditLogModel,
} from '../database/models';

@Injectable()
export class OrdersService extends BaseSequelizeService<TransportOrderModel> {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(OrderItemModel)
    private readonly orderItemModel: typeof OrderItemModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(ShipmentItemModel)
    private readonly shipmentItemModel: typeof ShipmentItemModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
  ) {
    super(orderModel);
  }

  async findAll(organizationId?: string, status?: string, customerId?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const orders = await this.orderModel.findAll({
      where,
      include: [
        { model: CustomerModel, required: false },
        { model: LocationModel, as: 'originLocation', required: false },
        { model: LocationModel, as: 'destinationLocation', required: false },
        { model: OrderItemModel, required: false },
        { model: ShipmentModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return orders.map((o) => {
      const plain = o.get({ plain: true });
      return {
        ...plain,
        orderItems: plain.items || [],
      };
    });
  }

  override async findOne(id: any): Promise<any> {
    if (typeof id === 'string') {
      const order = await this.orderModel.findByPk(id, {
        include: [
          { model: CustomerModel, required: false },
          { model: LocationModel, as: 'originLocation', required: false },
          { model: LocationModel, as: 'destinationLocation', required: false },
          { model: OrderItemModel, required: false },
          {
            model: ShipmentModel,
            required: false,
            include: [
              { model: CarrierModel, required: false },
              { model: VehicleModel, required: false },
              { model: DriverModel, required: false },
              { model: DispatchModel, required: false },
            ],
          },
        ],
      });
      if (!order) throw new NotFoundException('Transport order not found');
      const plain = order.get({ plain: true });
      return {
        ...plain,
        orderItems: plain.items || [],
      };
    }
    return super.findOne(id);
  }

  async create(organizationId: string, userId: string, data: any) {
    let totalWeight = 0;
    let totalVolume = 0;
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        totalWeight += (parseFloat(item.weight) || 0) * (parseInt(item.quantity, 10) || 1);
        totalVolume += (parseFloat(item.volume) || 0) * (parseInt(item.quantity, 10) || 1);
      });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    return this.withTransaction(async (transaction) => {
      const order = await this.orderModel.create(
        {
          organizationId,
          orderNumber,
          customerId: data.customerId,
          priority: data.priority || 'NORMAL',
          status: data.status || 'SUBMITTED',
          requestedPickupDate: new Date(data.requestedPickupDate || Date.now() + 24 * 3600 * 1000),
          requestedDeliveryDate: new Date(data.requestedDeliveryDate || Date.now() + 72 * 3600 * 1000),
          originLocationId: data.originLocationId,
          destinationLocationId: data.destinationLocationId,
          totalWeight,
          totalVolume,
          specialInstructions: data.specialInstructions,
          createdBy: userId,
        },
        { transaction },
      );

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await this.orderItemModel.create(
            {
              transportOrderId: order.id,
              description: item.description || 'General Cargo',
              quantity: parseInt(item.quantity, 10) || 1,
              weight: parseFloat(item.weight) || 100,
              volume: parseFloat(item.volume) || 1.5,
              packageTypeId: item.packageTypeId || null,
              packageType: item.packageType || 'Pallet',
              cargoTypeId: item.cargoTypeId || null,
              fragile: Boolean(item.fragile),
              hazardous: Boolean(item.hazardous),
            },
            { transaction },
          );
        }
      }

      await this.auditLogModel.create(
        {
          organizationId,
          userId,
          action: 'ORDER_CREATED',
          module: 'orders',
          entityType: 'TransportOrder',
          entityId: order.id,
          newValue: JSON.stringify({ orderNumber: order.orderNumber, customerId: order.customerId }),
        },
        { transaction },
      );

      return this.findOne(order.id);
    });
  }

  async updateStatus(id: string, newStatus: string, userId?: string) {
    const order = await this.findOne(id);
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PLANNED', 'CANCELLED'],
      PLANNED: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED'],
      DELIVERED: ['CLOSED'],
      CANCELLED: [],
      CLOSED: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }

    return this.withTransaction(async (transaction) => {
      const orderRecord = await this.findById(id);
      await orderRecord.update({ status: newStatus }, { transaction });

      // If status changed to CONFIRMED or PLANNED and no shipment exists, create shipment
      if (newStatus === 'CONFIRMED' || newStatus === 'PLANNED') {
        const existingShipment = await this.shipmentModel.findOne({
          where: { transportOrderId: id },
          transaction,
        });

        if (!existingShipment) {
          const shipmentNumber = `SHP-${Date.now().toString().slice(-6)}`;
          const shipment = await this.shipmentModel.create(
            {
              shipmentNumber,
              transportOrderId: id,
              customerId: order.customerId,
              status: 'PLANNED',
              totalWeight: order.totalWeight,
              totalVolume: order.totalVolume,
              plannedPickup: order.requestedPickupDate,
              plannedDelivery: order.requestedDeliveryDate,
            },
            { transaction },
          );

          const items = order.orderItems || order.items || [];
          for (const item of items) {
            await this.shipmentItemModel.create(
              {
                shipmentId: shipment.id,
                orderItemId: item.id,
                allocatedQuantity: item.quantity || 1,
              },
              { transaction },
            );
          }
        }
      }

      if (userId) {
        await this.auditLogModel.create(
          {
            organizationId: order.organizationId,
            userId,
            action: 'ORDER_STATUS_UPDATED',
            module: 'orders',
            entityType: 'TransportOrder',
            entityId: id,
            oldValue: order.status,
            newValue: newStatus,
          },
          { transaction },
        );
      }

      return orderRecord;
    });
  }
}
