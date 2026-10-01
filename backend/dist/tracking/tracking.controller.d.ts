import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private trackingService;
    constructor(trackingService: TrackingService);
    getActiveFleetLocations(orgId: string): Promise<import("../database/models").VehicleModel[]>;
    getShipmentTracking(id: string): Promise<{
        shipment: import("../database/models").ShipmentModel;
        currentLocation: {
            latitude: number;
            longitude: number;
            speed: number;
        };
        remainingDistanceKm: number;
        etaTime: Date;
        etaMinutes: number;
        history: import("../database/models").TrackingEventModel[];
        geofenceAlerts: any[];
    }>;
    recordTelemetry(body: any): Promise<{
        event: import("../database/models").TrackingEventModel;
        remainingDistanceKm: number;
        etaTime: Date;
        etaMinutes: number;
    }>;
    getGeofences(orgId: string): Promise<import("../database/models").GeofenceModel[]>;
}
