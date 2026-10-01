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
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const assignment_constants_1 = require("./assignment.constants");
const models_1 = require("../database/models");
let AssignmentService = class AssignmentService {
    constructor(shipmentModel, orderModel, auditLogModel, notificationModel, dispatchModel) {
        this.shipmentModel = shipmentModel;
        this.orderModel = orderModel;
        this.auditLogModel = auditLogModel;
        this.notificationModel = notificationModel;
        this.dispatchModel = dispatchModel;
    }
    async getAssignments(resourceType, resourceId) {
        let resource = null;
        if (resourceType.toUpperCase() === 'SHIPMENT') {
            const res = await this.shipmentModel.findByPk(resourceId, {
                include: [
                    { model: models_1.DriverModel, required: false },
                    { model: models_1.VehicleModel, required: false },
                    { model: models_1.CarrierModel, required: false },
                    { model: models_1.CustomerModel, required: false },
                    {
                        model: models_1.TransportOrderModel,
                        required: false,
                    },
                ],
            });
            if (res)
                resource = res.get({ plain: true });
        }
        else if (resourceType.toUpperCase() === 'ORDER') {
            const res = await this.orderModel.findByPk(resourceId, {
                include: [
                    { model: models_1.CustomerModel, required: false },
                    {
                        model: models_1.ShipmentModel,
                        required: false,
                        include: [
                            { model: models_1.DriverModel, required: false },
                            { model: models_1.VehicleModel, required: false },
                            { model: models_1.CarrierModel, required: false },
                        ],
                    },
                ],
            });
            if (res)
                resource = res.get({ plain: true });
        }
        if (!resource) {
            throw new common_1.NotFoundException(`${resourceType} #${resourceId} not found`);
        }
        const assignments = [
            {
                type: assignment_constants_1.AssignmentType.CUSTOMER,
                label: 'Account Customer',
                assignedId: resource.customerId,
                name: resource.customer?.companyName || 'Corporate Shipper',
                email: resource.customer?.email,
            },
            {
                type: assignment_constants_1.AssignmentType.PLANNER,
                label: 'Transport Planner',
                assignedId: resource.createdBy,
                name: 'Apex Planning Desk',
                email: null,
            },
            {
                type: assignment_constants_1.AssignmentType.CARRIER,
                label: 'Contracted Carrier',
                assignedId: resource.carrierId || resource.shipments?.[0]?.carrierId,
                name: resource.carrier?.companyName || resource.shipments?.[0]?.carrier?.companyName || 'Unassigned 3PL',
                rating: resource.carrier?.rating || '4.9',
            },
            {
                type: assignment_constants_1.AssignmentType.DRIVER,
                label: 'Assigned Driver',
                assignedId: resource.driverId || resource.shipments?.[0]?.driverId,
                name: resource.driver
                    ? `${resource.driver.firstName} ${resource.driver.lastName}`
                    : resource.shipments?.[0]?.driver
                        ? `${resource.shipments[0].driver.firstName} ${resource.shipments[0].driver.lastName}`
                        : 'Unassigned Driver',
                phone: resource.driver?.phone || resource.shipments?.[0]?.driver?.phone,
            },
            {
                type: 'VEHICLE',
                label: 'Assigned Vehicle',
                assignedId: resource.vehicleId || resource.shipments?.[0]?.vehicleId,
                name: resource.vehicle?.vehicleNumber || resource.shipments?.[0]?.vehicle?.vehicleNumber || 'Unassigned Tractor',
            },
        ];
        const history = await this.auditLogModel.findAll({
            where: {
                entityType: resourceType.toUpperCase(),
                entityId: resourceId,
                action: { [sequelize_2.Op.like]: 'ASSIGNMENT_%' },
            },
            include: [
                {
                    model: models_1.UserModel,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false,
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
        });
        return {
            resourceType,
            resourceId,
            assignments,
            history,
        };
    }
    async assign(resourceType, resourceId, assignmentType, targetId, user, reason = 'Operational reassignment') {
        const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
        const userPermissions = user?.permissions || [];
        if (!isSuperAdmin && !userPermissions.includes('dispatch:assign') && !userPermissions.includes('shipment:update')) {
            throw new common_1.ForbiddenException('User lacks dispatch:assign permission to modify assignments');
        }
        let updatedResource = null;
        let previousValue = null;
        let organizationId = user.organizationId;
        if (resourceType.toUpperCase() === 'SHIPMENT') {
            const existing = await this.shipmentModel.findByPk(resourceId, {
                include: [{ model: models_1.TransportOrderModel }],
            });
            if (!existing)
                throw new common_1.NotFoundException(`Shipment ${resourceId} not found`);
            organizationId = existing.transportOrder?.organizationId || user.organizationId;
            const updateData = {};
            if (assignmentType === assignment_constants_1.AssignmentType.DRIVER) {
                previousValue = existing.driverId;
                updateData.driverId = targetId;
            }
            else if (assignmentType === 'VEHICLE') {
                previousValue = existing.vehicleId;
                updateData.vehicleId = targetId;
            }
            else if (assignmentType === assignment_constants_1.AssignmentType.CARRIER) {
                previousValue = existing.carrierId;
                updateData.carrierId = targetId;
            }
            await existing.update(updateData);
            updatedResource = existing;
            await this.dispatchModel.update(updateData, {
                where: { shipmentId: resourceId },
            });
        }
        await this.auditLogModel.create({
            organizationId,
            userId: user.id || user.userId,
            action: `ASSIGNMENT_CHANGED_${assignmentType}`,
            module: 'dispatch',
            entityType: resourceType.toUpperCase(),
            entityId: resourceId,
            oldValue: JSON.stringify({ previous: previousValue }),
            newValue: JSON.stringify({ assigned: targetId, assignmentType, reason }),
        });
        await this.notificationModel.create({
            organizationId,
            title: `New Assignment: ${resourceType} #${resourceId.slice(0, 8)}`,
            message: `You were assigned as ${assignmentType} on ${resourceType} #${resourceId.slice(0, 8)}. Reason: ${reason}`,
            type: 'INFO',
        });
        return {
            success: true,
            resourceType,
            resourceId,
            assignmentType,
            newAssigneeId: targetId,
            updatedResource,
        };
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map