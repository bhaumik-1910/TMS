import { RouteRecordRaw } from 'vue-router';
import { PERMISSIONS } from '../constants/permissions';

export const routes: RouteRecordRaw[] = [
  // Public Marketing Landing Page
  {
    path: '/',
    name: 'landing',
    component: () => import('../pages/landing/LandingPage.vue'),
    meta: { public: true },
  },
  {
    path: '/landing',
    redirect: '/',
  },

  // 403 Forbidden Access Page
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../pages/error/Error403Page.vue'),
    meta: { public: true },
  },

  // Authentication Layout
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../pages/auth/LoginPage.vue'),
        meta: { public: true },
      },
    ],
  },

  // Authenticated Console Layout with Strict RBAC Permissions
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../pages/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DASHBOARD_VIEW },
      },
      {
        path: 'process-flow',
        redirect: '/dashboard',
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('../pages/orders/OrdersPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.SHIPMENT_VIEW },
      },
      {
        path: 'lr-consignments',
        name: 'lr-consignments',
        component: () => import('../pages/consignments/LorryReceiptsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DOCUMENT_VIEW },
      },
      {
        path: 'shipments',
        name: 'shipments',
        component: () => import('../pages/shipments/ShipmentsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.SHIPMENT_VIEW },
      },
      {
        path: 'planning',
        name: 'planning',
        component: () => import('../pages/planning/PlanningPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.ROUTE_VIEW },
      },
      {
        path: 'dispatch',
        name: 'dispatch',
        component: () => import('../pages/dispatch/DispatchPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DISPATCH_VIEW },
      },
      {
        path: 'tracking',
        name: 'tracking',
        component: () => import('../pages/tracking/TrackingPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.TRACKING_VIEW },
      },
      {
        path: 'fleet',
        name: 'fleet',
        component: () => import('../pages/fleet/FleetPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.FLEET_VIEW },
      },
      {
        path: 'drivers',
        name: 'drivers',
        component: () => import('../pages/drivers/DriversPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DRIVER_VIEW },
      },
      {
        path: 'driver-app',
        name: 'driver-app',
        component: () => import('../pages/driver-app/DriverMobilePage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.POD_CREATE },
      },
      {
        path: 'carriers',
        name: 'carriers',
        component: () => import('../pages/carriers/CarriersPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.CARRIER_VIEW },
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('../pages/customers/CustomersPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.SHIPMENT_VIEW },
      },
      {
        path: 'routes',
        name: 'routes',
        component: () => import('../pages/routes/RoutesPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.ROUTE_VIEW },
      },
      {
        path: 'fuel',
        name: 'fuel',
        component: () => import('../pages/fleet/FuelEntryPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.FLEET_VIEW },
      },
      {
        path: 'driver-advances',
        name: 'driver-advances',
        component: () => import('../pages/dispatch/DriverAdvancesPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DISPATCH_VIEW },
      },
      {
        path: 'tyres',
        name: 'tyres',
        component: () => import('../pages/fleet/TyreOperationsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.FLEET_VIEW },
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('../pages/fleet/MaintenancePage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.FLEET_VIEW },
      },
      {
        path: 'billing',
        name: 'billing',
        component: () => import('../pages/billing/BillingPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.BILLING_VIEW },
      },
      {
        path: 'purchase-bills',
        name: 'purchase-bills',
        component: () => import('../pages/billing/PurchaseBillsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.BILLING_VIEW },
      },
      {
        path: 'settlements',
        name: 'settlements',
        component: () => import('../pages/billing/SettlementsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.BILLING_VIEW },
      },
      {
        path: 'freight-audit',
        name: 'freight-audit',
        component: () => import('../pages/freight-audit/FreightAuditPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.FREIGHT_AUDIT_VIEW },
      },
      {
        path: 'accounting-sync',
        name: 'accounting-sync',
        component: () => import('../pages/accounting-sync/AccountingSyncPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.BILLING_VIEW },
      },
      {
        path: 'pod',
        name: 'pod',
        component: () => import('../pages/pod/PodPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.POD_VIEW },
      },
      {
        path: 'documents',
        name: 'documents',
        component: () => import('../pages/documents/DocumentsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DOCUMENT_VIEW },
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('../pages/analytics/AnalyticsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.ANALYTICS_VIEW },
      },
      {
        path: 'exceptions',
        name: 'exceptions',
        component: () => import('../pages/exceptions/ExceptionInboxPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.EXCEPTION_VIEW },
      },
      {
        path: 'copilot',
        name: 'copilot',
        component: () => import('../pages/copilot/GatiCopilotPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.DASHBOARD_VIEW },
      },
      {
        path: 'audit-logs',
        name: 'audit-logs',
        component: () => import('../pages/audit/AuditLogsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.AUDIT_VIEW },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('../pages/admin/UsersManagementPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.USER_VIEW },
      },
      {
        path: 'admin/system',
        name: 'admin-system',
        component: () => import('../pages/admin/SystemConsolePage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.SETTINGS_VIEW },
      },
      {
        path: 'admin/roles',
        name: 'admin-roles',
        component: () => import('../pages/admin/RolesManagementPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.ROLE_VIEW },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../pages/settings/SettingsPage.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.SETTINGS_VIEW },
      },
      // Convenience Aliases for Master TMS Navigation
      {
        path: 'rates',
        redirect: '/carriers',
      },
      {
        path: 'claims',
        redirect: '/freight-audit',
      },
      {
        path: 'reports',
        redirect: '/analytics',
      },
      {
        path: 'appointments',
        redirect: '/dispatch',
      },
      {
        path: 'profile',
        redirect: '/settings',
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/dashboard',
  },
];
