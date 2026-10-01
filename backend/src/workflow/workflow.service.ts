import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ORDER_TRANSITIONS,
  DISPATCH_TRANSITIONS,
  WorkflowTransitionRule,
} from './workflow.constants';
import {
  TransportOrderModel,
  ShipmentModel,
  DispatchModel,
  CustomerModel,
  DriverModel,
  VehicleModel,
  CarrierModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
} from '../database/models';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(DispatchModel)
    private readonly dispatchModel: typeof DispatchModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
    @InjectModel(NotificationModel)
    private readonly notificationModel: typeof NotificationModel,
  ) {}

  async getWorkflowState(entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH', entityId: string, user: any) {
    let currentState = 'PLANNED';
    let entity: any = null;
    let transitionRules: WorkflowTransitionRule[] = [];

    if (entityType === 'ORDER') {
      const order = await this.orderModel.findByPk(entityId, {
        include: [{ model: CustomerModel, required: false }],
      });
      if (!order) throw new NotFoundException(`TransportOrder ${entityId} not found`);
      currentState = order.status;
      transitionRules = ORDER_TRANSITIONS;
    } else if (entityType === 'SHIPMENT' || entityType === 'DISPATCH') {
      const shipment = await this.shipmentModel.findByPk(entityId, {
        include: [
          { model: DriverModel, required: false },
          { model: VehicleModel, required: false },
          { model: CarrierModel, required: false },
        ],
      });
      if (!shipment) throw new NotFoundException(`Shipment ${entityId} not found`);
      currentState = shipment.status;
      transitionRules = DISPATCH_TRANSITIONS;
    }

    const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
    const userPermissions: string[] = user?.permissions || [];
    const userRoles: string[] = user?.roles || [];

    const availableTransitions = transitionRules.filter((rule) => {
      if (rule.from !== currentState) return false;
      if (isSuperAdmin) return true;

      if (rule.requiredRoles && rule.requiredRoles.length > 0) {
        const hasRole = rule.requiredRoles.some((r) => userRoles.includes(r));
        if (!hasRole) return false;
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
          model: UserModel,
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

  async transition(
    entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH',
    entityId: string,
    targetState: string,
    user: any,
    reason: string = 'Workflow progression',
    metadata: any = {},
  ) {
    const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
    const userPermissions: string[] = user?.permissions || [];
    const userRoles: string[] = user?.roles || [];

    let currentState = '';
    let organizationId = user.organizationId;
    let transitionRules: WorkflowTransitionRule[] = [];

    if (entityType === 'ORDER') {
      const order = await this.orderModel.findByPk(entityId);
      if (!order) throw new NotFoundException(`Order ${entityId} not found`);
      currentState = order.status;
      organizationId = order.organizationId;
      transitionRules = ORDER_TRANSITIONS;
    } else {
      const shipment = await this.shipmentModel.findByPk(entityId, {
        include: [{ model: TransportOrderModel }],
      });
      if (!shipment) throw new NotFoundException(`Shipment ${entityId} not found`);
      currentState = shipment.status;
      organizationId = shipment.transportOrder?.organizationId || user.organizationId;
      transitionRules = DISPATCH_TRANSITIONS;
    }

    const matchingRule = transitionRules.find((r) => r.from === currentState && r.to === targetState);
    if (!matchingRule) {
      throw new BadRequestException(
        `Invalid workflow transition from "${currentState}" to "${targetState}" for ${entityType}`,
      );
    }

    if (!isSuperAdmin) {
      if (matchingRule.requiredRoles && matchingRule.requiredRoles.length > 0) {
        const hasRole = matchingRule.requiredRoles.some((r) => userRoles.includes(r));
        if (!hasRole) {
          throw new ForbiddenException(`Role "${userRoles.join(', ')}" is not authorized to transition to "${targetState}"`);
        }
      }

      if (matchingRule.requiredPermission && !userPermissions.includes(matchingRule.requiredPermission)) {
        throw new ForbiddenException(`Permission "${matchingRule.requiredPermission}" required for this transition`);
      }
    }

    const sequelize = this.orderModel.sequelize;
    if (!sequelize) throw new Error('Sequelize not found');

    return sequelize.transaction(async (transaction) => {
      let updatedRecord: any = null;

      if (entityType === 'ORDER') {
        const order = await this.orderModel.findByPk(entityId, { transaction });
        if (order) {
          await order.update({ status: targetState }, { transaction });
          updatedRecord = order;
        }
      } else {
        const shipment = await this.shipmentModel.findByPk(entityId, { transaction });
        if (shipment) {
          await shipment.update({ status: targetState }, { transaction });
          updatedRecord = shipment;
        }

        await this.dispatchModel.update(
          { status: targetState },
          { where: { shipmentId: entityId }, transaction },
        );
      }

      await this.auditLogModel.create(
        {
          organizationId,
          userId: user.id || user.userId,
          action: `WORKFLOW_TRANSITION_${entityType}_${targetState}`,
          module: entityType.toLowerCase(),
          entityType,
          entityId,
          oldValue: JSON.stringify({ state: currentState }),
          newValue: JSON.stringify({ state: targetState, reason, nextRole: matchingRule.nextResponsibleRole, ...metadata }),
        },
        { transaction },
      );

      await this.notificationModel.create(
        {
          organizationId,
          title: `${entityType} Transitioned to ${targetState}`,
          message: `${entityType} #${entityId.slice(0, 8)} moved to ${targetState}. Next responsible action routed to: ${matchingRule.nextResponsibleRole}`,
          type: 'INFO',
        },
        { transaction },
      );

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
}
