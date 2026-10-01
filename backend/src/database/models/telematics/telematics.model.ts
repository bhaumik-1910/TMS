import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { ShipmentModel, DispatchModel } from '../operations/operations.model';
import { VehicleModel } from '../fleet/fleet.model';

@Table({ tableName: 'tracking_events', timestamps: true, updatedAt: false })
export class TrackingEventModel extends Model<TrackingEventModel> {
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

  @BelongsTo(() => VehicleModel)
  vehicle?: VehicleModel;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  latitude: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  longitude: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  speedKmH: number;

  @Column({ type: DataType.STRING, defaultValue: 'NORMAL' })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  locationAddress?: string;

  @CreatedAt
  timestamp: Date;
}

@Table({ tableName: 'geofences', timestamps: true })
export class GeofenceModel extends Model<GeofenceModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, defaultValue: 'CIRCLE' })
  shapeType: string;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  centerLatitude: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  centerLongitude: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 500.0 })
  radiusMeters: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  polygonCoordinatesJson?: string;

  @HasMany(() => GeofenceEventModel, { onDelete: 'CASCADE' })
  events: GeofenceEventModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'geofence_events', timestamps: true, updatedAt: false })
export class GeofenceEventModel extends Model<GeofenceEventModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => GeofenceModel)
  @Column({ type: DataType.STRING, allowNull: false })
  geofenceId: string;

  @BelongsTo(() => GeofenceModel, { onDelete: 'CASCADE' })
  geofence: GeofenceModel;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel)
  vehicle: VehicleModel;

  @Column({ type: DataType.STRING, allowNull: false })
  eventType: string; // ENTER, EXIT

  @CreatedAt
  eventTime: Date;
}

@Table({ tableName: 'proof_of_deliveries', timestamps: true })
export class ProofOfDeliveryModel extends Model<ProofOfDeliveryModel> {
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
  receiverName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  receiverPhone?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  signatureData?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  photoUrl?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  otpCode?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  deliveredAt: Date;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  deliveryLatitude?: number;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  deliveryLongitude?: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'lorry_receipts', timestamps: true })
export class LorryReceiptModel extends Model<LorryReceiptModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => DispatchModel)
  @Column({ type: DataType.STRING, allowNull: true })
  dispatchId?: string;

  @BelongsTo(() => DispatchModel, { onDelete: 'CASCADE' })
  dispatch?: DispatchModel;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: true })
  shipmentId?: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment?: ShipmentModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  lrNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  consignorName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  consigneeName: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  chargedWeightKg: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalFreightAmount: number;

  @Column({ type: DataType.STRING, defaultValue: 'ISSUED' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
