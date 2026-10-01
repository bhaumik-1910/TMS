import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import {
  DispatchModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  CarrierModel,
  TransportOrderModel,
  LocationModel,
  CustomerModel,
  TripExpenseModel,
  AuditLogModel,
} from '../database/models';

@Injectable()
export class DispatchService extends BaseSequelizeService<DispatchModel> {
  constructor(
    @InjectModel(DispatchModel)
    private readonly dispatchModel: typeof DispatchModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(DriverModel)
    private readonly driverModel: typeof DriverModel,
    @InjectModel(TripExpenseModel)
    private readonly tripExpenseModel: typeof TripExpenseModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
  ) {
    super(dispatchModel);
  }

  async findAll(organizationId?: string, status?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where['$shipment.transportOrder.organizationId$'] = organizationId;
    }
    if (status) where.status = status;

    return this.dispatchModel.findAll({
      where,
      include: [
        {
          model: ShipmentModel,
          required: false,
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
        },
        { model: VehicleModel, required: false },
        { model: DriverModel, required: false },
        { model: CarrierModel, required: false },
      ],
      order: [['dispatchTime', 'DESC']],
    });
  }

  async getDispatchBoard(organizationId: string) {
    const dispatches = await this.findAll(organizationId);

    const columns: Record<string, any[]> = {
      PLANNED: [],
      ASSIGNED: [],
      DISPATCHED: [],
      IN_TRANSIT: [],
      DELIVERY: [],
      COMPLETED: [],
    };

    dispatches.forEach((d) => {
      const col = columns[d.status] || columns.DISPATCHED;
      col.push(d);
    });

    return columns;
  }

  async create(organizationId: string, data: any, userId?: string) {
    return this.withTransaction(async (transaction) => {
      const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
        include: [{ model: TransportOrderModel }],
        transaction,
      });
      if (!shipment) throw new NotFoundException('Shipment not found');

      if (data.vehicleId) {
        const vehicle = await this.vehicleModel.findByPk(data.vehicleId, { transaction });
        if (vehicle && vehicle.capacityWeight < (shipment.totalWeight || 0)) {
          throw new BadRequestException('Vehicle capacity exceeded');
        }
        await this.vehicleModel.update(
          { status: 'ASSIGNED' },
          { where: { id: data.vehicleId }, transaction },
        );
      }

      if (data.driverId) {
        await this.driverModel.update(
          { status: 'ON_TRIP' },
          { where: { id: data.driverId }, transaction },
        );
      }

      await this.shipmentModel.update(
        {
          vehicleId: data.vehicleId || null,
          driverId: data.driverId || null,
          carrierId: data.carrierId || null,
          status: 'DISPATCHED',
        },
        { where: { id: data.shipmentId }, transaction },
      );

      const dispatchNumber = `DSP-${Date.now().toString().slice(-6)}`;
      const dispatch = await this.dispatchModel.create(
        {
          dispatchNumber,
          shipmentId: data.shipmentId,
          vehicleId: data.vehicleId || null,
          driverId: data.driverId || null,
          carrierId: data.carrierId || null,
          dispatchTime: new Date(),
          status: 'DISPATCHED',
        },
        { transaction },
      );

      if (userId) {
        await this.auditLogModel.create(
          {
            organizationId,
            userId,
            action: 'DISPATCH_CREATED',
            module: 'dispatch',
            entityType: 'Dispatch',
            entityId: dispatch.id,
            newValue: JSON.stringify({ dispatchNumber, shipmentId: data.shipmentId }),
          },
          { transaction },
        );
      }

      return this.dispatchModel.findByPk(dispatch.id, {
        include: [
          { model: ShipmentModel },
          { model: VehicleModel },
          { model: DriverModel },
          { model: CarrierModel },
        ],
        transaction,
      });
    });
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const dispatch = await this.dispatchModel.findByPk(id, {
      include: [{ model: ShipmentModel }],
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const updateData: any = { status };

    return this.withTransaction(async (transaction) => {
      if (status === 'COMPLETED') {
        updateData.completeTime = new Date();
        if (dispatch.vehicleId) {
          await this.vehicleModel.update(
            { status: 'AVAILABLE' },
            { where: { id: dispatch.vehicleId }, transaction },
          );
        }
        if (dispatch.driverId) {
          await this.driverModel.update(
            { status: 'AVAILABLE' },
            { where: { id: dispatch.driverId }, transaction },
          );
        }
        if (dispatch.shipmentId) {
          await this.shipmentModel.update(
            { status: 'DELIVERED', actualDelivery: new Date() },
            { where: { id: dispatch.shipmentId }, transaction },
          );
        }
      } else if (status === 'IN_TRANSIT') {
        if (dispatch.shipmentId) {
          await this.shipmentModel.update(
            { status: 'IN_TRANSIT', actualPickup: new Date() },
            { where: { id: dispatch.shipmentId }, transaction },
          );
        }
      }

      await dispatch.update(updateData, { transaction });

      return this.dispatchModel.findByPk(id, {
        include: [
          { model: ShipmentModel },
          { model: VehicleModel },
          { model: DriverModel },
        ],
        transaction,
      });
    });
  }

  async addTripExpense(dispatchId: string, data: any) {
    const expense = await this.tripExpenseModel.create({
      dispatchId,
      expenseType: data.expenseType || 'FUEL',
      amount: parseFloat(data.amount) || 0.0,
      receiptUrl: data.receiptUrl || null,
      status: 'APPROVED',
    });

    const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
    const total = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const dispatch = await this.findById(dispatchId);
    await dispatch.update({ tripExpenseTotal: total });

    return expense;
  }

  async getTripExpenses(dispatchId: string) {
    return this.tripExpenseModel.findAll({
      where: { dispatchId },
      order: [['createdAt', 'DESC']],
    });
  }

  async closeTrip(dispatchId: string, data: {
    startOdometer: number;
    endOdometer: number;
    fuelLitres: number;
    driverAllowance: number;
  }) {
    const dispatch = await this.dispatchModel.findByPk(dispatchId);
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const totalKm = Math.max(0, data.endOdometer - data.startOdometer);
    const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
    const existingExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = existingExpenses + (data.driverAllowance || 0);

    await dispatch.update({
      startOdometer: data.startOdometer,
      endOdometer: data.endOdometer,
      totalKm,
      fuelLitres: data.fuelLitres,
      tripExpenseTotal: totalExpenses,
      driverSettlementAmount: data.driverAllowance || 350,
      closureStatus: 'SETTLED',
      status: 'COMPLETED',
      completeTime: new Date(),
    });

    return this.dispatchModel.findByPk(dispatchId, {
      include: [
        { model: ShipmentModel },
        { model: VehicleModel },
        { model: DriverModel },
      ],
    });
  }
}
