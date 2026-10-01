import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { CustomerModel, CarrierModel } from '../partners/partners.model';
import { ShipmentModel, DispatchModel } from '../operations/operations.model';

@Table({ tableName: 'invoices', timestamps: true })
export class InvoiceModel extends Model<InvoiceModel> {
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

  @ForeignKey(() => CarrierModel)
  @Column({ type: DataType.STRING, allowNull: true })
  carrierId?: string;

  @BelongsTo(() => CarrierModel)
  carrier?: CarrierModel;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: true })
  shipmentId?: string;

  @BelongsTo(() => ShipmentModel)
  shipment?: ShipmentModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  invoiceNumber: string;

  @Column({ type: DataType.STRING, defaultValue: 'CUSTOMER_BILLING' })
  invoiceType: string; // CUSTOMER_BILLING, CARRIER_FREIGHT_BILL

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  subTotal: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  taxAmount: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalAmount: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  contractedAmount: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  varianceAmount: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  invoiceDate: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  dueDate: Date;

  @Column({ type: DataType.STRING, defaultValue: 'UNPAID' })
  status: string;

  @HasMany(() => InvoiceItemModel, { onDelete: 'CASCADE' })
  items: InvoiceItemModel[];

  @HasMany(() => PaymentModel, { onDelete: 'CASCADE' })
  payments: PaymentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'invoice_items', timestamps: true })
export class InvoiceItemModel extends Model<InvoiceItemModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => InvoiceModel)
  @Column({ type: DataType.STRING, allowNull: false })
  invoiceId: string;

  @BelongsTo(() => InvoiceModel, { onDelete: 'CASCADE' })
  invoice: InvoiceModel;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 1.0 })
  quantity: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  unitPrice: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  totalAmount: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  amount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'payments', timestamps: true })
export class PaymentModel extends Model<PaymentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => InvoiceModel)
  @Column({ type: DataType.STRING, allowNull: false })
  invoiceId: string;

  @BelongsTo(() => InvoiceModel, { onDelete: 'CASCADE' })
  invoice: InvoiceModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  paymentReference: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  amount: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  paymentDate: Date;

  @Column({ type: DataType.STRING, defaultValue: 'WIRE_TRANSFER' })
  paymentMethod: string;

  @Column({ type: DataType.STRING, allowNull: true })
  transactionId?: string;

  @Column({ type: DataType.STRING, defaultValue: 'COMPLETED' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'trip_expenses', timestamps: true })
export class TripExpenseModel extends Model<TripExpenseModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => DispatchModel)
  @Column({ type: DataType.STRING, allowNull: false })
  dispatchId: string;

  @BelongsTo(() => DispatchModel, { onDelete: 'CASCADE' })
  dispatch: DispatchModel;

  @Column({ type: DataType.STRING, allowNull: false })
  expenseType: string; // TOLL, FUEL, MAINTENANCE, PERMIT, MEALS

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  amount: number;

  @Column({ type: DataType.STRING, allowNull: true })
  receiptUrl?: string;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'claims', timestamps: true })
export class ClaimModel extends Model<ClaimModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ShipmentModel)
  @Column({ type: DataType.STRING, allowNull: false })
  shipmentId: string;

  @BelongsTo(() => ShipmentModel, { onDelete: 'CASCADE' })
  shipment: ShipmentModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  claimNumber: string;

  @Column({ type: DataType.STRING, defaultValue: 'DAMAGE' })
  claimType: string;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  claimedAmount: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  approvedAmount: number;

  @Column({ type: DataType.STRING, defaultValue: 'FILED' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  reason?: string;

  @HasMany(() => ClaimItemModel, { onDelete: 'CASCADE' })
  items: ClaimItemModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'claim_items', timestamps: true })
export class ClaimItemModel extends Model<ClaimItemModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => ClaimModel)
  @Column({ type: DataType.STRING, allowNull: false })
  claimId: string;

  @BelongsTo(() => ClaimModel, { onDelete: 'CASCADE' })
  claim: ClaimModel;

  @Column({ type: DataType.STRING, allowNull: false })
  itemDescription: string;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  quantityDamaged: number;

  @Column({ type: DataType.DOUBLE, defaultValue: 0.0 })
  claimedCost: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'accounting_syncs', timestamps: true })
export class AccountingSyncModel extends Model<AccountingSyncModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  entityType: string; // INVOICE, PAYMENT, EXPENSE

  @Column({ type: DataType.STRING, allowNull: false })
  entityId: string;

  @Column({ type: DataType.STRING, defaultValue: 'QUICKBOOKS' })
  externalSystem: string;

  @Column({ type: DataType.STRING, allowNull: true })
  externalId?: string;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  syncStatus: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  errorMessage?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
