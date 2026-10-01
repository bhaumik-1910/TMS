import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RouteModel, RouteStopModel, LocationModel, ShipmentModel } from '../database/models';

@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(RouteModel)
    private readonly routeModel: typeof RouteModel,
    @InjectModel(RouteStopModel)
    private readonly routeStopModel: typeof RouteStopModel,
  ) {}

  async findAll(organizationId?: string): Promise<any> {
    const routes = await this.routeModel.findAll({
      include: [
        {
          model: RouteStopModel,
          required: false,
          include: [{ model: LocationModel, required: false }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return routes.map((r) => {
      const plain = r.get({ plain: true });
      return {
        ...plain,
        routeStops: plain.stops || [],
      };
    });
  }

  async findOne(id: string): Promise<any> {
    const route = await this.routeModel.findByPk(id, {
      include: [
        {
          model: RouteStopModel,
          required: false,
          include: [{ model: LocationModel, required: false }],
        },
      ],
    });
    if (!route) throw new NotFoundException('Route not found');
    const plain = route.get({ plain: true });
    return {
      ...plain,
      routeStops: plain.stops || [],
    };
  }

  async create(organizationId: string, data: any) {
    const route = await this.routeModel.create({
      shipmentId: data.shipmentId || null,
      routeName: data.routeName || `Route-${Date.now().toString().slice(-4)}`,
      totalDistanceKm: parseFloat(data.totalDistance || data.totalDistanceKm || '0'),
      estimatedDurationMinutes: parseInt(data.estimatedDuration || data.estimatedDurationMinutes || '0', 10),
      geometryPolyline: data.geometryPolyline || null,
    });

    if (data.stops && Array.isArray(data.stops)) {
      for (let i = 0; i < data.stops.length; i++) {
        const s = data.stops[i];
        await this.routeStopModel.create({
          routeId: route.id,
          locationId: s.locationId,
          stopSequence: i + 1,
          stopType: s.stopType || 'PICKUP',
        });
      }
    }

    return this.findOne(route.id);
  }
}
