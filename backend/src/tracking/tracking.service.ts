import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TrackingGateway } from './tracking.gateway';
import {
  ShipmentModel,
  VehicleModel,
  TransportOrderModel,
  LocationModel,
  TrackingEventModel,
  GeofenceModel,
  GeofenceEventModel,
  CustomerModel,
  DriverModel,
  RouteModel,
  VehicleTypeModel,
} from '../database/models';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(TrackingEventModel)
    private readonly trackingEventModel: typeof TrackingEventModel,
    @InjectModel(GeofenceModel)
    private readonly geofenceModel: typeof GeofenceModel,
    @InjectModel(GeofenceEventModel)
    private readonly geofenceEventModel: typeof GeofenceEventModel,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  // Haversine formula to compute distance between two coords in km
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate dynamic ETA based on speed, remaining distance
  calculateETA(remainingDistanceKm: number, currentSpeedKmh: number = 60): { etaTime: Date; minutes: number } {
    const speed = currentSpeedKmh > 10 ? currentSpeedKmh : 50;
    const hours = remainingDistanceKm / speed;
    const minutes = Math.round(hours * 60);
    const etaTime = new Date(Date.now() + minutes * 60 * 1000);
    return { etaTime, minutes };
  }

  async recordTelemetry(data: {
    shipmentId: string;
    vehicleId?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  }) {
    const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
      include: [
        {
          model: TransportOrderModel,
          include: [{ model: LocationModel, as: 'destinationLocation' }],
        },
      ],
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    const vehicleId = data.vehicleId || shipment.vehicleId;
    const speed = data.speed ?? 65;
    const heading = data.heading ?? 90;

    // 1. Save tracking event
    const event = await this.trackingEventModel.create({
      shipmentId: data.shipmentId,
      vehicleId: vehicleId || null,
      latitude: data.latitude,
      longitude: data.longitude,
      speedKmH: speed,
      status: speed === 0 ? 'STOP' : 'NORMAL',
    });

    // 2. Update vehicle current position
    if (vehicleId) {
      await this.vehicleModel.update(
        {
          currentLatitude: data.latitude,
          currentLongitude: data.longitude,
          currentSpeed: speed,
          lastLocationAt: new Date(),
        },
        { where: { id: vehicleId } },
      );
    }

    // 3. Compute remaining distance to destination and dynamic ETA
    const dest = shipment.transportOrder?.destinationLocation;
    let distanceKm = 100;
    if (dest) {
      distanceKm = this.calculateDistance(
        data.latitude,
        data.longitude,
        dest.latitude,
        dest.longitude,
      );
    }
    const { etaTime, minutes } = this.calculateETA(distanceKm, speed);

    // 4. Check Geofences
    const orgId = shipment.transportOrder?.organizationId;
    if (orgId) {
      const geofences = await this.geofenceModel.findAll({ where: { organizationId: orgId } });

      for (const gf of geofences) {
        const distMeters = this.calculateDistance(data.latitude, data.longitude, gf.centerLatitude, gf.centerLongitude) * 1000;
        if (distMeters <= (gf.radiusMeters || 500)) {
          await this.geofenceEventModel.create({
            geofenceId: gf.id,
            vehicleId: vehicleId || null,
            eventType: 'ENTER',
          });

          this.trackingGateway.broadcastGeofenceAlert({
            shipmentId: data.shipmentId,
            geofenceName: gf.name,
            eventType: 'ENTERED',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Broadcast live telemetry via WebSocket
    this.trackingGateway.broadcastLocation({
      shipmentId: data.shipmentId,
      vehicleId: vehicleId || '',
      latitude: data.latitude,
      longitude: data.longitude,
      speed,
      heading,
      eta: etaTime.toISOString(),
      status: shipment.status,
    });

    return {
      event,
      remainingDistanceKm: Math.round(distanceKm * 10) / 10,
      etaTime,
      etaMinutes: minutes,
    };
  }

  async getShipmentTracking(shipmentId: string) {
    const shipment = await this.shipmentModel.findByPk(shipmentId, {
      include: [
        { model: VehicleModel },
        { model: DriverModel },
        { model: RouteModel },
        {
          model: TransportOrderModel,
          include: [
            { model: LocationModel, as: 'originLocation' },
            { model: LocationModel, as: 'destinationLocation' },
          ],
        },
      ],
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    const trackingEvents = await this.trackingEventModel.findAll({
      where: { shipmentId },
      order: [['timestamp', 'ASC']],
    });

    const currentLat = shipment.vehicle?.currentLatitude || shipment.transportOrder?.originLocation?.latitude || 37.7749;
    const currentLng = shipment.vehicle?.currentLongitude || shipment.transportOrder?.originLocation?.longitude || -122.4194;
    const dest = shipment.transportOrder?.destinationLocation;

    let remainingDistanceKm = 100;
    if (dest) {
      remainingDistanceKm = this.calculateDistance(currentLat, currentLng, dest.latitude, dest.longitude);
    }
    const { etaTime, minutes } = this.calculateETA(remainingDistanceKm, shipment.vehicle?.currentSpeed || 60);

    return {
      shipment,
      currentLocation: {
        latitude: currentLat,
        longitude: currentLng,
        speed: shipment.vehicle?.currentSpeed || 0,
      },
      remainingDistanceKm: Math.round(remainingDistanceKm * 10) / 10,
      etaTime,
      etaMinutes: minutes,
      history: trackingEvents,
      geofenceAlerts: [],
    };
  }

  async getActiveFleetLocations(organizationId: string) {
    const where: any = {
      status: { [Op.in]: ['IN_TRANSIT', 'ASSIGNED', 'AVAILABLE'] },
    };
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }

    return this.vehicleModel.findAll({
      where,
      include: [
        { model: VehicleTypeModel, required: false },
      ],
    });
  }

  async getGeofences(organizationId: string) {
    const where: any = {};
    if (organizationId && organizationId !== 'SYSTEM') {
      where.organizationId = organizationId;
    }
    return this.geofenceModel.findAll({ where });
  }
}
