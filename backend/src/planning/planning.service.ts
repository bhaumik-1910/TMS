import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  TransportOrderModel,
  CustomerModel,
  LocationModel,
  OrderItemModel,
  VehicleModel,
  VehicleTypeModel,
  DriverAssignmentModel,
  DriverModel,
  ShipmentModel,
  LoadPlanModel,
} from '../database/models';

@Injectable()
export class PlanningService {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(LoadPlanModel)
    private readonly loadPlanModel: typeof LoadPlanModel,
  ) {}

  async getPlannerWorkspace(organizationId: string) {
    const orderWhere: any = {
      status: { [Op.in]: ['SUBMITTED', 'CONFIRMED'] },
    };
    if (organizationId && organizationId !== 'SYSTEM') {
      orderWhere.organizationId = organizationId;
    }

    // 1. Unplanned/pending orders
    const unplannedOrders = await this.orderModel.findAll({
      where: orderWhere,
      include: [
        { model: CustomerModel, required: false },
        { model: LocationModel, as: 'originLocation', required: false },
        { model: LocationModel, as: 'destinationLocation', required: false },
        { model: OrderItemModel, required: false },
      ],
      order: [['requestedPickupDate', 'ASC']],
    });

    // 2. Available vehicles and capacity
    const vehicleWhere: any = { status: 'AVAILABLE' };
    if (organizationId && organizationId !== 'SYSTEM') {
      vehicleWhere.organizationId = organizationId;
    }

    const availableVehicles = await this.vehicleModel.findAll({
      where: vehicleWhere,
      include: [
        { model: VehicleTypeModel, required: false },
        {
          model: DriverAssignmentModel,
          required: false,
          where: { status: 'ACTIVE' },
          include: [{ model: DriverModel, required: false }],
        },
      ],
    });

    // 3. Planned shipments needing dispatch
    const shipmentWhere: any = { status: 'PLANNED' };
    if (organizationId && organizationId !== 'SYSTEM') {
      shipmentWhere['$transportOrder.organizationId$'] = organizationId;
    }

    const plannedShipments = await this.shipmentModel.findAll({
      where: shipmentWhere,
      include: [
        { model: CustomerModel, required: false },
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
      ],
    });

    return {
      unplannedOrders: unplannedOrders.map((o) => {
        const plain = o.get({ plain: true });
        return { ...plain, orderItems: plain.items || [] };
      }),
      availableVehicles,
      plannedShipments,
    };
  }

  async optimizeLoad(organizationId: string, vehicleId: string, orderIds: string[]) {
    const vehicle = await this.vehicleModel.findByPk(vehicleId, {
      include: [{ model: VehicleTypeModel, required: false }],
    });
    if (!vehicle) throw new BadRequestException('Vehicle not found');

    const orders = await this.orderModel.findAll({
      where: { id: { [Op.in]: orderIds } },
    });

    const totalWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0);
    const totalVolume = orders.reduce((sum, o) => sum + (o.totalVolume || 0), 0);

    const capWeight = vehicle.capacityWeight || 25000.0;
    const capVol = vehicle.capacityVolume || 80.0;

    const weightUtilization = Math.round((totalWeight / capWeight) * 100);
    const volumeUtilization = Math.round((totalVolume / capVol) * 100);

    if (totalWeight > capWeight) {
      throw new BadRequestException(
        `Load exceeds vehicle weight capacity: ${totalWeight}kg > ${capWeight}kg (${weightUtilization}%)`,
      );
    }

    if (totalVolume > capVol) {
      throw new BadRequestException(
        `Load exceeds vehicle volume capacity: ${totalVolume}m³ > ${capVol}m³ (${volumeUtilization}%)`,
      );
    }

    // Create LoadPlan
    const planNumber = `LP-${Date.now().toString().slice(-6)}`;
    const plan = await this.loadPlanModel.create({
      planNumber,
      vehicleId,
      plannedWeightKg: totalWeight,
      plannedVolumeCbm: totalVolume,
      weightUtilizationPercent: weightUtilization,
      volumeUtilizationPercent: volumeUtilization,
      status: 'OPTIMIZED',
    });

    return {
      loadPlan: plan,
      vehicle: {
        id: vehicle.id,
        number: vehicle.vehicleNumber,
        capacityWeight: capWeight,
        capacityVolume: capVol,
      },
      metrics: {
        totalWeight,
        totalVolume,
        weightUtilization,
        volumeUtilization,
        ordersCount: orders.length,
      },
    };
  }
}
