import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AssignmentType } from './assignment.constants';
import {
  ShipmentModel,
  TransportOrderModel,
  CustomerModel,
  DriverModel,
  VehicleModel,
  CarrierModel,
  UserModel,
  AuditLogModel,
  NotificationModel,
  DispatchModel,
} from '../database/models';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
    @InjectModel(NotificationModel)
    private readonly notificationModel: typeof NotificationModel,
    @InjectModel(DispatchModel)
    private readonly dispatchModel: typeof DispatchModel,
  ) {}

  async getAssignments(resourceType: string, resourceId: string) {
    let resource: any = null;

    if (resourceType.toUpperCase() === 'SHIPMENT') {
      const res = await this.shipmentModel.findByPk(resourceId, {
        include: [
          { model: DriverModel, required: false },
          { model: VehicleModel, required: false },
          { model: CarrierModel, required: false },
          { model: CustomerModel, required: false },
          {
            model: TransportOrderModel,
            required: false,
          },
        ],
      });
      if (res) resource = res.get({ plain: true });
    } else if (resourceType.toUpperCase() === 'ORDER') {
      const res = await this.orderModel.findByPk(resourceId, {
        include: [
          { model: CustomerModel, required: false },
          {
            model: ShipmentModel,
            required: false,
            include: [
              { model: DriverModel, required: false },
              { model: VehicleModel, required: false },
              { model: CarrierModel, required: false },
            ],
          },
        ],
      });
      if (res) resource = res.get({ plain: true });
    }

    if (!resource) {
      throw new NotFoundException(`${resourceType} #${resourceId} not found`);
    }

    const assignments = [
      {
        type: AssignmentType.CUSTOMER,
        label: 'Account Customer',
        assignedId: resource.customerId,
        name: resource.customer?.companyName || 'Corporate Shipper',
        email: resource.customer?.email,
      },
      {
        type: AssignmentType.PLANNER,
        label: 'Transport Planner',
        assignedId: resource.createdBy,
        name: 'Apex Planning Desk',
        email: null,
      },
      {
        type: AssignmentType.CARRIER,
        label: 'Contracted Carrier',
        assignedId: resource.carrierId || resource.shipments?.[0]?.carrierId,
        name: resource.carrier?.companyName || resource.shipments?.[0]?.carrier?.companyName || 'Unassigned 3PL',
        rating: resource.carrier?.rating || '4.9',
      },
      {
        type: AssignmentType.DRIVER,
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
        action: { [Op.like]: 'ASSIGNMENT_%' },
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
      resourceType,
      resourceId,
      assignments,
      history,
    };
  }

  async assign(
    resourceType: string,
    resourceId: string,
    assignmentType: AssignmentType | string,
    targetId: string,
    user: any,
    reason: string = 'Operational reassignment',
  ) {
    const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.permissions?.includes('*');
    const userPermissions: string[] = user?.permissions || [];

    if (!isSuperAdmin && !userPermissions.includes('dispatch:assign') && !userPermissions.includes('shipment:update')) {
      throw new ForbiddenException('User lacks dispatch:assign permission to modify assignments');
    }

    let updatedResource: any = null;
    let previousValue: any = null;
    let organizationId = user.organizationId;

    if (resourceType.toUpperCase() === 'SHIPMENT') {
      const existing = await this.shipmentModel.findByPk(resourceId, {
        include: [{ model: TransportOrderModel }],
      });
      if (!existing) throw new NotFoundException(`Shipment ${resourceId} not found`);
      organizationId = existing.transportOrder?.organizationId || user.organizationId;

      const updateData: any = {};
      if (assignmentType === AssignmentType.DRIVER) {
        previousValue = existing.driverId;
        updateData.driverId = targetId;
      } else if (assignmentType === 'VEHICLE') {
        previousValue = existing.vehicleId;
        updateData.vehicleId = targetId;
      } else if (assignmentType === AssignmentType.CARRIER) {
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
}
