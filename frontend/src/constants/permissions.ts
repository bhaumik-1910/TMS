// Centralized TMS Permission Definitions (Format: module:action)

export const PERMISSIONS = {
  // Wildcard
  ALL: '*',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Users & Administration
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Organization
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_UPDATE: 'organization:update',

  // Roles & Permissions
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_MANAGE: 'permission:manage',

  // Shipments & Orders
  SHIPMENT_VIEW: 'shipment:view',
  SHIPMENT_CREATE: 'shipment:create',
  SHIPMENT_UPDATE: 'shipment:update',
  SHIPMENT_DELETE: 'shipment:delete',
  SHIPMENT_APPROVE: 'shipment:approve',
  SHIPMENT_CANCEL: 'shipment:cancel',
  SHIPMENT_EXPORT: 'shipment:export',

  // Dispatch & Execution
  DISPATCH_VIEW: 'dispatch:view',
  DISPATCH_CREATE: 'dispatch:create',
  DISPATCH_UPDATE: 'dispatch:update',
  DISPATCH_ASSIGN: 'dispatch:assign',
  DISPATCH_DISPATCH: 'dispatch:dispatch',
  DISPATCH_CANCEL: 'dispatch:cancel',

  // Fleet Assets
  FLEET_VIEW: 'fleet:view',
  FLEET_CREATE: 'fleet:create',
  FLEET_UPDATE: 'fleet:update',
  FLEET_DELETE: 'fleet:delete',

  // Drivers
  DRIVER_VIEW: 'driver:view',
  DRIVER_CREATE: 'driver:create',
  DRIVER_UPDATE: 'driver:update',
  DRIVER_DELETE: 'driver:delete',

  // Carriers
  CARRIER_VIEW: 'carrier:view',
  CARRIER_CREATE: 'carrier:create',
  CARRIER_UPDATE: 'carrier:update',
  CARRIER_DELETE: 'carrier:delete',

  // Routes & Network
  ROUTE_VIEW: 'route:view',
  ROUTE_CREATE: 'route:create',
  ROUTE_UPDATE: 'route:update',
  ROUTE_DELETE: 'route:delete',

  // Tracking & Geofences
  TRACKING_VIEW: 'tracking:view',
  GEOFENCE_VIEW: 'geofence:view',
  GEOFENCE_CREATE: 'geofence:create',
  GEOFENCE_UPDATE: 'geofence:update',

  // Exceptions
  EXCEPTION_VIEW: 'exception:view',
  EXCEPTION_CREATE: 'exception:create',
  EXCEPTION_UPDATE: 'exception:update',
  EXCEPTION_RESOLVE: 'exception:resolve',

  // Documents
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_DOWNLOAD: 'document:download',

  // Proof of Delivery (POD)
  POD_VIEW: 'pod:view',
  POD_CREATE: 'pod:create',
  POD_UPDATE: 'pod:update',
  POD_APPROVE: 'pod:approve',

  // Claims
  CLAIM_VIEW: 'claim:view',
  CLAIM_CREATE: 'claim:create',
  CLAIM_UPDATE: 'claim:update',
  CLAIM_APPROVE: 'claim:approve',

  // Billing & Invoicing
  BILLING_VIEW: 'billing:view',
  BILLING_CREATE: 'billing:create',
  BILLING_UPDATE: 'billing:update',
  BILLING_APPROVE: 'billing:approve',
  BILLING_EXPORT: 'billing:export',

  // Payments
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_UPDATE: 'payment:update',

  // Settlements
  SETTLEMENT_VIEW: 'settlement:view',
  SETTLEMENT_CREATE: 'settlement:create',
  SETTLEMENT_APPROVE: 'settlement:approve',

  // Freight Audit
  FREIGHT_AUDIT_VIEW: 'freight-audit:view',
  FREIGHT_AUDIT_CREATE: 'freight-audit:create',
  FREIGHT_AUDIT_APPROVE: 'freight-audit:approve',

  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_EXPORT: 'report:export',

  // Notifications
  NOTIFICATION_VIEW: 'notification:view',
  NOTIFICATION_MANAGE: 'notification:manage',

  // Support Desk
  SUPPORT_VIEW: 'support:view',
  SUPPORT_CREATE: 'support:create',
  SUPPORT_UPDATE: 'support:update',
  SUPPORT_ASSIGN: 'support:assign',
  SUPPORT_RESOLVE: 'support:resolve',

  // Audit Logs & Settings
  AUDIT_VIEW: 'audit:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Grouped permissions for Role Management Matrix UI
export interface PermissionModuleGroup {
  module: string;
  label: string;
  icon: string;
  permissions: {
    key: string;
    action: string;
    description: string;
  }[];
}

export const PERMISSION_MODULE_GROUPS: PermissionModuleGroup[] = [
  {
    module: 'dashboard',
    label: 'Dashboard & Overview',
    icon: 'dashboard',
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, action: 'View', description: 'Access main operational dashboard' },
    ],
  },
  {
    module: 'shipment',
    label: 'Orders & Shipments',
    icon: 'local_shipping',
    permissions: [
      { key: PERMISSIONS.SHIPMENT_VIEW, action: 'View', description: 'View transport orders & shipments' },
      { key: PERMISSIONS.SHIPMENT_CREATE, action: 'Create', description: 'Create bookings and shipments' },
      { key: PERMISSIONS.SHIPMENT_UPDATE, action: 'Update', description: 'Edit cargo details and route status' },
      { key: PERMISSIONS.SHIPMENT_DELETE, action: 'Delete', description: 'Delete draft orders or cancel' },
      { key: PERMISSIONS.SHIPMENT_APPROVE, action: 'Approve', description: 'Authorize shipment releases' },
      { key: PERMISSIONS.SHIPMENT_EXPORT, action: 'Export', description: 'Export consignment manifests' },
    ],
  },
  {
    module: 'dispatch',
    label: 'Dispatch Board',
    icon: 'view_kanban',
    permissions: [
      { key: PERMISSIONS.DISPATCH_VIEW, action: 'View', description: 'View Kanban dispatch board' },
      { key: PERMISSIONS.DISPATCH_CREATE, action: 'Create', description: 'Create dispatch releases' },
      { key: PERMISSIONS.DISPATCH_UPDATE, action: 'Update', description: 'Edit dispatch assignments' },
      { key: PERMISSIONS.DISPATCH_ASSIGN, action: 'Assign', description: 'Assign driver and vehicle assets' },
      { key: PERMISSIONS.DISPATCH_DISPATCH, action: 'Dispatch', description: 'Authorize physical gate departure' },
    ],
  },
  {
    module: 'fleet',
    label: 'Fleet & Assets',
    icon: 'directions_car',
    permissions: [
      { key: PERMISSIONS.FLEET_VIEW, action: 'View', description: 'View vehicle registry and telemetry' },
      { key: PERMISSIONS.FLEET_CREATE, action: 'Create', description: 'Add new fleet vehicles and trailers' },
      { key: PERMISSIONS.FLEET_UPDATE, action: 'Update', description: 'Update maintenance logs and documents' },
      { key: PERMISSIONS.FLEET_DELETE, action: 'Delete', description: 'Decommission vehicles from fleet' },
    ],
  },
  {
    module: 'driver',
    label: 'Driver Management',
    icon: 'badge',
    permissions: [
      { key: PERMISSIONS.DRIVER_VIEW, action: 'View', description: 'View driver profiles & rosters' },
      { key: PERMISSIONS.DRIVER_CREATE, action: 'Create', description: 'Onboard drivers and KYC' },
      { key: PERMISSIONS.DRIVER_UPDATE, action: 'Update', description: 'Edit licenses and certifications' },
      { key: PERMISSIONS.DRIVER_DELETE, action: 'Delete', description: 'Archive driver accounts' },
    ],
  },
  {
    module: 'carrier',
    label: 'Carriers & 3PL',
    icon: 'business',
    permissions: [
      { key: PERMISSIONS.CARRIER_VIEW, action: 'View', description: 'View carrier directory and rates' },
      { key: PERMISSIONS.CARRIER_CREATE, action: 'Create', description: 'Add 3PL carrier contracts' },
      { key: PERMISSIONS.CARRIER_UPDATE, action: 'Update', description: 'Update carrier tariffs and scorecards' },
      { key: PERMISSIONS.CARRIER_DELETE, action: 'Delete', description: 'Terminate carrier contracts' },
    ],
  },
  {
    module: 'tracking',
    label: 'Tracking & Geofences',
    icon: 'my_location',
    permissions: [
      { key: PERMISSIONS.TRACKING_VIEW, action: 'View', description: 'Access live GPS radar map' },
      { key: PERMISSIONS.GEOFENCE_VIEW, action: 'View Geofences', description: 'View hub geofence boundaries' },
      { key: PERMISSIONS.GEOFENCE_CREATE, action: 'Create Geofences', description: 'Configure custom polygon geofences' },
      { key: PERMISSIONS.EXCEPTION_VIEW, action: 'View Exceptions', description: 'View route deviation alarms' },
      { key: PERMISSIONS.EXCEPTION_RESOLVE, action: 'Resolve Exceptions', description: 'Acknowledge and clear incidents' },
    ],
  },
  {
    module: 'document',
    label: 'Documents & ePOD',
    icon: 'draw',
    permissions: [
      { key: PERMISSIONS.DOCUMENT_VIEW, action: 'View Docs', description: 'View digital paperwork & LRs' },
      { key: PERMISSIONS.DOCUMENT_CREATE, action: 'Upload Docs', description: 'Upload carriage documents' },
      { key: PERMISSIONS.POD_VIEW, action: 'View POD', description: 'Inspect electronic Proof of Delivery' },
      { key: PERMISSIONS.POD_CREATE, action: 'Submit POD', description: 'Capture digital receiver signature' },
      { key: PERMISSIONS.POD_APPROVE, action: 'Approve POD', description: 'Certify delivery verification' },
    ],
  },
  {
    module: 'billing',
    label: 'Billing & Freight Audit',
    icon: 'receipt_long',
    permissions: [
      { key: PERMISSIONS.BILLING_VIEW, action: 'View Billing', description: 'View freight invoices and tariffs' },
      { key: PERMISSIONS.BILLING_CREATE, action: 'Generate Invoices', description: 'Issue customer freight bills' },
      { key: PERMISSIONS.BILLING_APPROVE, action: 'Approve Invoices', description: 'Authorize invoices for payment' },
      { key: PERMISSIONS.FREIGHT_AUDIT_VIEW, action: 'View Audits', description: 'Inspect carrier invoice variances' },
      { key: PERMISSIONS.SETTLEMENT_VIEW, action: 'View Settlements', description: 'View driver & carrier payables' },
      { key: PERMISSIONS.SETTLEMENT_APPROVE, action: 'Approve Settlements', description: 'Clear trip expense allowances' },
    ],
  },
  {
    module: 'analytics',
    label: 'Analytics & Reporting',
    icon: 'insights',
    permissions: [
      { key: PERMISSIONS.ANALYTICS_VIEW, action: 'View Analytics', description: 'Access executive BI dashboards' },
      { key: PERMISSIONS.ANALYTICS_EXPORT, action: 'Export Analytics', description: 'Download CSV / Excel datasets' },
      { key: PERMISSIONS.REPORT_VIEW, action: 'View Reports', description: 'View operational reports' },
    ],
  },
  {
    module: 'admin',
    label: 'System Administration',
    icon: 'admin_panel_settings',
    permissions: [
      { key: PERMISSIONS.USER_VIEW, action: 'View Users', description: 'List organization user accounts' },
      { key: PERMISSIONS.USER_CREATE, action: 'Create Users', description: 'Invite and create users' },
      { key: PERMISSIONS.USER_UPDATE, action: 'Edit Users', description: 'Modify user profiles and roles' },
      { key: PERMISSIONS.ROLE_VIEW, action: 'View Roles', description: 'Inspect RBAC role permissions' },
      { key: PERMISSIONS.ROLE_CREATE, action: 'Create Roles', description: 'Design custom organizational roles' },
      { key: PERMISSIONS.ROLE_UPDATE, action: 'Edit Roles', description: 'Modify permission matrix' },
      { key: PERMISSIONS.AUDIT_VIEW, action: 'View Audit Logs', description: 'Inspect tamper-evident system logs' },
      { key: PERMISSIONS.SETTINGS_VIEW, action: 'View Settings', description: 'Access platform configurations' },
      { key: PERMISSIONS.SETTINGS_UPDATE, action: 'Update Settings', description: 'Modify tenant parameters' },
    ],
  },
];
