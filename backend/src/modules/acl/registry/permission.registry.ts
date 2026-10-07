import { buildCatalog, expandPattern as expand } from '../../../framework/acl/catalog.js';
import type { PermissionEntry } from '../../../framework/acl/catalog-types.js';
import {
  adminPermissions,
  financePermissions,
  insightsPermissions,
  mastersPermissions,
  operationsPermissions,
  overviewPermissions,
} from './groups.js';

/** Words for the actions TMS adds on top of the framework's (`view`, `create`, `update`, `delete`, `restore`...). */
const ACTION_LABELS: Record<string, string> = {
  approve: 'Approve',
  cancel: 'Cancel',
  change_status: 'Change status',
  close: 'Close',
  verify: 'Verify',
  mark_paid: 'Mark paid',
  resolve: 'Resolve',
  use: 'Use',
  test: 'Test',
  activate: 'Activate',
  deactivate: 'Deactivate',
  retry: 'Retry',
  skip: 'Skip',
};

/** Every permission the API checks. Synced to the `permissions` table of every schema on boot. */
export const PERMISSION_CATALOG: readonly PermissionEntry[] = buildCatalog(
  [overviewPermissions, mastersPermissions, operationsPermissions, financePermissions, insightsPermissions, adminPermissions],
  ACTION_LABELS,
);

/** `fuel_entry.*`, `*.view`, `*.*` against the catalog. */
export const expandPattern = (pattern: string): string[] => expand(PERMISSION_CATALOG, pattern);
