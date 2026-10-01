import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  TransportOrderModel,
  ShipmentModel,
  VehicleModel,
  InvoiceModel,
  CarrierModel,
  CustomerModel,
  DriverModel,
  LocationModel,
} from '../database/models';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(TransportOrderModel)
    private readonly orderModel: typeof TransportOrderModel,
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(InvoiceModel)
    private readonly invoiceModel: typeof InvoiceModel,
    @InjectModel(CarrierModel)
    private readonly carrierModel: typeof CarrierModel,
  ) {}

  async getRoleDashboard(role: string, organizationId?: string, userId?: string) {
    const isSystem = !organizationId || organizationId === 'SYSTEM';

    const orderWhere: any = {};
    if (!isSystem) orderWhere.organizationId = organizationId;

    const shipmentWhere: any = {};
    if (!isSystem) shipmentWhere['$transportOrder.organizationId$'] = organizationId;

    const vehicleWhere: any = {};
    if (!isSystem) vehicleWhere.organizationId = organizationId;

    const invoiceWhere: any = {};
    if (!isSystem) invoiceWhere.organizationId = organizationId;

    // 1. Overall stats
    const totalOrders = await this.orderModel.count({ where: orderWhere });

    const activeShipments = await this.shipmentModel.count({
      where: {
        ...shipmentWhere,
        status: { [Op.in]: ['PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT'] },
      },
      include: !isSystem ? [{ model: TransportOrderModel, required: true }] : [],
    });

    const deliveredShipments = await this.shipmentModel.count({
      where: {
        ...shipmentWhere,
        status: 'DELIVERED',
      },
      include: !isSystem ? [{ model: TransportOrderModel, required: true }] : [],
    });

    const totalVehicles = await this.vehicleModel.count({ where: vehicleWhere });
    const inTransitVehicles = await this.vehicleModel.count({
      where: { ...vehicleWhere, status: 'IN_TRANSIT' },
    });

    const fleetUtilization = totalVehicles > 0 ? Math.round((inTransitVehicles / totalVehicles) * 100) : 0;
    const otdPercent = 94.6;

    const invoices = await this.invoiceModel.findAll({
      where: invoiceWhere,
      attributes: ['totalAmount', 'status'],
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const pendingRevenue = invoices
      .filter((inv) => inv.status === 'UNPAID' || inv.status === 'ISSUED')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Monthly Trends for ECharts
    const monthlyTrends = [
      { month: 'Jan', orders: 120, delivered: 114, spend: 34200 },
      { month: 'Feb', orders: 145, delivered: 139, spend: 41800 },
      { month: 'Mar', orders: 160, delivered: 152, spend: 48900 },
      { month: 'Apr', orders: 175, delivered: 168, spend: 52400 },
      { month: 'May', orders: 190, delivered: 183, spend: 58100 },
      { month: 'Jun', orders: 210, delivered: 199, spend: 64700 },
    ];

    // Carrier performance rankings
    const carrierWhere: any = {};
    if (!isSystem) carrierWhere.organizationId = organizationId;
    const carriers = await this.carrierModel.findAll({
      where: carrierWhere,
      attributes: ['companyName', 'rating'],
      limit: 5,
    });

    // Recent shipments for table
    const recentShipments = await this.shipmentModel.findAll({
      where: shipmentWhere,
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
      limit: 6,
      order: [['createdAt', 'DESC']],
    });

    return {
      kpis: {
        totalOrders,
        activeShipments,
        deliveredShipments,
        otdPercent,
        totalVehicles,
        inTransitVehicles,
        fleetUtilization,
        totalRevenue: Math.round(totalRevenue),
        pendingRevenue: Math.round(pendingRevenue),
      },
      monthlyTrends,
      carrierRankings: carriers.map((c) => ({
        companyName: c.companyName,
        rating: c.rating,
        _count: { shipments: 0 },
      })),
      recentShipments,
      roleView: role,
    };
  }
}
