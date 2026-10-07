import { CRUD, type LimitInfo, type PermissionGroup } from '../../../framework/acl/catalog-types.js';

const AMOUNT: LimitInfo[] = [{ key: 'amount', label: 'Up to amount', type: 'money' }];

export const overviewPermissions: PermissionGroup = {
  group: 'Overview',
  resources: [{ resource: 'dashboard', label: 'Dashboard', actions: ['view'] }],
};

export const mastersPermissions: PermissionGroup = {
  group: 'Masters',
  resources: [
    { resource: 'vehicle', label: 'Vehicle', actions: [...CRUD, 'activate', 'deactivate', 'export'] },
    { resource: 'party', label: 'Party', actions: [...CRUD, 'activate', 'deactivate', 'export'] },
    { resource: 'station', label: 'Station', actions: [...CRUD, 'activate', 'deactivate'] },
    { resource: 'branch', label: 'Branch', actions: [...CRUD, 'activate', 'deactivate'], scopes: ['all', 'branch', 'active-only'] },
  ],
};

export const operationsPermissions: PermissionGroup = {
  group: 'Operations',
  resources: [
    { resource: 'lr', label: 'Booking / LR', actions: [...CRUD, 'change_status', 'cancel', 'export'] },
    { resource: 'trip', label: 'Trip', actions: [...CRUD, 'close', 'cancel', 'export'] },
    { resource: 'fuel_entry', label: 'Fuel entry', actions: [...CRUD, 'export'] },
    { resource: 'driver_ledger', label: 'Driver advance / expense', actions: [...CRUD, 'approve', 'export'], limits: { approve: AMOUNT } },
    { resource: 'tyre', label: 'Tyre', actions: [...CRUD, 'export'] },
    { resource: 'job_card', label: 'Job card', actions: [...CRUD, 'export'] },
    { resource: 'pod', label: 'POD', actions: [...CRUD, 'verify', 'export'] },
  ],
};

export const financePermissions: PermissionGroup = {
  group: 'Finance',
  resources: [
    { resource: 'invoice', label: 'Invoice', actions: [...CRUD, 'cancel', 'mark_paid', 'restore', 'export'], limits: { create: AMOUNT, update: AMOUNT, mark_paid: AMOUNT } },
    { resource: 'purchase_bill', label: 'Purchase bill', actions: [...CRUD, 'approve', 'mark_paid', 'export'], limits: { approve: AMOUNT, mark_paid: AMOUNT } },
    { resource: 'settlement', label: 'Settlement', actions: [...CRUD, 'mark_paid', 'export'] },
    { resource: 'payment', label: 'Payment', actions: ['view', 'create', 'delete'], limits: { create: AMOUNT } },
  ],
};

export const insightsPermissions: PermissionGroup = {
  group: 'Insights',
  resources: [
    { resource: 'report', label: 'Reports', actions: ['view', 'export'] },
    { resource: 'exception', label: 'Exceptions', actions: ['view', 'resolve'] },
    { resource: 'copilot', label: 'Copilot', actions: ['use'] },
  ],
};

export const adminPermissions: PermissionGroup = {
  group: 'Admin',
  resources: [
    { resource: 'user', label: 'User', actions: [...CRUD, 'approve', 'activate', 'deactivate'] },
    { resource: 'role', label: 'Role', actions: [...CRUD, 'activate', 'deactivate'] },
    { resource: 'erp_connection', label: 'Accounting link', actions: ['view', 'update', 'test'] },
    { resource: 'erp_posting', label: 'Accounting postings', actions: ['view', 'retry', 'skip'] },
    { resource: 'period', label: 'Period lock', actions: ['view', 'update', 'unlock'] },
    { resource: 'settings', label: 'Company settings', actions: ['view', 'update'] },
  ],
};
