import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, HasOne, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { LocationModel } from '../master-data/master-data.model';
import { VehicleModel, DriverModel } from '../fleet/fleet.model';
import { ProofOfDeliveryModel } from '../telematics/telematics.model';

@Table({ tableName: 'transport_orders', timestamps: true })
export class TransportOrderModel extends Model<TransportOrderModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => CustomerModel)
  @Column({ type: DataType.STRING, allowNull: true })
  customerId?: string;

  @BelongsTo(() => CustomerModel)
  customer?: CustomerModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  orderNumber: string;

  @Column({ type: DataType.STRING, defaultValue: 'NORMAL' })
  priority: string;

  @Column({ type: DataType.STRING, allowNull: true })
  lrNo?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  bookingDate?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  consignor?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  consignee?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  billingParty?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  origin?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  destination?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  route?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  product?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  quantity?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  actualWeight?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  chargedWt?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  freightBasis?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  rate?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ewayBill?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  assignedVehicle?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  assignedDriver?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  branch?: string;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: true })
  originLocationId?: string;

  @BelongsTo(() => LocationModel, 'originLocationId')
  originLocation?: LocationModel;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: true })
  destinationLocationId?: string;

  @BelongsTo(() => LocationModel, 'destinationLocationId')
  destinationLocation?: LocationModel;

  @Column({ type: DataType.DATE, allowNull: true })
  requestedPickupDate?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  requestedDeliveryDate?: Date;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalWeight: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalVolume: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  totalPackages: number;

  @Column({ type: DataType.STRING, allowNull: true })
  createdBy?: string;

  @Column({ type: DataType.STRING, defaultValue: 'DRAFT' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  specialInstructions?: string;

  @HasMany(() => OrderItemModel, { onDelete: 'CASCADE' })
  items: OrderItemModel[];

  @HasMany(() => ShipmentModel)
  shipments: ShipmentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'order_items', timestamps: true })
export class OrderItemModel extends Model<OrderItemModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => TransportOrderModel)
  @Column({ type: DataType.STRING, allowNull: false })
  transportOrderId: string;

  @BelongsTo(() => TransportOrderModel, { onDelete: 'CASCADE' })
  transportOrder: TransportOrderModel;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  quantity: number;

  @Column({ type: DataType.STRING, defaultValue: 'Pallet' })
  packageType: string;

  @Column({ type: DataType.STRING, allowNull: true })
  packageTypeId?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cargoTypeId?: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  weight: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  volume: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  fragile: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  hazardous: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'shipments', timestamps: true })
export class ShipmentModel extends Model<ShipmentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => TransportOrderModel)
  @Column({ type: DataType.STRING, allowNull: false })
  transportOrderId: string;

  @BelongsTo(() => TransportOrderModel, { onDelete: 'CASCADE' })
  transportOrder: TransportOrderModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  shipmentNumber: string;

  @ForeignKey(() => CustomerModel)
  @Column({ type: DataType.STRING, allowNull: true })
  customerId?: string;

  @BelongsTo(() => CustomerModel)
  customer?: CustomerModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: true })
  vehicleId?: string;

  @BelongsTo(() => VehicleModel)
  vehicle?: VehicleModel;

  @ForeignKey(() => DriverModel)
  @Column({ type: DataType.STRING, allowNull: true })
  driverId?: string;

  @BelongsTo(() => DriverModel)
  driver?: DriverModel;

  @Column({ type: DataType.STRING, allowNull: true })
  routeId?: string;

  @Column({ type: DataType.STRING, defaultValue: 'ROAD' })
  mode: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  distanceKm: number;

  @Column({ type: DataType.DATE, allowNull: true })
  plannedPickup?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  actualPickup?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  plannedDelivery?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  actualDelivery?: Date;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalWeight: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalVolume: number;

  @Column({ type: DataType.STRING, defaultValue: 'CREATED' })
  status: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  freightCost: number;

  @HasMany(() => ShipmentItemModel, { onDelete: 'CASCADE' })
  items: ShipmentItemModel[];

  @HasMany(() => RouteModel, { onDelete: 'CASCADE' })
  routes: RouteModel[];

  @HasMany(() => DispatchModel, { onDelete: 'CASCADE' })
  dispatches: DispatchModel[];

  @HasOne(() => ProofOfDeliveryModel, { onDelete: 'CASCADE' })
  proofOfDelivery?: ProofOfDeliveryModel;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'shipment_items', timestamps: true })
export class ShipmentItemModel extends Model<ShipmentItemModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: false })
  shipmentId: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment: ShipmentModel;

  @ForeignKey(() => OrderItemModel)
  @Column({ type: DataType.STRING, allowNull: false })
  orderItemId: string;

  @BelongsTo(() => OrderItemModel)
  orderItem: OrderItemModel;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  allocatedQuantity: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'routes', timestamps: true })
export class RouteModel extends Model<RouteModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: false })
  shipmentId: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment: ShipmentModel;

  @Column({ type: DataType.STRING, allowNull: false })
  routeName: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalDistanceKm: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  estimatedDurationMinutes: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  geometryPolyline?: string;

  @HasMany(() => RouteStopModel, { onDelete: 'CASCADE' })
  stops: RouteStopModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'route_stops', timestamps: true })
export class RouteStopModel extends Model<RouteStopModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => RouteModel)
  @Column({ type: DataType.STRING, allowNull: false })
  routeId: string;

  @BelongsTo(() => RouteModel, { onDelete: 'CASCADE' })
  route: RouteModel;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  locationId: string;

  @BelongsTo(() => LocationModel)
  location: LocationModel;

  @Column({ type: DataType.INTEGER, allowNull: false })
  stopSequence: number;

  @Column({ type: DataType.STRING, defaultValue: 'PICKUP' })
  stopType: string;

  @Column({ type: DataType.DATE, allowNull: true })
  estimatedArrival?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  actualArrival?: Date;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'load_plans', timestamps: true })
export class LoadPlanModel extends Model<LoadPlanModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  planNumber: string;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel)
  vehicle: VehicleModel;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  plannedWeightKg: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  plannedVolumeCbm: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  weightUtilizationPercent: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  volumeUtilizationPercent: number;

  @Column({ type: DataType.STRING, defaultValue: 'DRAFT' })
  status: string;

  @HasMany(() => LoadPlanItemModel, { onDelete: 'CASCADE' })
  items: LoadPlanItemModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'load_plan_items', timestamps: true })
export class LoadPlanItemModel extends Model<LoadPlanItemModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => LoadPlanModel)
  @Column({ type: DataType.STRING, allowNull: false })
  loadPlanId: string;

  @BelongsTo(() => LoadPlanModel, { onDelete: 'CASCADE' })
  loadPlan: LoadPlanModel;

  @ForeignKey(() => OrderItemModel)
  @Column({ type: DataType.STRING, allowNull: false })
  orderItemId: string;

  @BelongsTo(() => OrderItemModel)
  orderItem: OrderItemModel;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  plannedQuantity: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'dispatches', timestamps: true })
export class DispatchModel extends Model<DispatchModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: true })
  shipmentId?: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment?: ShipmentModel;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: true })
  vehicleId?: string;

  @BelongsTo(() => VehicleModel, { as: 'vehicleObj', foreignKey: 'vehicleId' })
  vehicleObj?: VehicleModel;

  @ForeignKey(() => DriverModel)
  @Column({ type: DataType.STRING, allowNull: true })
  driverId?: string;

  @BelongsTo(() => DriverModel, { as: 'driverObj', foreignKey: 'driverId' })
  driverObj?: DriverModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  dispatchNumber: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tripId?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  lrRef?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  route?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  startDate?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  vehicle?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  driver?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  coDriver?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  odoStart?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  odoEnd?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  plannedKm?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  actualKm?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  hireAmount?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  advanceToOwner?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  fuelBudget?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tollBudget?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  driverBhatta?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  loadingUnloading?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  dispatchTime?: Date;

  @Column({ type: DataType.STRING, defaultValue: 'Scheduled' })
  status: string;

  @Column({ type: DataType.DATE, allowNull: true })
  completeTime?: Date;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  startOdometer: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  endOdometer: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalKm: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  fuelLitres: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  tripExpenseTotal: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  driverSettlementAmount: number;

  @Column({ type: DataType.STRING, defaultValue: 'OPEN' })
  closureStatus: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'tender_requests', timestamps: true })
export class TenderRequestModel extends Model<TenderRequestModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: false })
  shipmentId: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment: ShipmentModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: false })
  carrierId: string;

  @BelongsTo(() => CarrierModel)
  carrier: CarrierModel;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  offeredRate: number;

  @Column({ type: DataType.DATE, allowNull: false })
  expirationTime: Date;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'driver_advances', timestamps: true })
export class DriverAdvanceModel extends Model<DriverAdvanceModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  entryId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, allowNull: false })
  driver: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tripRef: string;

  @Column({ type: DataType.STRING, defaultValue: 'Advance' })
  entryType: string;

  @Column({ type: DataType.STRING, defaultValue: 'Driver Bhatta' })
  expenseHead: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  amount: number;

  @Column({ type: DataType.STRING, defaultValue: 'Cash' })
  paymentMode: string;

  @Column({ type: DataType.STRING, defaultValue: 'Pending' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  remarks?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'tyre_events', timestamps: true })
export class TyreEventModel extends Model<TyreEventModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  eventId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, allowNull: false })
  tyreSerial: string;

  @Column({ type: DataType.STRING, allowNull: false })
  vehicle: string;

  @Column({ type: DataType.STRING, defaultValue: 'Fit' })
  eventType: string;

  @Column({ type: DataType.STRING, defaultValue: 'FR' })
  position: string;

  @Column({ type: DataType.STRING, defaultValue: '0' })
  odometer: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  remarks?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'tyre_inventory', timestamps: true })
export class TyreInventoryModel extends Model<TyreInventoryModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  serialNo: string;

  @Column({ type: DataType.STRING, allowNull: false })
  brand: string;

  @Column({ type: DataType.STRING, defaultValue: '295/80R22.5' })
  size: string;

  @Column({ type: DataType.STRING, defaultValue: 'New' })
  type: string;

  @Column({ type: DataType.STRING, defaultValue: 'Tata Rubber Ltd' })
  supplier: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  cost: number;

  @Column({ type: DataType.STRING, allowNull: true })
  vehicle?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  position?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  fitDate?: string;

  @Column({ type: DataType.STRING, defaultValue: '0' })
  fitOdom: string;

  @Column({ type: DataType.STRING, defaultValue: 'FITTED' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'job_cards', timestamps: true })
export class JobCardModel extends Model<JobCardModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  jobCardId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, allowNull: false })
  vehicle: string;

  @Column({ type: DataType.STRING, allowNull: false })
  serviceCentre: string;

  @Column({ type: DataType.STRING, defaultValue: 'Engine Overhaul' })
  workType: string;

  @Column({ type: DataType.STRING, defaultValue: 'Open' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  complaint: string;

  @Column({ type: DataType.STRING, allowNull: true })
  partsUsed?: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  labourCost: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalCost: number;

  @Column({ type: DataType.STRING, allowNull: true })
  expectedDowntime?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'pod_records', timestamps: true })
export class PodRecordModel extends Model<PodRecordModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  podId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lrRef: string;

  @Column({ type: DataType.STRING, allowNull: false })
  customer: string;

  @Column({ type: DataType.STRING, allowNull: true })
  deliveryDate?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  receiver?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  deliveredQty?: string;

  @Column({ type: DataType.STRING, defaultValue: '0' })
  shortage: string;

  @Column({ type: DataType.STRING, defaultValue: 'Driver App' })
  source: string;

  @Column({ type: DataType.STRING, defaultValue: 'Pending' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  remarks?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'billing_invoices', timestamps: true })
export class BillingInvoiceModel extends Model<BillingInvoiceModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  invoiceNo: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lrRef: string;

  @Column({ type: DataType.STRING, allowNull: false })
  customer: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  baseAmt: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0 (RCM)' })
  gst: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  total: string;

  @Column({ type: DataType.STRING, defaultValue: 'RCM 5%' })
  gstType: string;

  @Column({ type: DataType.STRING, defaultValue: '—' })
  irn: string;

  @Column({ type: DataType.STRING, allowNull: true })
  dueDate?: string;

  @Column({ type: DataType.STRING, defaultValue: 'Draft' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'purchase_bills', timestamps: true })
export class PurchaseBillModel extends Model<PurchaseBillModel> {
  @PrimaryKey
  @Column({ type: DataType.STRING, allowNull: false })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  supplier: string;

  @Column({ type: DataType.STRING, defaultValue: 'Fuel Station' })
  type: string;

  @Column({ type: DataType.STRING, allowNull: false })
  billNo: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  baseAmt: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  gst: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  total: string;

  @Column({ type: DataType.STRING, defaultValue: '—' })
  tds: string;

  @Column({ type: DataType.STRING, defaultValue: '194C' })
  tdsSection: string;

  @Column({ type: DataType.STRING, defaultValue: '—' })
  linkedRef: string;

  @Column({ type: DataType.STRING, defaultValue: 'Pending' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'settlements', timestamps: true })
export class SettlementModel extends Model<SettlementModel> {
  @PrimaryKey
  @Column({ type: DataType.STRING, allowNull: false })
  id: string;

  @Column({ type: DataType.STRING, defaultValue: 'Owner' })
  settlementType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  party: string;

  @Column({ type: DataType.STRING, allowNull: false })
  tripRef: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  grossAmt: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  advance: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  tds: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  shortage: string;

  @Column({ type: DataType.STRING, defaultValue: '₹0' })
  netPayable: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date: string;

  @Column({ type: DataType.STRING, defaultValue: 'Draft' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  remarks: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

