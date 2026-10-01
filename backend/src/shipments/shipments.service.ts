import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseSequelizeService } from '../common/base/base.service';
import { DataAccessService } from '../common/data-access/data-access.service';
import { ShipmentPolicy } from '../common/data-access/resource-policies';
import {
  ShipmentModel,
  ShipmentItemModel,
  TransportOrderModel,
  CustomerModel,
  CarrierModel,
  VehicleModel,
  DriverModel,
  RouteModel,
  RouteStopModel,
  TrackingEventModel,
  ProofOfDeliveryModel,
  DispatchModel,
  NotificationModel,
  AuditLogModel,
  LocationModel,
  VehicleTypeModel,
} from '../database/models';

@Injectable()
export class ShipmentsService extends BaseSequelizeService<ShipmentModel> {
  constructor(
    @InjectModel(ShipmentModel)
    private readonly shipmentModel: typeof ShipmentModel,
    @InjectModel(VehicleModel)
    private readonly vehicleModel: typeof VehicleModel,
    @InjectModel(DriverModel)
    private readonly driverModel: typeof DriverModel,
    @InjectModel(DispatchModel)
    private readonly dispatchModel: typeof DispatchModel,
    @InjectModel(ProofOfDeliveryModel)
    private readonly podModel: typeof ProofOfDeliveryModel,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: typeof AuditLogModel,
    @InjectModel(NotificationModel)
    private readonly notificationModel: typeof NotificationModel,
    private readonly dataAccess: DataAccessService,
  ) {
    super(shipmentModel);
  }

  async findAll(user: any, filters: any = {}, orgContext?: string): Promise<any> {
    const where = await this.dataAccess.getShipmentWhere(user, { orgContext, status: filters.status });

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.carrierId) where.carrierId = filters.carrierId;
    if (filters.driverId) where.driverId = filters.driverId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;

    const shipments = await this.shipmentModel.findAll({
      where,
      include: [
        { model: CustomerModel, required: false },
        { model: CarrierModel, required: false },
        { model: VehicleModel, required: false },
        { model: DriverModel, required: false },
        { model: RouteModel, required: false },
        {
          model: TransportOrderModel,
          required: false,
          include: [
            { model: LocationModel, as: 'originLocation', required: false },
            { model: LocationModel, as: 'destinationLocation', required: false },
          ],
        },
        { model: ProofOfDeliveryModel, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return shipments.map((s) => {
      const plain = s.get({ plain: true });
      const enriched = {
        ...plain,
        _count: {
          shipmentItems: 0,
          trackingEvents: 0,
        },
      };
      return this.dataAccess.sanitizeShipment(enriched, user);
    });
  }

  override async findOne(id: any, user?: any): Promise<any> {
    if (typeof id === 'string') {
      const shipment = await this.shipmentModel.findByPk(id, {
        include: [
          { model: CustomerModel, required: false },
          { model: CarrierModel, required: false },
          {
            model: VehicleModel,
            required: false,
            include: [{ model: VehicleTypeModel, required: false }],
          },
          { model: DriverModel, required: false },
          {
            model: RouteModel,
            required: false,
            include: [
              {
                model: RouteStopModel,
                required: false,
                include: [{ model: LocationModel, required: false }],
              },
            ],
          },
          {
            model: TransportOrderModel,
            required: false,
            include: [
              { model: LocationModel, as: 'originLocation', required: false },
              { model: LocationModel, as: 'destinationLocation', required: false },
            ],
          },
          { model: ShipmentItemModel, required: false },
          { model: ProofOfDeliveryModel, required: false },
        ],
      });

      if (!shipment) throw new NotFoundException('Shipment not found');

      const plain = shipment.get({ plain: true });
      const enriched = {
        ...plain,
        shipmentItems: plain.items || [],
        trackingEvents: [],
        geofenceEvents: [],
        claims: [],
        invoices: [],
      };

      if (user && !ShipmentPolicy.canView(user, enriched)) {
        throw new ForbiddenException({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this shipment record',
        });
      }

      return this.dataAccess.sanitizeShipment(enriched, user);
    }
    return super.findOne(id);
  }

  async assignResources(
    id: string,
    data: { vehicleId?: string; driverId?: string; carrierId?: string; routeId?: string },
    userId?: string,
  ) {
    const shipment = await this.findOne(id);

    if (data.vehicleId) {
      const vehicle = await this.vehicleModel.findByPk(data.vehicleId);
      if (vehicle && vehicle.capacityWeight < (shipment.totalWeight || 0)) {
        throw new BadRequestException(
          `Vehicle capacity (${vehicle.capacityWeight}kg) is insufficient for shipment weight (${shipment.totalWeight}kg)`,
        );
      }
    }

    return this.withTransaction(async (transaction) => {
      const shipmentRecord = await this.findById(id);
      await shipmentRecord.update(
        {
          vehicleId: data.vehicleId || null,
          driverId: data.driverId || null,
          carrierId: data.carrierId || null,
          routeId: data.routeId || null,
          status: (data.vehicleId && data.driverId) || data.carrierId ? 'ASSIGNED' : shipmentRecord.status,
        },
        { transaction },
      );

      if (data.vehicleId) {
        await this.vehicleModel.update(
          { status: 'ASSIGNED' },
          { where: { id: data.vehicleId }, transaction },
        );
      }

      if (userId) {
        const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
        await this.auditLogModel.create(
          {
            organizationId: orgId,
            userId,
            action: 'SHIPMENT_ASSIGNED',
            module: 'shipments',
            entityType: 'Shipment',
            entityId: id,
            newValue: JSON.stringify(data),
          },
          { transaction },
        );
      }

      return this.findOne(id);
    });
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const shipment = await this.findOne(id);
    const updateData: any = { status };

    return this.withTransaction(async (transaction) => {
      if (status === 'IN_TRANSIT' && !shipment.actualPickup) {
        updateData.actualPickup = new Date();
        if (shipment.vehicleId) {
          await this.vehicleModel.update(
            { status: 'IN_TRANSIT' },
            { where: { id: shipment.vehicleId }, transaction },
          );
        }
        if (shipment.driverId) {
          await this.driverModel.update(
            { status: 'ON_TRIP' },
            { where: { id: shipment.driverId }, transaction },
          );
        }
      }

      if (status === 'DELIVERED') {
        updateData.actualDelivery = new Date();
        if (shipment.vehicleId) {
          await this.vehicleModel.update(
            { status: 'AVAILABLE' },
            { where: { id: shipment.vehicleId }, transaction },
          );
        }
        if (shipment.driverId) {
          await this.driverModel.update(
            { status: 'AVAILABLE' },
            { where: { id: shipment.driverId }, transaction },
          );
        }
      }

      const shipmentRecord = await this.findById(id);
      await shipmentRecord.update(updateData, { transaction });

      const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
      if (orgId) {
        await this.notificationModel.create(
          {
            organizationId: orgId,
            title: `Shipment ${shipment.shipmentNumber} Updated`,
            message: `Shipment status changed to ${status}`,
            type: status === 'DELIVERED' ? 'SUCCESS' : 'INFO',
            channel: 'IN_APP',
          },
          { transaction },
        );
      }

      return shipmentRecord;
    });
  }

  async submitPOD(id: string, podDto: any, user: any) {
    const shipment = await this.findOne(id);
    if (!shipment) {
      throw new NotFoundException(`Shipment #${id} not found`);
    }

    return this.withTransaction(async (transaction) => {
      // 1. Upsert ProofOfDelivery
      let pod = await this.podModel.findOne({ where: { shipmentId: id }, transaction });
      const podData = {
        shipmentId: id,
        receiverName: podDto.receiverName,
        receiverPhone: podDto.receiverContact || null,
        otpCode: podDto.otp || null,
        signatureData: podDto.signatureData || podDto.signatureUrl || null,
        photoUrl: podDto.photoUrl || null,
        deliveredAt: new Date(),
      };

      if (pod) {
        await pod.update(podData, { transaction });
      } else {
        pod = await this.podModel.create(podData, { transaction });
      }

      // 2. Mark shipment as DELIVERED
      const shipmentRecord = await this.findById(id);
      await shipmentRecord.update(
        {
          status: 'DELIVERED',
          actualDelivery: new Date(),
        },
        { transaction },
      );

      // 3. Mark vehicle & driver AVAILABLE
      if (shipment.vehicleId) {
        await this.vehicleModel.update(
          { status: 'AVAILABLE' },
          { where: { id: shipment.vehicleId }, transaction },
        );
      }
      if (shipment.driverId) {
        await this.driverModel.update(
          { status: 'AVAILABLE' },
          { where: { id: shipment.driverId }, transaction },
        );
      }

      // 4. Update dispatches to COMPLETED
      await this.dispatchModel.update(
        { status: 'COMPLETED' },
        { where: { shipmentId: id }, transaction },
      );

      // 5. Audit Log
      const orgId = shipment.transportOrder?.organizationId || shipment.organizationId;
      if (orgId) {
        await this.auditLogModel.create(
          {
            organizationId: orgId,
            userId: user.userId || user.id,
            action: 'POD_SUBMITTED_AND_VERIFIED',
            module: 'shipments',
            entityType: 'Shipment',
            entityId: id,
            newValue: JSON.stringify({
              receiverName: podDto.receiverName,
              deliveredAt: new Date(),
              hasSignature: !!(podDto.signatureData || podDto.signatureUrl),
            }),
          },
          { transaction },
        );

        // 6. Notification
        await this.notificationModel.create(
          {
            organizationId: orgId,
            title: `ePOD Submitted for Shipment ${shipment.shipmentNumber}`,
            message: `Consignee ${podDto.receiverName} signed ePOD. Ready for freight billing and settlement.`,
            type: 'SUCCESS',
            channel: 'IN_APP',
          },
          { transaction },
        );
      }

      return {
        success: true,
        pod,
        shipment: shipmentRecord,
      };
    });
  }
}
