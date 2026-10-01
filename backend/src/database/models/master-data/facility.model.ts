import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { LocationModel } from './master-data.model';

@Table({ tableName: 'facilities', timestamps: true })
export class FacilityModel extends Model<FacilityModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => LocationModel)
  @Column({ type: DataType.STRING, allowNull: true })
  locationId?: string;

  @BelongsTo(() => LocationModel)
  location?: LocationModel;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, defaultValue: 'DISTRIBUTION_CENTER' })
  type: string;

  @Column({ type: DataType.INTEGER, defaultValue: 10 })
  capacityDocks: number;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @HasMany(() => DockModel, { onDelete: 'CASCADE' })
  docks: DockModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'docks', timestamps: true })
export class DockModel extends Model<DockModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => FacilityModel)
  @Column({ type: DataType.STRING, allowNull: false })
  facilityId: string;

  @BelongsTo(() => FacilityModel, { onDelete: 'CASCADE' })
  facility: FacilityModel;

  @Column({ type: DataType.STRING, allowNull: false })
  dockNumber: string;

  @Column({ type: DataType.STRING, defaultValue: 'CROSS_DOCK' })
  dockType: string;

  @Column({ type: DataType.STRING, defaultValue: 'AVAILABLE' })
  status: string;

  @HasMany(() => AppointmentModel, { onDelete: 'CASCADE' })
  appointments: AppointmentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'appointments', timestamps: true })
export class AppointmentModel extends Model<AppointmentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => DockModel)
  @Column({ type: DataType.STRING, allowNull: false })
  dockId: string;

  @BelongsTo(() => DockModel, { onDelete: 'CASCADE' })
  dock: DockModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  appointmentNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledTime: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 60 })
  estimatedDurationMinutes: number;

  @Column({ type: DataType.STRING, defaultValue: 'SCHEDULED' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
