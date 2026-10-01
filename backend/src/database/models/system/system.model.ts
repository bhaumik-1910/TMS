import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { OrganizationModel } from '../auth/organization.model';
import { UserModel } from '../auth/user.model';

@Table({ tableName: 'notifications', timestamps: true, updatedAt: false })
export class NotificationModel extends Model<NotificationModel> {
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

  @BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
  user?: UserModel;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  message: string;

  @Column({ type: DataType.STRING, defaultValue: 'INFO' })
  type: string;

  @Column({ type: DataType.STRING, defaultValue: 'IN_APP' })
  channel: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isRead: boolean;

  @CreatedAt
  createdAt: Date;
}

@Table({ tableName: 'audit_logs', timestamps: true, updatedAt: false })
export class AuditLogModel extends Model<AuditLogModel> {
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

  @BelongsTo(() => UserModel, { onDelete: 'SET NULL' })
  user?: UserModel;

  @Column({ type: DataType.STRING, allowNull: false })
  action: string;

  @Column({ type: DataType.STRING, allowNull: false })
  module: string;

  @Column({ type: DataType.STRING, allowNull: false })
  entityType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  entityId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  oldValue?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  newValue?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ipAddress?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  userAgent?: string;

  @CreatedAt
  createdAt: Date;
}

@Table({ tableName: 'analytics_data', timestamps: true, updatedAt: false })
export class AnalyticsDataModel extends Model<AnalyticsDataModel> {
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
  metricType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  metricKey: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  metricValue: number;

  @CreatedAt
  periodDate: Date;
}

@Table({ tableName: 'document_types', timestamps: true })
export class DocumentTypeModel extends Model<DocumentTypeModel> {
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

  @HasMany(() => DocumentModel)
  documents: DocumentModel[];
}

@Table({ tableName: 'documents', timestamps: true })
export class DocumentModel extends Model<DocumentModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @ForeignKey(() => OrganizationModel)
  @Column({ type: DataType.STRING, allowNull: false })
  organizationId: string;

  @BelongsTo(() => OrganizationModel, { onDelete: 'CASCADE' })
  organization: OrganizationModel;

  @ForeignKey(() => DocumentTypeModel)
  @Column({ type: DataType.STRING, allowNull: true })
  typeId?: string;

  @BelongsTo(() => DocumentTypeModel)
  type?: DocumentTypeModel;

  @Column({ type: DataType.STRING, allowNull: false })
  entityType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  entityId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  fileName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  fileUrl: string;

  @Column({ type: DataType.STRING, allowNull: true })
  mimeType?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  fileSizeBytes: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table({ tableName: 'demo_requests', timestamps: true })
export class DemoRequestModel extends Model<DemoRequestModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  company?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  message?: string;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
