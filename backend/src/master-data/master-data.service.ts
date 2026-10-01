import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  LocationModel,
  LocationTypeModel,
  VehicleTypeModel,
  CargoTypeModel,
  PackageTypeModel,
} from '../database/models';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectModel(LocationModel)
    private readonly locationModel: typeof LocationModel,
    @InjectModel(LocationTypeModel)
    private readonly locationTypeModel: typeof LocationTypeModel,
    @InjectModel(VehicleTypeModel)
    private readonly vehicleTypeModel: typeof VehicleTypeModel,
    @InjectModel(CargoTypeModel)
    private readonly cargoTypeModel: typeof CargoTypeModel,
    @InjectModel(PackageTypeModel)
    private readonly packageTypeModel: typeof PackageTypeModel,
  ) {}

  async getLocations(organizationId: string) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    return this.locationModel.findAll({
      where,
      include: [{ model: LocationTypeModel }],
      order: [['name', 'ASC']],
    });
  }

  async createLocation(organizationId: string, data: any) {
    return this.locationModel.create({
      organizationId,
      locationTypeId: data.locationTypeId || null,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country || 'USA',
      postalCode: data.postalCode,
      latitude: parseFloat(data.latitude) || 0.0,
      longitude: parseFloat(data.longitude) || 0.0,
    });
  }

  async getLocationTypes() {
    return this.locationTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async getVehicleTypes() {
    return this.vehicleTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async getCargoTypes() {
    return this.cargoTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async getPackageTypes() {
    return this.packageTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }
}
