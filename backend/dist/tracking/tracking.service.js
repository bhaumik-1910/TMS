"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const tracking_gateway_1 = require("./tracking.gateway");
const models_1 = require("../database/models");
let TrackingService = class TrackingService {
    constructor(shipmentModel, vehicleModel, trackingEventModel, geofenceModel, geofenceEventModel, trackingGateway) {
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.trackingEventModel = trackingEventModel;
        this.geofenceModel = geofenceModel;
        this.geofenceEventModel = geofenceEventModel;
        this.trackingGateway = trackingGateway;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    calculateETA(remainingDistanceKm, currentSpeedKmh = 60) {
        const speed = currentSpeedKmh > 10 ? currentSpeedKmh : 50;
        const hours = remainingDistanceKm / speed;
        const minutes = Math.round(hours * 60);
        const etaTime = new Date(Date.now() + minutes * 60 * 1000);
        return { etaTime, minutes };
    }
    async recordTelemetry(data) {
        const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
            include: [
                {
                    model: models_1.TransportOrderModel,
                    include: [{ model: models_1.LocationModel, as: 'destinationLocation' }],
                },
            ],
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        const vehicleId = data.vehicleId || shipment.vehicleId;
        const speed = data.speed ?? 65;
        const heading = data.heading ?? 90;
        const event = await this.trackingEventModel.create({
            shipmentId: data.shipmentId,
            vehicleId: vehicleId || null,
            latitude: data.latitude,
            longitude: data.longitude,
            speedKmH: speed,
            status: speed === 0 ? 'STOP' : 'NORMAL',
        });
        if (vehicleId) {
            await this.vehicleModel.update({
                currentLatitude: data.latitude,
                currentLongitude: data.longitude,
                currentSpeed: speed,
                lastLocationAt: new Date(),
            }, { where: { id: vehicleId } });
        }
        const dest = shipment.transportOrder?.destinationLocation;
        let distanceKm = 100;
        if (dest) {
            distanceKm = this.calculateDistance(data.latitude, data.longitude, dest.latitude, dest.longitude);
        }
        const { etaTime, minutes } = this.calculateETA(distanceKm, speed);
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
    async getShipmentTracking(shipmentId) {
        const shipment = await this.shipmentModel.findByPk(shipmentId, {
            include: [
                { model: models_1.VehicleModel },
                { model: models_1.DriverModel },
                { model: models_1.RouteModel },
                {
                    model: models_1.TransportOrderModel,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation' },
                        { model: models_1.LocationModel, as: 'destinationLocation' },
                    ],
                },
            ],
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
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
    async getActiveFleetLocations(organizationId) {
        const where = {
            status: { [sequelize_2.Op.in]: ['IN_TRANSIT', 'ASSIGNED', 'AVAILABLE', 'Active', 'ACTIVE'] },
        };
        if (organizationId && organizationId !== 'SYSTEM' && organizationId !== '00000000-0000-0000-0000-000000000001') {
            where.organizationId = organizationId;
        }
        let vehicles = await this.vehicleModel.findAll({
            where,
            include: [
                { model: models_1.VehicleTypeModel, required: false },
            ],
            order: [['currentSpeed', 'DESC']],
        });
        if (vehicles.length === 0) {
            delete where.organizationId;
            vehicles = await this.vehicleModel.findAll({
                include: [
                    { model: models_1.VehicleTypeModel, required: false },
                ],
                order: [['currentSpeed', 'DESC']],
            });
        }
        return vehicles;
    }
    async getGeofences(organizationId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        return this.geofenceModel.findAll({ where });
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.TrackingEventModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.GeofenceModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.GeofenceEventModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, tracking_gateway_1.TrackingGateway])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map