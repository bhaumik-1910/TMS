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
const app_controller_js_1 = require("./app.controller.js");
const app_config_js_1 = require("./config/app.config.js");
const framework_options_js_1 = require("./config/framework.options.js");
const database_module_js_1 = require("./database/database.module.js");
const framework_module_js_1 = require("./framework/framework.module.js");
const platform_module_js_1 = require("./modules/platform/platform.module.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
const acl_module_js_1 = require("./modules/acl/acl.module.js");
const exceptions_module_js_1 = require("./modules/exceptions/exceptions.module.js");
const companies_module_js_1 = require("./modules/companies/companies.module.js");
const branches_module_js_1 = require("./modules/branches/branches.module.js");
const users_module_js_1 = require("./modules/users/users.module.js");
const organizations_module_js_1 = require("./organizations/organizations.module.js");
const master_data_module_js_1 = require("./master-data/master-data.module.js");
const customers_module_js_1 = require("./customers/customers.module.js");
const carriers_module_js_1 = require("./carriers/carriers.module.js");
const vehicles_module_js_1 = require("./vehicles/vehicles.module.js");
const drivers_module_js_1 = require("./drivers/drivers.module.js");
const orders_module_js_1 = require("./orders/orders.module.js");
const shipments_module_js_1 = require("./shipments/shipments.module.js");
const planning_module_js_1 = require("./planning/planning.module.js");
const routes_module_js_1 = require("./routes/routes.module.js");
const dispatch_module_js_1 = require("./dispatch/dispatch.module.js");
const tracking_module_js_1 = require("./tracking/tracking.module.js");
const pod_module_js_1 = require("./pod/pod.module.js");
const documents_module_js_1 = require("./documents/documents.module.js");
const billing_module_js_1 = require("./billing/billing.module.js");
const notifications_module_js_1 = require("./notifications/notifications.module.js");
const analytics_module_js_1 = require("./analytics/analytics.module.js");
const ai_module_js_1 = require("./ai/ai.module.js");
const audit_logs_module_js_1 = require("./audit-logs/audit-logs.module.js");
const lorry_receipts_module_js_1 = require("./lorry-receipts/lorry-receipts.module.js");
const health_module_js_1 = require("./health/health.module.js");
const demo_requests_module_js_1 = require("./demo-requests/demo-requests.module.js");
const data_access_module_js_1 = require("./common/data-access/data-access.module.js");
const dashboard_module_js_1 = require("./dashboard/dashboard.module.js");
const admin_console_module_js_1 = require("./admin/admin-console.module.js");
const workflow_module_js_1 = require("./workflow/workflow.module.js");
const assignment_module_js_1 = require("./assignments/assignment.module.js");
const work_queues_module_js_1 = require("./work-queues/work-queues.module.js");
const foundation_module_js_1 = require("./foundation/foundation.module.js");
const ops_module_js_1 = require("./framework/ops/ops.module.js");
const users_module_js_2 = require("./users/users.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [app_config_js_1.appConfig], cache: true }),
            database_module_js_1.DatabaseModule,
            framework_module_js_1.FrameworkModule.forRootAsync({ inject: [app_config_js_1.appConfig.KEY], useFactory: (config) => (0, framework_options_js_1.frameworkOptions)(config) }),
            platform_module_js_1.PlatformModule,
            auth_module_js_1.AuthModule,
            acl_module_js_1.AclModule,
            exceptions_module_js_1.ExceptionsModule,
            companies_module_js_1.CompaniesModule,
            branches_module_js_1.BranchesModule,
            users_module_js_1.UsersModule,
            organizations_module_js_1.OrganizationsModule,
            master_data_module_js_1.MasterDataModule,
            customers_module_js_1.CustomersModule,
            carriers_module_js_1.CarriersModule,
            vehicles_module_js_1.VehiclesModule,
            drivers_module_js_1.DriversModule,
            orders_module_js_1.OrdersModule,
            shipments_module_js_1.ShipmentsModule,
            planning_module_js_1.PlanningModule,
            routes_module_js_1.RoutesModule,
            dispatch_module_js_1.DispatchModule,
            tracking_module_js_1.TrackingModule,
            pod_module_js_1.PodModule,
            documents_module_js_1.DocumentsModule,
            billing_module_js_1.BillingModule,
            notifications_module_js_1.NotificationsModule,
            analytics_module_js_1.AnalyticsModule,
            ai_module_js_1.AiModule,
            audit_logs_module_js_1.AuditLogsModule,
            lorry_receipts_module_js_1.LorryReceiptsModule,
            health_module_js_1.HealthModule,
            demo_requests_module_js_1.DemoRequestsModule,
            data_access_module_js_1.DataAccessModule,
            dashboard_module_js_1.DashboardModule,
            admin_console_module_js_1.AdminConsoleModule,
            workflow_module_js_1.WorkflowModule,
            assignment_module_js_1.AssignmentModule,
            work_queues_module_js_1.WorkQueuesModule,
            foundation_module_js_1.FoundationModule,
            ops_module_js_1.OpsModule,
            users_module_js_2.UsersModule,
        ],
        controllers: [app_controller_js_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map