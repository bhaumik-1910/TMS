import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';

@Table({ tableName: 'customers', timestamps: true })
export class CustomerModel extends Model<CustomerModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  customerCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  companyName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  contactName?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  billingAddress?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  shippingAddress?: string;

  @Column({ type: DataType.STRING, defaultValue: 'NET_30' })
  paymentTerms: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 50000.0 })
  creditLimit: number;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'carriers', timestamps: true })
export class CarrierModel extends Model<CarrierModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  carrierCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  companyName: string;

  @Column({ type: DataType.STRING, allowNull: true })
  contactName?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  taxNumber?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  scacNumber?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  dotNumber?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  mcNumber?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.FLOAT, defaultValue: 95.0 })
  onTimeDeliveryRate: number;

  @Column({ type: DataType.FLOAT, defaultValue: 4.5 })
  rating: number;

  @Column({ type: DataType.STRING, defaultValue: 'APPROVED' })
  status: string;

  @HasMany(() => CarrierContractModel, { onDelete: 'CASCADE' })
  contracts: CarrierContractModel[];

  @HasMany(() => CarrierRateModel, { onDelete: 'CASCADE' })
  rates: CarrierRateModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'carrier_contracts', timestamps: true })
export class CarrierContractModel extends Model<CarrierContractModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: false })
  carrierId: string;

  @BelongsTo(() => CarrierModel, { onDelete: 'CASCADE' })
  carrier: CarrierModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  contractNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  endDate: Date;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'carrier_rates', timestamps: true })
export class CarrierRateModel extends Model<CarrierRateModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: false })
  carrierId: string;

  @BelongsTo(() => CarrierModel, { onDelete: 'CASCADE' })
  carrier: CarrierModel;

  @Column({ type: DataType.STRING, allowNull: false })
  originLocationId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  destinationLocationId: string;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  baseRate: number;

  @Column({ type: DataType.STRING, defaultValue: 'PER_KM' })
  rateType: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  validFrom: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  validTo: Date;

  @Column({ type: DataType.STRING, defaultValue: 'ACTIVE' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'carrier_documents', timestamps: true })
export class CarrierDocumentModel extends Model<CarrierDocumentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: false })
  carrierId: string;

  @BelongsTo(() => CarrierModel, { onDelete: 'CASCADE' })
  carrier: CarrierModel;

  @Column({ type: DataType.STRING, allowNull: false })
  documentType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  documentUrl: string;

  @Column({ type: DataType.DATE, allowNull: true })
  expiryDate?: Date;

  @Column({ type: DataType.STRING, defaultValue: 'VERIFIED' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
