import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DataAccessService } from '../common/data-access/data-access.service';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  InvoiceModel,
  AuditLogModel,
  CustomerModel,
  DriverModel,
  LocationModel,
} from '../database/models';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(InvoiceModel)
    private readonly invoiceModel: typeof InvoiceModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
    private readonly dataAccess: DataAccessService,
  ) {}

  async getOverview(user: any, orgContext?: string) {
    const shipmentWhere = await this.dataAccess.getShipmentWhere(user, { orgContext });
    const vehicleWhere = this.dataAccess.getVehicleWhere(user, orgContext);
    const orgId = this.dataAccess.resolveOrganizationId(user, orgContext);

    const shipmentInclude: any[] = shipmentWhere['$transportOrder.organizationId$']
      ? [
          {
            model: TransportOrderModel,
            attributes: [],
            required: true,
          },
        ]
      : [];

    const [totalOrders, activeShipments, deliveredShipments, totalVehicles, inTransitVehicles] = await Promise.all([
      this.orderModel.count({
        where: orgId ? { organizationId: orgId } : {},
      }),
      this.shipmentModel.count({
        where: { ...shipmentWhere, status: { [Op.in]: ['ASSIGNED', 'DISPATCHED', 'IN_TRANSIT'] } },
        include: shipmentInclude,
        distinct: true,
        col: 'id',
      }),
      this.shipmentModel.count({
        where: { ...shipmentWhere, status: 'DELIVERED' },
        include: shipmentInclude,
        distinct: true,
        col: 'id',
      }),
      this.vehicleModel.count({ where: vehicleWhere }),
      this.vehicleModel.count({
        where: { ...vehicleWhere, status: 'IN_TRANSIT' },
      }),
    ]);

    const fleetUtilization = totalVehicles > 0 ? Math.round((inTransitVehicles / totalVehicles) * 100) : 0;

    let totalRevenue = 0;
    const canViewFinance =
      user.roles?.includes('SUPER_ADMIN') ||
      user.roles?.includes('FINANCE_MANAGER') ||
      user.permissions?.includes('*') ||
      user.permissions?.includes('billing:view');

    if (canViewFinance) {
      const invoiceWhere = await this.dataAccess.getInvoiceWhere(user, orgContext);
      const invoices = await this.invoiceModel.findAll({
        where: invoiceWhere,
        attributes: ['totalAmount'],
      });
      totalRevenue = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    }

    return {
      kpis: {
        totalOrders,
        activeShipments,
        deliveredShipments,
        otdPercent: 95.2,
        totalVehicles,
        inTransitVehicles,
        fleetUtilization,
        totalRevenue: canViewFinance ? totalRevenue : undefined,
      },
      scope: this.dataAccess.resolveScope(user, 'dashboard:view'),
      organizationContext: this.dataAccess.resolveOrganizationId(user, orgContext) || 'SYSTEM',
    };
  }

  async getShipments(user: any, orgContext?: string, limit = 6) {
    const where = await this.dataAccess.getShipmentWhere(user, { orgContext });
    const shipments = await this.shipmentModel.findAll({
      where,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: CustomerModel, required: false },
        { model: VehicleModel, required: false },
        { model: DriverModel, required: false },
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
      ],
    });

    return shipments.map((s) => this.dataAccess.sanitizeShipment(s.get({ plain: true }), user));
  }

  async getFleet(user: any, orgContext?: string) {
    const where = this.dataAccess.getVehicleWhere(user, orgContext);
    const [total, inTransit, available, maintenance] = await Promise.all([
      this.vehicleModel.count({ where }),
      this.vehicleModel.count({ where: { ...where, status: 'IN_TRANSIT' } }),
      this.vehicleModel.count({ where: { ...where, status: 'AVAILABLE' } }),
      this.vehicleModel.count({ where: { ...where, status: { [Op.in]: ['MAINTENANCE', 'OUT_OF_SERVICE'] } } }),
    ]);

    return { total, inTransit, available, maintenance };
  }

  async getExceptions(user: any, orgContext?: string) {
    return [
      {
        id: 'exc-101',
        severity: 'CRITICAL',
        type: 'Route Deviation',
        asset: 'TRK-101',
        message: 'Vehicle diverged 6.4 km from scheduled interstate corridor.',
        time: '3m ago',
      },
      {
        id: 'exc-102',
        severity: 'HIGH',
        type: 'Dwell Timeout',
        asset: 'TRK-104',
        message: 'Consignee receiver unloading bay dwell exceeded 90-minute limit.',
        time: '18m ago',
      },
      {
        id: 'exc-103',
        severity: 'MEDIUM',
        type: 'Telematics Check',
        asset: 'TRK-102',
        message: 'Tire temperature sensor alert on drive axle 2.',
        time: '45m ago',
      },
    ];
  }

  async getFinancial(user: any, orgContext?: string) {
    const canViewFinance =
      user.roles?.includes('SUPER_ADMIN') ||
      user.roles?.includes('FINANCE_MANAGER') ||
      user.permissions?.includes('*') ||
      user.permissions?.includes('billing:view');

    if (!canViewFinance) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to access financial metrics',
      });
    }

    const where = await this.dataAccess.getInvoiceWhere(user, orgContext);
    const invoices = await this.invoiceModel.findAll({
      where,
      attributes: ['totalAmount', 'status'],
    });

    const totalInvoiced = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const paid = invoices.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + (i.totalAmount || 0), 0);
    const pending = invoices.filter((i) => i.status !== 'PAID').reduce((acc, i) => acc + (i.totalAmount || 0), 0);

    return {
      totalInvoiced,
      paidReceivables: paid,
      pendingClearance: pending,
      invoiceCount: invoices.length,
    };
  }

  async getActivity(user: any, orgContext?: string) {
    const orgId = this.dataAccess.resolveOrganizationId(user, orgContext);
    const auditWhere = orgId ? { organizationId: orgId } : {};

    return this.auditLogModel.findAll({
      where: auditWhere,
      limit: 6,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'action', 'module', 'entityType', 'createdAt'],
    });
  }
}
