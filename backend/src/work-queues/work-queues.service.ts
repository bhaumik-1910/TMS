import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DataAccessService } from '../common/data-access/data-access.service';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  DriverModel,
  CustomerModel,
  LocationModel,
  InvoiceModel,
  VehicleDocumentModel,
} from '../database/models';

export interface WorkQueueItem {
  id: string;
  resourceType: 'ORDER' | 'SHIPMENT' | 'DISPATCH' | 'INVOICE' | 'DOCUMENT';
  resourceId: string;
  referenceNumber: string;
  title: string;
  origin?: string;
  destination?: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  workflowState: string;
  assignedRole: string;
  assignedUser?: string;
  dueAt: string;
  slaStatus: 'ON_TRACK' | 'DUE_SOON' | 'BREACHED';
  nextActionLabel: string;
  nextActionRoute: string;
}

@Injectable()
export class WorkQueuesService {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(InvoiceModel)
    private readonly invoiceModel: typeof InvoiceModel,
    @InjectModel(VehicleDocumentModel)
    private readonly vehicleDocModel: typeof VehicleDocumentModel,
    private readonly dataAccessService: DataAccessService,
  ) {}

  async getMyQueue(user: any): Promise<WorkQueueItem[]> {
    const roles: string[] = user.roles || [];
    const activeRole = roles[0] || 'OPERATIONS_MANAGER';

    switch (activeRole) {
      case 'TRANSPORT_PLANNER':
        return this.getPlanningQueue(user);
      case 'DISPATCHER':
        return this.getDispatchQueue(user);
      case 'FINANCE_MANAGER':
        return this.getFinanceQueue(user);
      case 'COMPLIANCE_MANAGER':
        return this.getComplianceQueue(user);
      case 'SUPPORT_AGENT':
        return this.getSupportQueue(user);
      case 'DRIVER':
        return this.getDriverQueue(user);
      case 'CUSTOMER':
        return this.getCustomerQueue(user);
      case 'CARRIER':
        return this.getCarrierQueue(user);
      case 'SUPER_ADMIN':
      case 'OPERATIONS_MANAGER':
      default:
        return this.getOperationsQueue(user);
    }
  }

  async getPlanningQueue(user: any): Promise<WorkQueueItem[]> {
    const where: any = {
      status: { [Op.in]: ['SUBMITTED', 'CONFIRMED', 'PLANNING'] },
    };
    const orgId = this.dataAccessService.resolveOrganizationId(user);
    if (orgId) where.organizationId = orgId;

    const orders = await this.orderModel.findAll({
      where,
      include: [
        { model: LocationModel, as: 'originLocation', required: false },
        { model: LocationModel, as: 'destinationLocation', required: false },
        { model: CustomerModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return orders.map((o) => ({
      id: o.id,
      resourceType: 'ORDER',
      resourceId: o.id,
      referenceNumber: o.orderNumber,
      title: `${o.customer?.companyName || 'Shipper'} • ${o.totalWeight} kg`,
      origin: o.originLocation?.city,
      destination: o.destinationLocation?.city,
      priority: (o.priority as any) || 'NORMAL',
      workflowState: o.status,
      assignedRole: 'TRANSPORT_PLANNER',
      dueAt: (o.requestedPickupDate || new Date()).toISOString(),
      slaStatus: o.priority === 'HIGH' || o.priority === 'URGENT' ? 'DUE_SOON' : 'ON_TRACK',
      nextActionLabel: 'Consolidate & Plan Load',
      nextActionRoute: `/planning?orderId=${o.id}`,
    }));
  }

  async getDispatchQueue(user: any): Promise<WorkQueueItem[]> {
    const where: any = {
      status: { [Op.in]: ['PLANNED', 'ASSIGNED'] },
    };
    const orgId = this.dataAccessService.resolveOrganizationId(user);
    if (orgId) where['$transportOrder.organizationId$'] = orgId;

    const shipments = await this.shipmentModel.findAll({
      where,
      include: [
        { model: DriverModel, required: false },
        { model: VehicleModel, required: false },
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
            { model: CustomerModel, required: false },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return shipments.map((s) => ({
      id: s.id,
      resourceType: 'SHIPMENT',
      resourceId: s.id,
      referenceNumber: s.shipmentNumber,
      title: `${s.transportOrder?.customer?.companyName || 'Freight Consignment'} • Unit: ${s.vehicle?.vehicleNumber || 'Pending Unit'}`,
      origin: s.transportOrder?.originLocation?.city,
      destination: s.transportOrder?.destinationLocation?.city,
      priority: 'HIGH',
      workflowState: s.status,
      assignedRole: 'DISPATCHER',
      assignedUser: s.driver ? `${s.driver.firstName} ${s.driver.lastName}` : undefined,
      dueAt: (s.plannedPickup || new Date()).toISOString(),
      slaStatus: s.driver ? 'ON_TRACK' : 'DUE_SOON',
      nextActionLabel: s.driver ? 'Release Dispatch' : 'Assign Driver & Vehicle',
      nextActionRoute: `/dispatch?shipmentId=${s.id}`,
    }));
  }

  async getDriverQueue(user: any): Promise<WorkQueueItem[]> {
    const where = await this.dataAccessService.getShipmentWhere(user);
    const shipments = await this.shipmentModel.findAll({
      where,
      include: [
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return shipments.map((s) => ({
      id: s.id,
      resourceType: 'SHIPMENT',
      resourceId: s.id,
      referenceNumber: s.shipmentNumber,
      title: `Assigned Linehaul • Route: ${s.transportOrder?.originLocation?.city} → ${s.transportOrder?.destinationLocation?.city}`,
      origin: s.transportOrder?.originLocation?.city,
      destination: s.transportOrder?.destinationLocation?.city,
      priority: 'HIGH',
      workflowState: s.status,
      assignedRole: 'DRIVER',
      dueAt: (s.plannedDelivery || new Date()).toISOString(),
      slaStatus: 'ON_TRACK',
      nextActionLabel: s.status === 'IN_TRANSIT' ? 'Confirm Arrival & Submit POD' : 'Start Trip',
      nextActionRoute: '/driver-app',
    }));
  }

  async getCustomerQueue(user: any): Promise<WorkQueueItem[]> {
    const where = await this.dataAccessService.getShipmentWhere(user);
    const shipments = await this.shipmentModel.findAll({
      where,
      include: [
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return shipments.map((s) => ({
      id: s.id,
      resourceType: 'SHIPMENT',
      resourceId: s.id,
      referenceNumber: s.shipmentNumber,
      title: `Cargo in Transit • ETA: ${s.plannedDelivery ? new Date(s.plannedDelivery).toLocaleTimeString() : 'On Schedule'}`,
      origin: s.transportOrder?.originLocation?.city,
      destination: s.transportOrder?.destinationLocation?.city,
      priority: 'NORMAL',
      workflowState: s.status,
      assignedRole: 'CUSTOMER',
      dueAt: (s.plannedDelivery || new Date()).toISOString(),
      slaStatus: 'ON_TRACK',
      nextActionLabel: 'Track on Satellite Radar',
      nextActionRoute: '/tracking',
    }));
  }

  async getCarrierQueue(user: any): Promise<WorkQueueItem[]> {
    const where = await this.dataAccessService.getShipmentWhere(user);
    const shipments = await this.shipmentModel.findAll({
      where,
      include: [
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return shipments.map((s) => ({
      id: s.id,
      resourceType: 'SHIPMENT',
      resourceId: s.id,
      referenceNumber: s.shipmentNumber,
      title: `Assigned 3PL Freight Load`,
      origin: s.transportOrder?.originLocation?.city,
      destination: s.transportOrder?.destinationLocation?.city,
      priority: 'HIGH',
      workflowState: s.status,
      assignedRole: 'CARRIER',
      dueAt: (s.plannedDelivery || new Date()).toISOString(),
      slaStatus: 'ON_TRACK',
      nextActionLabel: 'View Load & Upload POD',
      nextActionRoute: '/carriers',
    }));
  }

  async getFinanceQueue(user: any): Promise<WorkQueueItem[]> {
    const where = await this.dataAccessService.getInvoiceWhere(user);
    const invoices = await this.invoiceModel.findAll({
      where: { ...where, status: { [Op.in]: ['DRAFT', 'ISSUED', 'UNPAID', 'PENDING'] } },
      include: [{ model: CustomerModel, required: false }],
      order: [['createdAt', 'DESC']],
      limit: 15,
    });

    return invoices.map((inv) => ({
      id: inv.id,
      resourceType: 'INVOICE',
      resourceId: inv.id,
      referenceNumber: inv.invoiceNumber,
      title: `${inv.customer?.companyName || 'Corporate Customer'} • $${(inv.totalAmount || 0).toLocaleString()}`,
      priority: inv.status === 'PENDING' ? 'HIGH' : 'NORMAL',
      workflowState: inv.status,
      assignedRole: 'FINANCE_MANAGER',
      dueAt: (inv.dueDate || new Date()).toISOString(),
      slaStatus: inv.dueDate && new Date(inv.dueDate) < new Date() ? 'BREACHED' : 'ON_TRACK',
      nextActionLabel: 'Approve & Settle Invoice',
      nextActionRoute: `/billing?id=${inv.id}`,
    }));
  }

  async getComplianceQueue(user: any): Promise<WorkQueueItem[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vehicleDocs = await this.vehicleDocModel.findAll({
      where: { expiryDate: { [Op.lte]: thirtyDaysFromNow } },
      include: [{ model: VehicleModel, required: false }],
      limit: 10,
    });

    return vehicleDocs.map((doc) => ({
      id: doc.id,
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      referenceNumber: doc.documentType,
      title: `${doc.vehicle?.vehicleNumber || 'Fleet Unit'} • ${doc.documentType} Renewal Required`,
      priority: 'HIGH',
      workflowState: 'EXPIRING',
      assignedRole: 'COMPLIANCE_MANAGER',
      dueAt: (doc.expiryDate || new Date()).toISOString(),
      slaStatus: doc.expiryDate && new Date(doc.expiryDate) < new Date() ? 'BREACHED' : 'DUE_SOON',
      nextActionLabel: 'Audit & Verify Document',
      nextActionRoute: '/documents',
    }));
  }

  async getSupportQueue(user: any): Promise<WorkQueueItem[]> {
    const shipments = await this.shipmentModel.findAll({
      where: {
        status: { [Op.in]: ['DISPATCHED', 'IN_TRANSIT'] },
      },
      include: [
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
            { model: CustomerModel, required: false },
          ],
        },
      ],
      limit: 10,
    });

    return shipments.map((s) => ({
      id: s.id,
      resourceType: 'SHIPMENT',
      resourceId: s.id,
      referenceNumber: s.shipmentNumber,
      title: `${s.transportOrder?.customer?.companyName || 'Shipper'} • Transit In-Flight`,
      origin: s.transportOrder?.originLocation?.city,
      destination: s.transportOrder?.destinationLocation?.city,
      priority: 'NORMAL',
      workflowState: s.status,
      assignedRole: 'SUPPORT_AGENT',
      dueAt: (s.plannedDelivery || new Date()).toISOString(),
      slaStatus: 'ON_TRACK',
      nextActionLabel: 'Track Telematics',
      nextActionRoute: '/tracking',
    }));
  }

  async getOperationsQueue(user: any): Promise<WorkQueueItem[]> {
    const [planning, dispatch] = await Promise.all([
      this.getPlanningQueue(user),
      this.getDispatchQueue(user),
    ]);
    return [...dispatch, ...planning].slice(0, 20);
  }
}
