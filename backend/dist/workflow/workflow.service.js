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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const workflow_constants_1 = require("./workflow.constants");
const models_1 = require("../database/models");
let WorkflowService = class WorkflowService {
    constructor(orderModel, shipmentModel, dispatchModel, auditLogModel, notificationModel) {
        this.orderModel = orderModel;
        this.shipmentModel = shipmentModel;
        this.dispatchModel = dispatchModel;
        this.auditLogModel = auditLogModel;
        this.notificationModel = notificationModel;
    }
    async getWorkflowState(entityType, entityId, user) {
        let currentState = 'PLANNED';
        let entity = null;
        let transitionRules = [];
        if (entityType === 'ORDER') {
            const order = await this.orderModel.findByPk(entityId, {
                include: [{ model: models_1.CustomerModel, required: false }],
            });
            if (!order)
                throw new common_1.NotFoundException(`TransportOrder ${entityId} not found`);
            currentState = order.status;
            transitionRules = workflow_constants_1.ORDER_TRANSITIONS;
        }
        else if (entityType === 'SHIPMENT' || entityType === 'DISPATCH') {
            const shipment = await this.shipmentModel.findByPk(entityId, {
                include: [
                    { model: models_1.DriverModel, required: false },
                    { model: models_1.VehicleModel, required: false },
                    { model: models_1.CarrierModel, required: false },
                ],
            });
            if (!shipment)
                throw new common_1.NotFoundException(`Shipment ${entityId} not found`);
            currentState = shipment.status;
            transitionRules = workflow_constants_1.DISPATCH_TRANSITIONS;
        }
        const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
        const userPermissions = user?.permissions || [];
        const userRoles = user?.roles || [];
        const availableTransitions = transitionRules.filter((rule) => {
            if (rule.from !== currentState)
                return false;
            if (isSuperAdmin)
                return true;
            if (rule.requiredRoles && rule.requiredRoles.length > 0) {
                const hasRole = rule.requiredRoles.some((r) => userRoles.includes(r));
                if (!hasRole)
                    return false;
            }
            if (rule.requiredPermission && !userPermissions.includes(rule.requiredPermission)) {
                return false;
            }
            return true;
        });
        const history = await this.auditLogModel.findAll({
            where: {
                entityType,
                entityId,
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
            entityType,
            entityId,
            currentState,
            availableTransitions,
            history,
        };
    }
    async transition(entityType, entityId, targetState, user, reason = 'Workflow progression', metadata = {}) {
        const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
        const userPermissions = user?.permissions || [];
        const userRoles = user?.roles || [];
        let currentState = '';
        let organizationId = user.organizationId;
        let transitionRules = [];
        if (entityType === 'ORDER') {
            const order = await this.orderModel.findByPk(entityId);
            if (!order)
                throw new common_1.NotFoundException(`Order ${entityId} not found`);
            currentState = order.status;
            organizationId = order.organizationId;
            transitionRules = workflow_constants_1.ORDER_TRANSITIONS;
        }
        else {
            const shipment = await this.shipmentModel.findByPk(entityId, {
                include: [{ model: models_1.TransportOrderModel }],
            });
            if (!shipment)
                throw new common_1.NotFoundException(`Shipment ${entityId} not found`);
            currentState = shipment.status;
            organizationId = shipment.transportOrder?.organizationId || user.organizationId;
            transitionRules = workflow_constants_1.DISPATCH_TRANSITIONS;
        }
        const matchingRule = transitionRules.find((r) => r.from === currentState && r.to === targetState);
        if (!matchingRule) {
            throw new common_1.BadRequestException(`Invalid workflow transition from "${currentState}" to "${targetState}" for ${entityType}`);
        }
        if (!isSuperAdmin) {
            if (matchingRule.requiredRoles && matchingRule.requiredRoles.length > 0) {
                const hasRole = matchingRule.requiredRoles.some((r) => userRoles.includes(r));
                if (!hasRole) {
                    throw new common_1.ForbiddenException(`Role "${userRoles.join(', ')}" is not authorized to transition to "${targetState}"`);
                }
            }
            if (matchingRule.requiredPermission && !userPermissions.includes(matchingRule.requiredPermission)) {
                throw new common_1.ForbiddenException(`Permission "${matchingRule.requiredPermission}" required for this transition`);
            }
        }
        const sequelize = this.orderModel.sequelize;
        if (!sequelize)
            throw new Error('Sequelize not found');
        return sequelize.transaction(async (transaction) => {
            let updatedRecord = null;
            if (entityType === 'ORDER') {
                const order = await this.orderModel.findByPk(entityId, { transaction });
                if (order) {
                    await order.update({ status: targetState }, { transaction });
                    updatedRecord = order;
                }
            }
            else {
                const shipment = await this.shipmentModel.findByPk(entityId, { transaction });
                if (shipment) {
                    await shipment.update({ status: targetState }, { transaction });
                    updatedRecord = shipment;
                }
                await this.dispatchModel.update({ status: targetState }, { where: { shipmentId: entityId }, transaction });
            }
            await this.auditLogModel.create({
                organizationId,
                userId: user.id || user.userId,
                action: `WORKFLOW_TRANSITION_${entityType}_${targetState}`,
                module: entityType.toLowerCase(),
                entityType,
                entityId,
                oldValue: JSON.stringify({ state: currentState }),
                newValue: JSON.stringify({ state: targetState, reason, nextRole: matchingRule.nextResponsibleRole, ...metadata }),
            }, { transaction });
            await this.notificationModel.create({
                organizationId,
                title: `${entityType} Transitioned to ${targetState}`,
                message: `${entityType} #${entityId.slice(0, 8)} moved to ${targetState}. Next responsible action routed to: ${matchingRule.nextResponsibleRole}`,
                type: 'INFO',
            }, { transaction });
            return {
                success: true,
                entityType,
                entityId,
                previousState: currentState,
                currentState: targetState,
                nextResponsibleRole: matchingRule.nextResponsibleRole,
                actionLabel: matchingRule.actionLabel,
                updatedRecord,
            };
        });
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.NotificationModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map