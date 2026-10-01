// Centralized Enterprise Sidebar Navigation Model matching Figma "Ankpal — Gati Shakti TMS"
import { PERMISSIONS } from './permissions';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  roles?: string[];
  roleLabels?: Record<string, string>;
  badge?: string;
  badgeColor?: string;
  children?: SidebarItem[];
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarItem[];
}

export const SIDEBAR_STRUCTURE: SidebarGroup[] = [
  // 1. OVERVIEW
  {
    id: 'overview',
    label: 'OVERVIEW',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },

  // 2. MASTERS
  {
    id: 'masters',
    label: 'MASTERS',
    items: [
      {
        id: 'vehicle-master',
        label: 'Vehicle Master',
        icon: 'directions_car',
        route: '/fleet',
        permission: PERMISSIONS.FLEET_VIEW,
      },
      {
        id: 'party-master',
        label: 'Party Master',
        icon: 'people',
        route: '/customers',
        permission: PERMISSIONS.SHIPMENT_VIEW,
      },
    ],
  },

  // 3. OPERATIONS
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      {
        id: 'booking-lr',
        label: 'Booking / LR',
        icon: 'description',
        route: '/orders',
        permission: PERMISSIONS.SHIPMENT_VIEW,
      },
      {
        id: 'transport-planning',
        label: 'Planner Workspace',
        icon: 'alt_route',
        route: '/planning',
        permission: PERMISSIONS.ROUTE_VIEW,
      },
      {
        id: 'trip-allocation',
        label: 'Trip & Allocation',
        icon: 'public',
        route: '/dispatch',
        permission: PERMISSIONS.DISPATCH_VIEW,
      },
      {
        id: 'fuel-entry',
        label: 'Fuel Entry',
        icon: 'local_gas_station',
        route: '/fuel',
        permission: PERMISSIONS.FLEET_VIEW,
      },
      {
        id: 'driver-advances',
        label: 'Driver Advances',
        icon: 'payments',
        route: '/driver-advances',
        permission: PERMISSIONS.DISPATCH_VIEW,
      },
      {
        id: 'tyre-operations',
        label: 'Tyre Operations',
        icon: 'radio_button_checked',
        route: '/tyres',
        permission: PERMISSIONS.FLEET_VIEW,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        icon: 'build',
        route: '/maintenance',
        permission: PERMISSIONS.FLEET_VIEW,
      },
      {
        id: 'pod',
        label: 'POD',
        icon: 'inventory_2',
        route: '/pod',
        permission: PERMISSIONS.POD_VIEW,
      },
    ],
  },

  // 4. FINANCE
  {
    id: 'finance',
    label: 'FINANCE',
    items: [
      {
        id: 'billing',
        label: 'Billing',
        icon: 'receipt',
        route: '/billing',
        permission: PERMISSIONS.BILLING_VIEW,
      },
      {
        id: 'purchase-bills',
        label: 'Purchase Bills',
        icon: 'shopping_cart',
        route: '/purchase-bills',
        permission: PERMISSIONS.BILLING_VIEW,
      },
      {
        id: 'settlements',
        label: 'Settlements',
        icon: 'account_balance_wallet',
        route: '/settlements',
        permission: PERMISSIONS.BILLING_VIEW,
      },
    ],
  },

  // 5. INSIGHTS
  {
    id: 'insights',
    label: 'INSIGHTS',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        icon: 'bar_chart',
        route: '/analytics',
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        id: 'exception-inbox',
        label: 'Exception Inbox',
        icon: 'warning',
        route: '/exceptions',
        permission: PERMISSIONS.EXCEPTION_VIEW,
      },
      {
        id: 'gati-copilot',
        label: 'Gati Copilot AI',
        icon: 'auto_awesome',
        route: '/copilot',
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },

  // 6. ADMIN
  {
    id: 'admin',
    label: 'ADMIN',
    items: [
      {
        id: 'access-management',
        label: 'Access Management',
        icon: 'lock',
        route: '/admin/users',
        permission: PERMISSIONS.USER_VIEW,
      },
      {
        id: 'settings',
        label: 'Organization & Settings',
        icon: 'settings_suggest',
        route: '/settings',
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export function filterSidebar(
  structure: SidebarGroup[],
  hasPermissionFnOrList: ((perm: string) => boolean) | string[] | any,
  currentRole: string
): SidebarGroup[] {
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const checkPerm = (perm: string): boolean => {
    if (isSuperAdmin) return true;
    if (typeof hasPermissionFnOrList === 'function') {
      try {
        return hasPermissionFnOrList(perm);
      } catch {
        return true;
      }
    }
    if (Array.isArray(hasPermissionFnOrList)) {
      return hasPermissionFnOrList.includes('*') || hasPermissionFnOrList.includes(perm);
    }
    return true;
  };

  return structure
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          if (isSuperAdmin) {
            const itemCopy: SidebarItem = { ...item };
            if (item.roleLabels && item.roleLabels[currentRole]) {
              itemCopy.label = item.roleLabels[currentRole];
            }
            return itemCopy;
          }

          let hasAccess = true;

          // Check role allowlist
          if (item.roles && item.roles.length > 0) {
            hasAccess = item.roles.includes(currentRole);
          }

          // Check permission if specified
          if (hasAccess && item.permission) {
            hasAccess = checkPerm(item.permission);
          }

          if (!hasAccess) return null;

          const itemCopy: SidebarItem = { ...item };
          if (item.roleLabels && item.roleLabels[currentRole]) {
            itemCopy.label = item.roleLabels[currentRole];
          }

          return itemCopy;
        })
        .filter((item): item is SidebarItem => item !== null);

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
