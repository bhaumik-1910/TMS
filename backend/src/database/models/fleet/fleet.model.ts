import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { UserModel } from '../auth/user.model';
import { CarrierModel } from '../partners/partners.model';
import { VehicleTypeModel } from '../master-data/master-data.model';

@Table({ tableName: 'vehicles', timestamps: true })
export class VehicleModel extends Model<VehicleModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => VehicleTypeModel)
  @Column({ type: DataType.STRING, allowNull: true })
  vehicleTypeId?: string;

  @BelongsTo(() => VehicleTypeModel)
  vehicleType?: VehicleTypeModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  vehicleNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  make: string;

  @Column({ type: DataType.STRING, allowNull: false })
  model: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  year: number;

  @Column({ type: DataType.STRING, allowNull: true })
  vin?: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 25000.0 })
  capacityWeight: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 80.0 })
  capacityVolume: number;

  @Column({ type: DataType.STRING, defaultValue: 'DIESEL' })
  fuelType: string;

  @Column({ type: DataType.STRING, defaultValue: 'AVAILABLE' })
  status: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  currentLatitude: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  currentLongitude: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  currentSpeed: number;

  @Column({ type: DataType.DATE, allowNull: true })
  lastLocationAt?: Date;

  @Column({ type: DataType.DOUBLE, defaultValue: 100.0 })
  fuelLevelPercent: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  currentOdometerKm: number;

  @HasMany(() => VehicleMaintenanceModel, { onDelete: 'CASCADE' })
  maintenances: VehicleMaintenanceModel[];

  @HasMany(() => VehicleDocumentModel, { onDelete: 'CASCADE' })
  documents: VehicleDocumentModel[];

  @HasMany(() => DriverAssignmentModel, { onDelete: 'CASCADE' })
  driverAssignments: DriverAssignmentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'vehicle_documents', timestamps: true })
export class VehicleDocumentModel extends Model<VehicleDocumentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel, { onDelete: 'CASCADE' })
  vehicle: VehicleModel;

  @Column({ type: DataType.STRING, allowNull: false })
  documentType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  documentNumber: string;

  @Column({ type: DataType.DATE, allowNull: true })
  expiryDate?: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  fileUrl: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'vehicle_maintenances', timestamps: true })
export class VehicleMaintenanceModel extends Model<VehicleMaintenanceModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel, { onDelete: 'CASCADE' })
  vehicle: VehicleModel;

  @Column({ type: DataType.STRING, allowNull: false })
  maintenanceType: string;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledDate: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  completedDate?: Date;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  cost: number;

  @Column({ type: DataType.STRING, defaultValue: 'SCHEDULED' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'drivers', timestamps: true })
export class DriverModel extends Model<DriverModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.STRING, allowNull: true })
  userId?: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  employeeCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email?: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  licenseNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  licenseExpiry: Date;

  @Column({ type: DataType.FLOAT, defaultValue: 4.8 })
  safetyScore: number;

  @Column({ type: DataType.STRING, defaultValue: 'AVAILABLE' })
  status: string;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  currentLatitude?: number;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  currentLongitude?: number;

  @HasMany(() => DriverDocumentModel, { onDelete: 'CASCADE' })
  documents: DriverDocumentModel[];

  @HasMany(() => DriverAssignmentModel, { onDelete: 'CASCADE' })
  assignments: DriverAssignmentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'driver_documents', timestamps: true })
export class DriverDocumentModel extends Model<DriverDocumentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => DriverModel)
  @Column({ type: DataType.STRING, allowNull: false })
  driverId: string;

  @BelongsTo(() => DriverModel, { onDelete: 'CASCADE' })
  driver: DriverModel;

  @Column({ type: DataType.STRING, allowNull: false })
  documentType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  documentNumber: string;

  @Column({ type: DataType.DATE, allowNull: true })
  expiryDate?: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  fileUrl: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'driver_assignments', timestamps: true })
export class DriverAssignmentModel extends Model<DriverAssignmentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => DriverModel)
  @Column({ type: DataType.STRING, allowNull: false })
  driverId: string;

  @BelongsTo(() => DriverModel, { onDelete: 'CASCADE' })
  driver: DriverModel;

  @ForeignKey(() => VehicleModel)
  @Column({ type: DataType.STRING, allowNull: false })
  vehicleId: string;

  @BelongsTo(() => VehicleModel, { onDelete: 'CASCADE' })
  vehicle: VehicleModel;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  startDate: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endDate?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  releasedAt?: Date;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
