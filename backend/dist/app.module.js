"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const organizations_module_1 = require("./organizations/organizations.module");
const master_data_module_1 = require("./master-data/master-data.module");
const customers_module_1 = require("./customers/customers.module");
const carriers_module_1 = require("./carriers/carriers.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const drivers_module_1 = require("./drivers/drivers.module");
const orders_module_1 = require("./orders/orders.module");
const shipments_module_1 = require("./shipments/shipments.module");
const planning_module_1 = require("./planning/planning.module");
const routes_module_1 = require("./routes/routes.module");
const dispatch_module_1 = require("./dispatch/dispatch.module");
const tracking_module_1 = require("./tracking/tracking.module");
const pod_module_1 = require("./pod/pod.module");
const documents_module_1 = require("./documents/documents.module");
const billing_module_1 = require("./billing/billing.module");
const notifications_module_1 = require("./notifications/notifications.module");
const analytics_module_1 = require("./analytics/analytics.module");
const ai_module_1 = require("./ai/ai.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
const lorry_receipts_module_1 = require("./lorry-receipts/lorry-receipts.module");
const health_module_1 = require("./health/health.module");
const demo_requests_module_1 = require("./demo-requests/demo-requests.module");
const data_access_module_1 = require("./common/data-access/data-access.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const admin_console_module_1 = require("./admin/admin-console.module");
const workflow_module_1 = require("./workflow/workflow.module");
const assignment_module_1 = require("./assignments/assignment.module");
const work_queues_module_1 = require("./work-queues/work-queues.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const tenant_guard_1 = require("./common/guards/tenant.guard");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            master_data_module_1.MasterDataModule,
            customers_module_1.CustomersModule,
            carriers_module_1.CarriersModule,
            vehicles_module_1.VehiclesModule,
            drivers_module_1.DriversModule,
            orders_module_1.OrdersModule,
            shipments_module_1.ShipmentsModule,
            planning_module_1.PlanningModule,
            routes_module_1.RoutesModule,
            dispatch_module_1.DispatchModule,
            tracking_module_1.TrackingModule,
            pod_module_1.PodModule,
            documents_module_1.DocumentsModule,
            billing_module_1.BillingModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            ai_module_1.AiModule,
            audit_logs_module_1.AuditLogsModule,
            lorry_receipts_module_1.LorryReceiptsModule,
            health_module_1.HealthModule,
            demo_requests_module_1.DemoRequestsModule,
            data_access_module_1.DataAccessModule,
            dashboard_module_1.DashboardModule,
            admin_console_module_1.AdminConsoleModule,
            workflow_module_1.WorkflowModule,
            assignment_module_1.AssignmentModule,
            work_queues_module_1.WorkQueuesModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map