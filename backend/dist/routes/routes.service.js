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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const models_1 = require("../database/models");
let RoutesService = class RoutesService {
    constructor(routeModel, routeStopModel) {
        this.routeModel = routeModel;
        this.routeStopModel = routeStopModel;
    }
    async findAll(organizationId) {
        const routes = await this.routeModel.findAll({
            include: [
                {
                    model: models_1.RouteStopModel,
                    required: false,
                    include: [{ model: models_1.LocationModel, required: false }],
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
    async findOne(id) {
        const route = await this.routeModel.findByPk(id, {
            include: [
                {
                    model: models_1.RouteStopModel,
                    required: false,
                    include: [{ model: models_1.LocationModel, required: false }],
                },
            ],
        });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        const plain = route.get({ plain: true });
        return {
            ...plain,
            routeStops: plain.stops || [],
        };
    }
    async create(organizationId, data) {
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
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.RouteModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.RouteStopModel)),
    __metadata("design:paramtypes", [Object, Object])
], RoutesService);
//# sourceMappingURL=routes.service.js.map