import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { appConfig, type AppConfig } from './config/app.config.js';
import { frameworkOptions } from './config/framework.options.js';
import { DatabaseModule } from './database/database.module.js';
import { FrameworkModule } from './framework/framework.module.js';

// Platform & Tenancy Control Plane Modules
import { PlatformModule } from './modules/platform/platform.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AclModule } from './modules/acl/acl.module.js';
import { ExceptionsModule } from './modules/exceptions/exceptions.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { BranchesModule } from './modules/branches/branches.module.js';
import { UsersModule } from './modules/users/users.module.js';

// Operational Business Modules
import { OrganizationsModule } from './organizations/organizations.module.js';
import { MasterDataModule } from './master-data/master-data.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { CarriersModule } from './carriers/carriers.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { DriversModule } from './drivers/drivers.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ShipmentsModule } from './shipments/shipments.module.js';
import { PlanningModule } from './planning/planning.module.js';
import { RoutesModule } from './routes/routes.module.js';
import { DispatchModule } from './dispatch/dispatch.module.js';
import { TrackingModule } from './tracking/tracking.module.js';
import { PodModule } from './pod/pod.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { BillingModule } from './billing/billing.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AiModule } from './ai/ai.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { LorryReceiptsModule } from './lorry-receipts/lorry-receipts.module.js';
import { HealthModule } from './health/health.module.js';
import { DemoRequestsModule } from './demo-requests/demo-requests.module.js';
import { DataAccessModule } from './common/data-access/data-access.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AdminConsoleModule } from './admin/admin-console.module.js';
import { WorkflowModule } from './workflow/workflow.module.js';
import { AssignmentModule } from './assignments/assignment.module.js';
import { WorkQueuesModule } from './work-queues/work-queues.module.js';
import { FoundationModule } from './foundation/foundation.module.js';
import { OpsModule } from './framework/ops/ops.module.js';
import { UsersModule as OperationsUsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], cache: true }),
    DatabaseModule,
    FrameworkModule.forRootAsync({ inject: [appConfig.KEY], useFactory: (config: AppConfig) => frameworkOptions(config) }),
    PlatformModule,
    AuthModule,
    AclModule,
    ExceptionsModule,
    CompaniesModule,
    BranchesModule,
    UsersModule,

    // Operational business modules
    OrganizationsModule,
    MasterDataModule,
    CustomersModule,
    CarriersModule,
    VehiclesModule,
    DriversModule,
    OrdersModule,
    ShipmentsModule,
    PlanningModule,
    RoutesModule,
    DispatchModule,
    TrackingModule,
    PodModule,
    DocumentsModule,
    BillingModule,
    NotificationsModule,
    AnalyticsModule,
    AiModule,
    AuditLogsModule,
    LorryReceiptsModule,
    HealthModule,
    DemoRequestsModule,
    DataAccessModule,
    DashboardModule,
    AdminConsoleModule,
    WorkflowModule,
    AssignmentModule,
    WorkQueuesModule,
    FoundationModule,
    OpsModule,
    OperationsUsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
