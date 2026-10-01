import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:shipment')
  handleJoinShipment(client: Socket, @MessageBody() shipmentId: string) {
    client.join(`shipment:${shipmentId}`);
    return { event: 'joined', shipmentId };
  }

  broadcastLocation(update: {
    shipmentId: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    eta?: string;
    status?: string;
  }) {
    // Broadcast to room and to all clients for live map
    this.server.emit('tracking:update', update);
    this.server.to(`shipment:${update.shipmentId}`).emit('shipment:telemetry', update);
  }

  broadcastGeofenceAlert(alert: {
    shipmentId: string;
    geofenceName: string;
    eventType: string;
    timestamp: string;
  }) {
    this.server.emit('geofence:alert', alert);
  }
}
