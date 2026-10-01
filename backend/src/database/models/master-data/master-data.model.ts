import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';

@Table({ tableName: 'location_types', timestamps: true })
export class LocationTypeModel extends Model<LocationTypeModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @HasMany(() => LocationModel)
  locations: LocationModel[];
}

@Table({ tableName: 'locations', timestamps: true })
export class LocationModel extends Model<LocationModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => LocationTypeModel)
  @Column({ type: DataType.STRING, allowNull: true })
  locationTypeId?: string;

  @BelongsTo(() => LocationTypeModel)
  locationType?: LocationTypeModel;

  @Column({ type: DataType.STRING, allowNull: true })
  code?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  city: string;

  @Column({ type: DataType.STRING, allowNull: false })
  state: string;

  @Column({ type: DataType.STRING, defaultValue: 'USA' })
  country: string;

  @Column({ type: DataType.STRING, allowNull: true })
  postalCode?: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  latitude: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  longitude: number;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'vehicle_types', timestamps: true })
export class VehicleTypeModel extends Model<VehicleTypeModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  maxWeightKg: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  maxVolumeCbm: number;

  @Column({ type: DataType.INTEGER, defaultValue: 2 })
  axleCount: number;
}

@Table({ tableName: 'cargo_types', timestamps: true })
export class CargoTypeModel extends Model<CargoTypeModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isHazardous: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  requiresTempControl: boolean;
}

@Table({ tableName: 'package_types', timestamps: true })
export class PackageTypeModel extends Model<PackageTypeModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 1.0 })
  standardWeightKg: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 1.0 })
  standardVolumeCbm: number;
}
