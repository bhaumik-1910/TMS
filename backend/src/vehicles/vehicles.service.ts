import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import {
  VehicleModel,
  VehicleTypeModel,
  VehicleMaintenanceModel,
  VehicleDocumentModel,
  DriverModel,
  DriverAssignmentModel,
} from '../database/models';

@Injectable()
export class VehiclesService extends BaseSequelizeService<VehicleModel> {
  constructor(
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(VehicleMaintenanceModel)
    private readonly maintenanceModel: typeof VehicleMaintenanceModel,
  ) {
    super(vehicleModel);
  }

  async findAll(organizationId?: string, status?: string): Promise<any> {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    if (status) {
      where.status = status;
    }

    const vehicles = await this.vehicleModel.findAll({
      where,
      include: [
        { model: VehicleTypeModel, required: false },
        {
          model: DriverAssignmentModel,
          required: false,
          where: { status: 'ACTIVE' },
          include: [{ model: DriverModel, required: false }],
        },
        { model: VehicleMaintenanceModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return vehicles.map((v) => {
      const plain = v.get({ plain: true });
      return {
        ...plain,
        _count: {
          shipments: 0,
          maintenanceRecords: plain.maintenances ? plain.maintenances.length : 0,
        },
      };
    });
  }

  override async findOne(id: any): Promise<any> {
    if (typeof id === 'string') {
      const vehicle = await this.vehicleModel.findByPk(id, {
        include: [
          { model: VehicleTypeModel, required: false },
          { model: VehicleDocumentModel, required: false },
          { model: VehicleMaintenanceModel, required: false },
          {
            model: DriverAssignmentModel,
            required: false,
            include: [{ model: DriverModel, required: false }],
          },
        ],
      });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
      const plain = vehicle.get({ plain: true });
      return {
        ...plain,
        maintenanceRecords: plain.maintenances || [],
        shipments: [],
      };
    }
    return super.findOne(id);
  }

  override async create(organizationIdOrData: any, body?: any): Promise<any> {
    const organizationId = typeof organizationIdOrData === 'string' ? organizationIdOrData : organizationIdOrData.organizationId;
    const data = body || organizationIdOrData;

    return this.vehicleModel.create({
      organizationId,
      vehicleTypeId: data.vehicleTypeId || null,
      carrierId: data.carrierId || null,
      vehicleNumber: data.vehicleNumber,
      make: data.make,
      model: data.model,
      year: parseInt(data.year || '2023', 10),
      vin: data.vin || null,
      capacityWeight: parseFloat(data.capacityWeight) || 25000.0,
      capacityVolume: parseFloat(data.capacityVolume) || 80.0,
      fuelType: data.fuelType || 'DIESEL',
      status: data.status || 'AVAILABLE',
      currentLatitude: data.currentLatitude ? parseFloat(data.currentLatitude) : 37.7749,
      currentLongitude: data.currentLongitude ? parseFloat(data.currentLongitude) : -122.4194,
      currentSpeed: 0,
      lastLocationAt: new Date(),
    });
  }

  async updateLocation(id: string, lat: number, lng: number, speed: number = 0) {
    const vehicle = await this.findById(id);
    return vehicle.update({
      currentLatitude: lat,
      currentLongitude: lng,
      currentSpeed: speed,
      lastLocationAt: new Date(),
    });
  }

  async addMaintenance(vehicleId: string, data: any) {
    return this.maintenanceModel.create({
      vehicleId,
      maintenanceType: data.serviceType || data.maintenanceType || 'REGULAR_SERVICE',
      scheduledDate: new Date(data.serviceDate || Date.now()),
      completedDate: data.status === 'COMPLETED' ? new Date() : null,
      cost: parseFloat(data.cost) || 0.0,
      status: data.status || 'COMPLETED',
      notes: data.notes || null,
    });
  }

  async remove(id: string) {
    return this.delete(id);
  }
}
