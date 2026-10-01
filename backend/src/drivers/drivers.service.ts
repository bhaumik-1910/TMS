import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import {
  DriverModel,
  DriverDocumentModel,
  DriverAssignmentModel,
  VehicleModel,
  DispatchModel,
  ShipmentModel,
  CustomerModel,
  TransportOrderModel,
  LocationModel,
  ShipmentItemModel,
  RouteModel,
  RouteStopModel,
  ProofOfDeliveryModel,
} from '../database/models';

@Injectable()
export class DriversService extends BaseSequelizeService<DriverModel> {
  constructor(
    @InjectModel(DriverModel)
    private readonly driverModel: typeof DriverModel,
    @InjectModel(DispatchModel)
    private readonly dispatchModel: typeof DispatchModel,
  ) {
    super(driverModel);
  }

  async findAll(organizationId?: string, status?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (status) {
      where.status = status;
    }

    const drivers = await this.driverModel.findAll({
      where,
      include: [
        {
          model: DriverAssignmentModel,
          required: false,
          where: { status: 'ACTIVE' },
          include: [{ model: VehicleModel, required: false }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return drivers.map((d) => {
      const plain = d.get({ plain: true });
      return {
        ...plain,
        _count: {
          shipments: 0,
          dispatches: 0,
        },
      };
    });
  }

  override async findOne(id: any): Promise<any> {
    if (typeof id === 'string') {
      const driver = await this.driverModel.findByPk(id, {
        include: [
          { model: DriverDocumentModel, required: false },
          {
            model: DriverAssignmentModel,
            required: false,
            include: [{ model: VehicleModel, required: false }],
          },
        ],
      });
      if (!driver) throw new NotFoundException('Driver not found');
      const plain = driver.get({ plain: true });
      return {
        ...plain,
        dispatches: [],
      };
    }
    return super.findOne(id);
  }

  async getDriverActiveTrip(driverId: string) {
    const dispatch = await this.dispatchModel.findOne({
      where: {
        driverId,
        status: {
          [Op.in]: ['ASSIGNED', 'DISPATCHED', 'DRIVER_ACCEPTED', 'PICKUP', 'IN_TRANSIT'],
        },
      },
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
            { model: ShipmentItemModel, required: false },
            {
              model: RouteModel,
              required: false,
              include: [{ model: RouteStopModel, required: false, include: [LocationModel] }],
            },
            { model: ProofOfDeliveryModel, required: false },
          ],
        },
        { model: VehicleModel, required: false },
      ],
      order: [['dispatchTime', 'DESC']],
    });

    return dispatch;
  }

  override async create(organizationIdOrData: any, body?: any): Promise<any> {
    const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
    const data = body || organizationIdOrData;

    return this.driverModel.create({
      organizationId,
      employeeCode: data.employeeCode || `DRV-${Date.now().toString().slice(-4)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || null,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry || Date.now() + 365 * 24 * 3600 * 1000),
      status: data.status || 'AVAILABLE',
    });
  }

  async remove(id: string) {
    return this.delete(id);
  }
}
