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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const models_1 = require("../database/models");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, organizationModel) {
        this.notificationModel = notificationModel;
        this.organizationModel = organizationModel;
    }
    async findAll(organizationId, userId) {
        const where = {};
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        if (userId) {
            where[sequelize_2.Op.or] = [{ userId }, { userId: null }];
        }
        let list = await this.notificationModel.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
        if (list.length === 0) {
            let targetOrgId = organizationId && organizationId !== 'SYSTEM' ? organizationId : null;
            if (!targetOrgId) {
                const firstOrg = await this.organizationModel.findOne();
                targetOrgId = firstOrg ? firstOrg.id : 'org-apex-001';
            }
            const sampleAlerts = [
                {
                    organizationId: targetOrgId,
                    userId: null,
                    title: 'Route Deviation Critical Alert',
                    message: 'Vehicle TRK-101 drifted 4.2 km off designated I-55 freight corridor near Springfield.',
                    type: 'CRITICAL',
                    channel: 'IN_APP',
                    isRead: false,
                    createdAt: new Date(Date.now() - 4 * 60 * 1000),
                },
                {
                    organizationId: targetOrgId,
                    userId: null,
                    title: 'Shipment SHP-2024-001 In Transit',
                    message: 'Driver Marcus Vance departed Chicago Central Hub. Live GPS radar ping active.',
                    type: 'OPERATIONS',
                    channel: 'IN_APP',
                    isRead: false,
                    createdAt: new Date(Date.now() - 18 * 60 * 1000),
                },
                {
                    organizationId: targetOrgId,
                    userId: null,
                    title: 'Digital ePOD Signature Received',
                    message: 'Receiver verified and e-signed consignment proof of delivery for SHP-2024-003.',
                    type: 'OPERATIONS',
                    channel: 'IN_APP',
                    isRead: false,
                    createdAt: new Date(Date.now() - 45 * 60 * 1000),
                },
                {
                    organizationId: targetOrgId,
                    userId: null,
                    title: 'SAP S/4HANA Ledger Sync Complete',
                    message: 'Automated batch sync updated 14 freight billing invoices with zero reconciliation variances.',
                    type: 'SYSTEM',
                    channel: 'IN_APP',
                    isRead: true,
                    createdAt: new Date(Date.now() - 120 * 60 * 1000),
                },
                {
                    organizationId: targetOrgId,
                    userId: null,
                    title: 'Dwell Time Limit Advisory',
                    message: 'TRK-104 exceeded 45-minute staging dwell threshold at Detroit Logistics Depot.',
                    type: 'WARNING',
                    channel: 'IN_APP',
                    isRead: true,
                    createdAt: new Date(Date.now() - 240 * 60 * 1000),
                },
            ];
            await this.notificationModel.bulkCreate(sampleAlerts);
            list = await this.notificationModel.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: 50,
            });
        }
        return list;
    }
    async create(data) {
        return this.notificationModel.create(data);
    }
    async markAsRead(id) {
        const notification = await this.notificationModel.findByPk(id);
        if (notification) {
            await notification.update({ isRead: true });
        }
        return notification;
    }
    async markAllAsRead(organizationId) {
        const where = { isRead: false };
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        await this.notificationModel.update({ isRead: true }, { where });
        return { success: true };
    }
    async delete(id) {
        const notification = await this.notificationModel.findByPk(id);
        if (notification) {
            await notification.destroy();
            return { success: true, id };
        }
        return { success: false };
    }
    async clearRead(organizationId) {
        const where = { isRead: true };
        if (organizationId && organizationId !== 'SYSTEM') {
            where.organizationId = organizationId;
        }
        await this.notificationModel.destroy({ where });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.OrganizationModel)),
    __metadata("design:paramtypes", [Object, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map