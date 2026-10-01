import { DataScope } from './data-scope.enum';

/**
 * Centralized Role-Permission-DataScope Matrix
 * Defines the precise visibility perimeter for every official role in the TMS.
 */
export const ROLE_DATA_SCOPE_MATRIX: Record<string, Record<string, DataScope>> = {
  SUPER_ADMIN: {
    '*': DataScope.SYSTEM,
  },

  TMS_ADMIN: {
    'dashboard:view': DataScope.ORGANIZATION,
    'user:view': DataScope.ORGANIZATION,
    'user:create': DataScope.ORGANIZATION,
    'user:update': DataScope.ORGANIZATION,
    'organization:view': DataScope.ORGANIZATION,
    'organization:update': DataScope.ORGANIZATION,
    'role:view': DataScope.ORGANIZATION,
    'permission:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'dispatch:view': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'driver:view': DataScope.ORGANIZATION,
    'carrier:view': DataScope.ORGANIZATION,
    'billing:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
    'audit:view': DataScope.ORGANIZATION,
    'settings:view': DataScope.ORGANIZATION,
  },

  OPERATIONS_MANAGER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'shipment:create': DataScope.ORGANIZATION,
    'shipment:update': DataScope.ORGANIZATION,
    'dispatch:view': DataScope.ORGANIZATION,
    'dispatch:create': DataScope.ORGANIZATION,
    'dispatch:update': DataScope.ORGANIZATION,
    'dispatch:assign': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'driver:view': DataScope.ORGANIZATION,
    'carrier:view': DataScope.ORGANIZATION,
    'route:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'exception:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
  },

  TRANSPORT_PLANNER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'shipment:create': DataScope.ORGANIZATION,
    'shipment:update': DataScope.ORGANIZATION,
    'route:view': DataScope.ORGANIZATION,
    'route:create': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'driver:view': DataScope.ORGANIZATION,
    'carrier:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
  },

  DISPATCHER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'dispatch:view': DataScope.ORGANIZATION,
    'dispatch:create': DataScope.ORGANIZATION,
    'dispatch:update': DataScope.ORGANIZATION,
    'dispatch:assign': DataScope.ORGANIZATION,
    'dispatch:dispatch': DataScope.ORGANIZATION,
    'driver:view': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'exception:view': DataScope.ORGANIZATION,
    'document:view': DataScope.ORGANIZATION,
  },

  FLEET_MANAGER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'fleet:create': DataScope.ORGANIZATION,
    'fleet:update': DataScope.ORGANIZATION,
    'driver:view': DataScope.ORGANIZATION,
    'driver:create': DataScope.ORGANIZATION,
    'driver:update': DataScope.ORGANIZATION,
    'document:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
  },

  DRIVER: {
    'dashboard:view': DataScope.DRIVER,
    'shipment:view': DataScope.DRIVER,
    'tracking:view': DataScope.DRIVER,
    'pod:view': DataScope.DRIVER,
    'pod:create': DataScope.DRIVER,
    'pod:update': DataScope.DRIVER,
    'document:view': DataScope.DRIVER,
    'exception:view': DataScope.DRIVER,
    'exception:create': DataScope.DRIVER,
  },

  CARRIER: {
    'dashboard:view': DataScope.CARRIER,
    'shipment:view': DataScope.CARRIER,
    'tracking:view': DataScope.CARRIER,
    'document:view': DataScope.CARRIER,
    'pod:view': DataScope.CARRIER,
    'claim:view': DataScope.CARRIER,
    'claim:create': DataScope.CARRIER,
  },

  CUSTOMER: {
    'dashboard:view': DataScope.CUSTOMER,
    'shipment:view': DataScope.CUSTOMER,
    'tracking:view': DataScope.CUSTOMER,
    'document:view': DataScope.CUSTOMER,
    'pod:view': DataScope.CUSTOMER,
    'claim:view': DataScope.CUSTOMER,
    'invoice:view': DataScope.CUSTOMER,
  },

  FINANCE_MANAGER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'billing:view': DataScope.ORGANIZATION,
    'billing:create': DataScope.ORGANIZATION,
    'billing:update': DataScope.ORGANIZATION,
    'billing:approve': DataScope.ORGANIZATION,
    'billing:export': DataScope.ORGANIZATION,
    'payment:view': DataScope.ORGANIZATION,
    'payment:create': DataScope.ORGANIZATION,
    'freight-audit:view': DataScope.ORGANIZATION,
    'settlement:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
    'report:view': DataScope.ORGANIZATION,
  },

  COMPLIANCE_MANAGER: {
    'dashboard:view': DataScope.ORGANIZATION,
    'document:view': DataScope.ORGANIZATION,
    'claim:view': DataScope.ORGANIZATION,
    'audit:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
    'report:view': DataScope.ORGANIZATION,
  },

  SUPPORT_AGENT: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'support:view': DataScope.ORGANIZATION,
    'document:view': DataScope.ORGANIZATION,
  },

  ANALYST: {
    'dashboard:view': DataScope.ORGANIZATION,
    'shipment:view': DataScope.ORGANIZATION,
    'fleet:view': DataScope.ORGANIZATION,
    'tracking:view': DataScope.ORGANIZATION,
    'billing:view': DataScope.ORGANIZATION,
    'analytics:view': DataScope.ORGANIZATION,
    'report:view': DataScope.ORGANIZATION,
  },
};
