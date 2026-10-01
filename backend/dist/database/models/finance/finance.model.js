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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingSyncModel = exports.ClaimItemModel = exports.ClaimModel = exports.TripExpenseModel = exports.PaymentModel = exports.InvoiceItemModel = exports.InvoiceModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const organization_model_1 = require("../auth/organization.model");
const partners_model_1 = require("../partners/partners.model");
const operations_model_1 = require("../operations/operations.model");
let InvoiceModel = class InvoiceModel extends sequelize_typescript_1.Model {
};
exports.InvoiceModel = InvoiceModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], InvoiceModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.OrganizationModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.OrganizationModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", organization_model_1.OrganizationModel)
], InvoiceModel.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CustomerModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CustomerModel),
    __metadata("design:type", partners_model_1.CustomerModel)
], InvoiceModel.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => partners_model_1.CarrierModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => partners_model_1.CarrierModel),
    __metadata("design:type", partners_model_1.CarrierModel)
], InvoiceModel.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.ShipmentModel),
    __metadata("design:type", operations_model_1.ShipmentModel)
], InvoiceModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "invoiceNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'CUSTOMER_BILLING' }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "invoiceType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceModel.prototype, "subTotal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceModel.prototype, "taxAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceModel.prototype, "totalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceModel.prototype, "contractedAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceModel.prototype, "varianceAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], InvoiceModel.prototype, "invoiceDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], InvoiceModel.prototype, "dueDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'UNPAID' }),
    __metadata("design:type", String)
], InvoiceModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => InvoiceItemModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], InvoiceModel.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => PaymentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], InvoiceModel.prototype, "payments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], InvoiceModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], InvoiceModel.prototype, "updatedAt", void 0);
exports.InvoiceModel = InvoiceModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'invoices', timestamps: true })
], InvoiceModel);
let InvoiceItemModel = class InvoiceItemModel extends sequelize_typescript_1.Model {
};
exports.InvoiceItemModel = InvoiceItemModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], InvoiceItemModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => InvoiceModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], InvoiceItemModel.prototype, "invoiceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => InvoiceModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", InvoiceModel)
], InvoiceItemModel.prototype, "invoice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], InvoiceItemModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 1.0 }),
    __metadata("design:type", Number)
], InvoiceItemModel.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceItemModel.prototype, "unitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceItemModel.prototype, "totalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], InvoiceItemModel.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], InvoiceItemModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], InvoiceItemModel.prototype, "updatedAt", void 0);
exports.InvoiceItemModel = InvoiceItemModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'invoice_items', timestamps: true })
], InvoiceItemModel);
let PaymentModel = class PaymentModel extends sequelize_typescript_1.Model {
};
exports.PaymentModel = PaymentModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PaymentModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => InvoiceModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PaymentModel.prototype, "invoiceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => InvoiceModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", InvoiceModel)
], PaymentModel.prototype, "invoice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], PaymentModel.prototype, "paymentReference", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], PaymentModel.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], PaymentModel.prototype, "paymentDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'WIRE_TRANSFER' }),
    __metadata("design:type", String)
], PaymentModel.prototype, "paymentMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PaymentModel.prototype, "transactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'COMPLETED' }),
    __metadata("design:type", String)
], PaymentModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], PaymentModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], PaymentModel.prototype, "updatedAt", void 0);
exports.PaymentModel = PaymentModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'payments', timestamps: true })
], PaymentModel);
let TripExpenseModel = class TripExpenseModel extends sequelize_typescript_1.Model {
};
exports.TripExpenseModel = TripExpenseModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], TripExpenseModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.DispatchModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TripExpenseModel.prototype, "dispatchId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.DispatchModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.DispatchModel)
], TripExpenseModel.prototype, "dispatch", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], TripExpenseModel.prototype, "expenseType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], TripExpenseModel.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], TripExpenseModel.prototype, "receiptUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'PENDING' }),
    __metadata("design:type", String)
], TripExpenseModel.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], TripExpenseModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], TripExpenseModel.prototype, "updatedAt", void 0);
exports.TripExpenseModel = TripExpenseModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'trip_expenses', timestamps: true })
], TripExpenseModel);
let ClaimModel = class ClaimModel extends sequelize_typescript_1.Model {
};
exports.ClaimModel = ClaimModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ClaimModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => operations_model_1.ShipmentModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ClaimModel.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => operations_model_1.ShipmentModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", operations_model_1.ShipmentModel)
], ClaimModel.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true, allowNull: false }),
    __metadata("design:type", String)
], ClaimModel.prototype, "claimNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'DAMAGE' }),
    __metadata("design:type", String)
], ClaimModel.prototype, "claimType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ClaimModel.prototype, "claimedAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ClaimModel.prototype, "approvedAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'FILED' }),
    __metadata("design:type", String)
], ClaimModel.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], ClaimModel.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ClaimItemModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], ClaimModel.prototype, "items", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ClaimModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ClaimModel.prototype, "updatedAt", void 0);
exports.ClaimModel = ClaimModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'claims', timestamps: true })
], ClaimModel);
let ClaimItemModel = class ClaimItemModel extends sequelize_typescript_1.Model {
};
exports.ClaimItemModel = ClaimItemModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ClaimItemModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ClaimModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ClaimItemModel.prototype, "claimId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ClaimModel, { onDelete: 'CASCADE' }),
    __metadata("design:type", ClaimModel)
], ClaimItemModel.prototype, "claim", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ClaimItemModel.prototype, "itemDescription", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1 }),
    __metadata("design:type", Number)
], ClaimItemModel.prototype, "quantityDamaged", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, defaultValue: 0.0 }),
    __metadata("design:type", Number)
], ClaimItemModel.prototype, "claimedCost", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ClaimItemModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ClaimItemModel.prototype, "updatedAt", void 0);
exports.ClaimItemModel = ClaimItemModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'claim_items', timestamps: true })
], ClaimItemModel);
let AccountingSyncModel = class AccountingSyncModel extends sequelize_typescript_1.Model {
};
exports.AccountingSyncModel = AccountingSyncModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "entityType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "entityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'QUICKBOOKS' }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "externalSystem", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "externalId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'PENDING' }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "syncStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], AccountingSyncModel.prototype, "errorMessage", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], AccountingSyncModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], AccountingSyncModel.prototype, "updatedAt", void 0);
exports.AccountingSyncModel = AccountingSyncModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'accounting_syncs', timestamps: true })
], AccountingSyncModel);
//# sourceMappingURL=finance.model.js.map