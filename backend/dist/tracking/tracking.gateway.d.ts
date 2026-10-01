import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinShipment(client: Socket, shipmentId: string): {
        event: string;
        shipmentId: string;
    };
    broadcastLocation(update: {
        shipmentId: string;
        vehicleId: string;
        latitude: number;
        longitude: number;
        speed: number;
        heading: number;
        eta?: string;
        status?: string;
    }): void;
    broadcastGeofenceAlert(alert: {
        shipmentId: string;
        geofenceName: string;
        eventType: string;
        timestamp: string;
    }): void;
}
