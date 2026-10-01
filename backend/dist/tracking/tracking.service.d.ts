import { TrackingGateway } from './tracking.gateway';
import { ShipmentModel, VehicleModel, TrackingEventModel, GeofenceModel, GeofenceEventModel } from '../database/models';
export declare class TrackingService {
    private readonly shipmentModel;
    private readonly vehicleModel;
    private readonly trackingEventModel;
    private readonly geofenceModel;
    private readonly geofenceEventModel;
    private readonly trackingGateway;
    constructor(shipmentModel: typeof ShipmentModel, vehicleModel: typeof VehicleModel, trackingEventModel: typeof TrackingEventModel, geofenceModel: typeof GeofenceModel, geofenceEventModel: typeof GeofenceEventModel, trackingGateway: TrackingGateway);
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    calculateETA(remainingDistanceKm: number, currentSpeedKmh?: number): {
        etaTime: Date;
        minutes: number;
    };
    recordTelemetry(data: {
        shipmentId: string;
        vehicleId?: string;
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
    }): Promise<{
        event: TrackingEventModel;
        remainingDistanceKm: number;
        etaTime: Date;
        etaMinutes: number;
    }>;
    getShipmentTracking(shipmentId: string): Promise<{
        shipment: ShipmentModel;
        currentLocation: {
            latitude: number;
            longitude: number;
            speed: number;
        };
        remainingDistanceKm: number;
        etaTime: Date;
        etaMinutes: number;
        history: TrackingEventModel[];
        geofenceAlerts: any[];
    }>;
    getActiveFleetLocations(organizationId: string): Promise<VehicleModel[]>;
    getGeofences(organizationId: string): Promise<GeofenceModel[]>;
}
