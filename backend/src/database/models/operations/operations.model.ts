import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { LocationModel } from '../master-data/master-data.model';
import { VehicleModel, DriverModel } from '../fleet/fleet.model';

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
  @Column({ type: DataType.STRING, allowNull: false })
  customerId: string;

  @BelongsTo(() => CustomerModel)
  customer: CustomerModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  orderNumber: string;

  @Column({ type: DataType.STRING, defaultValue: 'NORMAL' })
  priority: string;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  originLocationId: string;

  @BelongsTo(() => LocationModel, 'originLocationId')
  originLocation: LocationModel;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  destinationLocationId: string;

  @BelongsTo(() => LocationModel, 'destinationLocationId')
  destinationLocation: LocationModel;

  @Column({ type: DataType.DATE, allowNull: false })
  requestedPickupDate: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  requestedDeliveryDate: Date;

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
  @Column({ type: DataType.STRING, allowNull: false })
  shipmentId: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment: ShipmentModel;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel)
  vehicle: VehicleModel;

  @ForeignKey(() => DriverModel)
  @Column({ type: DataType.STRING, allowNull: false })
  driverId: string;

  @BelongsTo(() => DriverModel)
  driver: DriverModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  dispatchNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  dispatchTime: Date;

  @Column({ type: DataType.STRING, defaultValue: 'ASSIGNED' })
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
