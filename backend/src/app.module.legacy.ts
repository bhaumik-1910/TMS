import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MasterDataModule } from './master-data/master-data.module';
import { CustomersModule } from './customers/customers.module';
import { CarriersModule } from './carriers/carriers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { OrdersModule } from './orders/orders.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { PlanningModule } from './planning/planning.module';
import { RoutesModule } from './routes/routes.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { TrackingModule } from './tracking/tracking.module';
import { PodModule } from './pod/pod.module';
import { DocumentsModule } from './documents/documents.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { LorryReceiptsModule } from './lorry-receipts/lorry-receipts.module';
import { HealthModule } from './health/health.module';
import { DemoRequestsModule } from './demo-requests/demo-requests.module';
import { DataAccessModule } from './common/data-access/data-access.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminConsoleModule } from './admin/admin-console.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AssignmentModule } from './assignments/assignment.module';
import { WorkQueuesModule } from './work-queues/work-queues.module';
import { FoundationModule } from './foundation/foundation.module';
import { OpsModule } from './framework/ops/ops.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
