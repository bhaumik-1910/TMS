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
exports.WorkQueuesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const data_access_service_1 = require("../common/data-access/data-access.service");
const models_1 = require("../database/models");
let WorkQueuesService = class WorkQueuesService {
    constructor(orderModel, shipmentModel, invoiceModel, vehicleDocModel, dataAccessService) {
        this.orderModel = orderModel;
        this.shipmentModel = shipmentModel;
        this.invoiceModel = invoiceModel;
        this.vehicleDocModel = vehicleDocModel;
        this.dataAccessService = dataAccessService;
    }
    async getMyQueue(user) {
        const roles = user.roles || [];
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
    async getPlanningQueue(user) {
        const where = {
            status: { [sequelize_2.Op.in]: ['SUBMITTED', 'CONFIRMED', 'PLANNING'] },
        };
        const orgId = this.dataAccessService.resolveOrganizationId(user);
        if (orgId)
            where.organizationId = orgId;
        const orders = await this.orderModel.findAll({
            where,
            include: [
                { model: models_1.LocationModel, as: 'originLocation', required: false },
                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                { model: models_1.CustomerModel, required: false },
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
            priority: o.priority || 'NORMAL',
            workflowState: o.status,
            assignedRole: 'TRANSPORT_PLANNER',
            dueAt: (o.requestedPickupDate || new Date()).toISOString(),
            slaStatus: o.priority === 'HIGH' || o.priority === 'URGENT' ? 'DUE_SOON' : 'ON_TRACK',
            nextActionLabel: 'Consolidate & Plan Load',
            nextActionRoute: `/planning?orderId=${o.id}`,
        }));
    }
    async getDispatchQueue(user) {
        const where = {
            status: { [sequelize_2.Op.in]: ['PLANNED', 'ASSIGNED'] },
        };
        const orgId = this.dataAccessService.resolveOrganizationId(user);
        if (orgId)
            where['$transportOrder.organizationId$'] = orgId;
        const shipments = await this.shipmentModel.findAll({
            where,
            include: [
                { model: models_1.DriverModel, required: false },
                { model: models_1.VehicleModel, required: false },
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                        { model: models_1.CustomerModel, required: false },
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
    async getDriverQueue(user) {
        const where = await this.dataAccessService.getShipmentWhere(user);
        const shipments = await this.shipmentModel.findAll({
            where,
            include: [
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
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
    async getCustomerQueue(user) {
        const where = await this.dataAccessService.getShipmentWhere(user);
        const shipments = await this.shipmentModel.findAll({
            where,
            include: [
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
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
    async getCarrierQueue(user) {
        const where = await this.dataAccessService.getShipmentWhere(user);
        const shipments = await this.shipmentModel.findAll({
            where,
            include: [
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
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
    async getFinanceQueue(user) {
        const where = await this.dataAccessService.getInvoiceWhere(user);
        const invoices = await this.invoiceModel.findAll({
            where: { ...where, status: { [sequelize_2.Op.in]: ['DRAFT', 'ISSUED', 'UNPAID', 'PENDING'] } },
            include: [{ model: models_1.CustomerModel, required: false }],
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
    async getComplianceQueue(user) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const vehicleDocs = await this.vehicleDocModel.findAll({
            where: { expiryDate: { [sequelize_2.Op.lte]: thirtyDaysFromNow } },
            include: [{ model: models_1.VehicleModel, required: false }],
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
    async getSupportQueue(user) {
        const shipments = await this.shipmentModel.findAll({
            where: {
                status: { [sequelize_2.Op.in]: ['DISPATCHED', 'IN_TRANSIT'] },
            },
            include: [
                {
                    model: models_1.TransportOrderModel,
                    required: false,
                    include: [
                        { model: models_1.LocationModel, as: 'originLocation', required: false },
                        { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                        { model: models_1.CustomerModel, required: false },
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
    async getOperationsQueue(user) {
        const [planning, dispatch] = await Promise.all([
            this.getPlanningQueue(user),
            this.getDispatchQueue(user),
        ]);
        return [...dispatch, ...planning].slice(0, 20);
    }
};
exports.WorkQueuesService = WorkQueuesService;
exports.WorkQueuesService = WorkQueuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.TransportOrderModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.InvoiceModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.VehicleDocumentModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, data_access_service_1.DataAccessService])
], WorkQueuesService);
//# sourceMappingURL=work-queues.service.js.map