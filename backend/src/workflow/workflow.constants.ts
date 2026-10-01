/**
 * Centralized TMS Workflow States, Transitions & Responsible Roles
 */

export interface WorkflowTransitionRule {
  from: string;
  to: string;
  requiredPermission: string;
  requiredRoles?: string[];
  requiredAssignmentField?: string; // e.g. 'driverId' or 'vehicleId'
  actionLabel: string;
  nextResponsibleRole: string;
  description: string;
}

// 1. Transport Order Workflow: DRAFT → SUBMITTED → APPROVED → PLANNING → PLANNED → DISPATCHED → IN_TRANSIT → DELIVERED → CLOSED
export const ORDER_WORKFLOW_STATES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PLANNING',
  'PLANNED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CLOSED',
  'CANCELLED',
] as const;

export const ORDER_TRANSITIONS: WorkflowTransitionRule[] = [
  {
    from: 'DRAFT',
    to: 'SUBMITTED',
    requiredPermission: 'shipment:create',
    actionLabel: 'Submit Order',
    nextResponsibleRole: 'OPERATIONS_MANAGER',
    description: 'Customer or account executive submits booking request for authorization',
  },
  {
    from: 'SUBMITTED',
    to: 'APPROVED',
    requiredPermission: 'shipment:approve',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER'],
    actionLabel: 'Approve Booking',
    nextResponsibleRole: 'TRANSPORT_PLANNER',
    description: 'Operations Manager verifies credit terms and approves load for planning',
  },
  {
    from: 'APPROVED',
    to: 'PLANNING',
    requiredPermission: 'route:view',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER', 'TRANSPORT_PLANNER'],
    actionLabel: 'Move to Planning Queue',
    nextResponsibleRole: 'TRANSPORT_PLANNER',
    description: 'Transport Planner initiates load consolidation and vehicle selection',
  },
  {
    from: 'PLANNING',
    to: 'PLANNED',
    requiredPermission: 'route:create',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER', 'TRANSPORT_PLANNER'],
    actionLabel: 'Complete Load Plan',
    nextResponsibleRole: 'DISPATCHER',
    description: 'Load assigned to route corridor, awaiting driver/tractor dispatch assignment',
  },
  {
    from: 'PLANNED',
    to: 'DISPATCHED',
    requiredPermission: 'dispatch:dispatch',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER'],
    actionLabel: 'Release Dispatch',
    nextResponsibleRole: 'DRIVER',
    description: 'Tractor and driver released for linehaul execution',
  },
  {
    from: 'DISPATCHED',
    to: 'IN_TRANSIT',
    requiredPermission: 'tracking:view',
    actionLabel: 'Start Linehaul Transit',
    nextResponsibleRole: 'DRIVER',
    description: 'Driver confirms cargo loaded and starts GPS movement',
  },
  {
    from: 'IN_TRANSIT',
    to: 'DELIVERED',
    requiredPermission: 'pod:create',
    actionLabel: 'Confirm Delivery',
    nextResponsibleRole: 'FINANCE_MANAGER',
    description: 'Cargo delivered at destination dock, signed POD transmitted',
  },
  {
    from: 'DELIVERED',
    to: 'CLOSED',
    requiredPermission: 'billing:approve',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'FINANCE_MANAGER', 'OPERATIONS_MANAGER'],
    actionLabel: 'Close Order & Reconcile',
    nextResponsibleRole: 'FINANCE_MANAGER',
    description: 'Financial ledger reconciled and final billing closed',
  },
];

// 2. Dispatch / Linehaul Execution Workflow: PLANNED → ASSIGNED → DISPATCHED → DRIVER_ACCEPTED → PICKUP → IN_TRANSIT → DELIVERY → COMPLETED
export const DISPATCH_WORKFLOW_STATES = [
  'PLANNED',
  'ASSIGNED',
  'DISPATCHED',
  'DRIVER_ACCEPTED',
  'PICKUP',
  'IN_TRANSIT',
  'DELIVERY',
  'COMPLETED',
  'CANCELLED',
] as const;

export const DISPATCH_TRANSITIONS: WorkflowTransitionRule[] = [
  {
    from: 'PLANNED',
    to: 'ASSIGNED',
    requiredPermission: 'dispatch:assign',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER'],
    requiredAssignmentField: 'driverId',
    actionLabel: 'Assign Driver & Tractor',
    nextResponsibleRole: 'DISPATCHER',
    description: 'Assign available driver and tractor unit to shipment trip',
  },
  {
    from: 'ASSIGNED',
    to: 'DISPATCHED',
    requiredPermission: 'dispatch:dispatch',
    requiredRoles: ['SUPER_ADMIN', 'TMS_ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER'],
    actionLabel: 'Release Trip Dispatch',
    nextResponsibleRole: 'DRIVER',
    description: 'Send trip dispatch packet directly to Driver Mobile App',
  },
  {
    from: 'DISPATCHED',
    to: 'DRIVER_ACCEPTED',
    requiredPermission: 'pod:create',
    requiredRoles: ['SUPER_ADMIN', 'DRIVER', 'DISPATCHER'],
    actionLabel: 'Accept Trip Assignment',
    nextResponsibleRole: 'DRIVER',
    description: 'Driver acknowledges assignment and verifies hours of service',
  },
  {
    from: 'DRIVER_ACCEPTED',
    to: 'PICKUP',
    requiredPermission: 'pod:create',
    requiredRoles: ['SUPER_ADMIN', 'DRIVER', 'DISPATCHER'],
    actionLabel: 'Arrived at Pickup Facility',
    nextResponsibleRole: 'DRIVER',
    description: 'Driver reports arrival at origin shipper warehouse for loading',
  },
  {
    from: 'PICKUP',
    to: 'IN_TRANSIT',
    requiredPermission: 'pod:create',
    requiredRoles: ['SUPER_ADMIN', 'DRIVER', 'DISPATCHER'],
    actionLabel: 'Depart Pickup & Start Transit',
    nextResponsibleRole: 'DRIVER',
    description: 'Bill of Lading verified, seal secured, linehaul started',
  },
  {
    from: 'IN_TRANSIT',
    to: 'DELIVERY',
    requiredPermission: 'pod:create',
    requiredRoles: ['SUPER_ADMIN', 'DRIVER', 'DISPATCHER'],
    actionLabel: 'Arrived at Delivery Dock',
    nextResponsibleRole: 'DRIVER',
    description: 'Driver docks at destination receiving facility',
  },
  {
    from: 'DELIVERY',
    to: 'COMPLETED',
    requiredPermission: 'pod:create',
    requiredRoles: ['SUPER_ADMIN', 'DRIVER', 'DISPATCHER', 'OPERATIONS_MANAGER'],
    actionLabel: 'Complete Delivery & Upload ePOD',
    nextResponsibleRole: 'FINANCE_MANAGER',
    description: 'Consignee electronic signature captured, trip closed',
  },
];
