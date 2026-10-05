import type { DeskMenuNode } from './deskMenu';

export const TMS_MENU_TREE: DeskMenuNode[] = [
  {
    label: 'Dashboard',
    letter: 'd',
    route: '/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Masters',
    letter: 'm',
    children: [
      { label: 'Vehicles & Fleet', letter: 'v', route: '/fleet', icon: 'local_shipping' },
      { label: 'Drivers Master', letter: 'd', route: '/drivers', icon: 'badge' },
      { label: 'Customers / Debtors', letter: 'c', route: '/customers', icon: 'people' },
      { label: 'Carriers & Transporters', letter: 'p', route: '/carriers', icon: 'business' },
      { label: 'Routes, Tolls & Hubs', letter: 'r', route: '/routes', icon: 'route' },
      { label: 'Documents & Vault', letter: 'o', route: '/documents', icon: 'folder_shared' },
    ],
  },
  {
    label: 'Operations',
    letter: 'o',
    children: [
      { label: 'Lorry Receipt (LR / Bilty)', letter: 'b', route: '/lr-consignments', icon: 'receipt_long' },
      { label: 'Booking Orders', letter: 'o', route: '/orders', icon: 'inventory_2' },
      { label: 'Active Shipments', letter: 's', route: '/shipments', icon: 'local_shipping' },
      { label: 'Load & Trip Planning', letter: 'l', route: '/planning', icon: 'alt_route' },
      { label: 'Dispatch & Loading', letter: 'd', route: '/dispatch', icon: 'send' },
      { label: 'Live GPS Tracking', letter: 't', route: '/tracking', icon: 'my_location' },
      { label: 'Proof of Delivery (ePOD)', letter: 'p', route: '/pod', icon: 'task_alt' },
      { label: 'Driver Delivery App', letter: 'm', route: '/driver-app', icon: 'smartphone' },
    ],
  },
  {
    label: 'Fleet Expenses',
    letter: 'f',
    children: [
      { label: 'Fuel Entries & Logs', letter: 'f', route: '/fuel', icon: 'local_gas_station' },
      { label: 'Driver Trip Advances', letter: 'a', route: '/driver-advances', icon: 'payments' },
      { label: 'Workshop & Maintenance', letter: 'm', route: '/maintenance', icon: 'build' },
      { label: 'Tyre Inventory & Life', letter: 'y', route: '/tyres', icon: 'trip_origin' },
    ],
  },
  {
    label: 'Finance',
    letter: 'n',
    children: [
      { label: 'Freight Billing & Invoices', letter: 'b', route: '/billing', icon: 'request_quote' },
      { label: 'Purchase & Vendor Bills', letter: 'p', route: '/purchase-bills', icon: 'shopping_cart' },
      { label: 'Trip Settlements', letter: 's', route: '/settlements', icon: 'account_balance_wallet' },
      { label: 'Freight Audit & Claims', letter: 'a', route: '/freight-audit', icon: 'fact_check' },
      { label: 'Tally Prime / ERP Sync', letter: 'z', route: '/accounting-sync', icon: 'sync_alt' },
    ],
  },
  {
    label: 'Insights',
    letter: 'i',
    children: [
      { label: 'MIS & Analytics', letter: 'a', route: '/analytics', icon: 'analytics' },
      { label: 'Gati AI Copilot', letter: 'c', route: '/copilot', icon: 'psychology' },
      { label: 'Exception Control Tower', letter: 'e', route: '/exceptions', icon: 'report_problem' },
      { label: 'System Audit Trails', letter: 'l', route: '/audit-logs', icon: 'history' },
    ],
  },
  {
    label: 'Admin',
    letter: 'a',
    children: [
      { label: 'Users & Security', letter: 'u', route: '/admin/users', icon: 'manage_accounts' },
      { label: 'Roles & Permissions Matrix', letter: 'r', route: '/admin/roles', icon: 'security' },
      { label: 'System Architecture Console', letter: 's', route: '/admin/system', icon: 'terminal' },
      { label: 'Company & Platform Settings', letter: 'e', route: '/settings', icon: 'settings' },
    ],
  },
];
