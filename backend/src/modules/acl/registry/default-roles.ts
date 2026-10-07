import type { AclScope, Limits } from '../../../framework/auth/auth-user.js';
import { expandPattern } from './permission.registry.js';

type Grant = string | [pattern: string, scope: AclScope, limits?: Limits];

export interface DefaultRole {
  code: string;
  name: string;
  description: string;
  isSystem?: boolean;
  grants: Grant[];
}

/** The nine prototype roles, seeded into every new company. Admins can edit all but ADMIN. */
export const DEFAULT_ROLES: DefaultRole[] = [
  {
    code: 'ADMIN',
    name: 'Admin',
    description: 'Full access to every module and setting',
    isSystem: true,
    grants: ['*.*'],
  },
  {
    code: 'BRANCH_MANAGER',
    name: 'Branch Manager',
    description: 'Runs one or more branches end to end and approves advances and bills',
    grants: [
      'dashboard.view',
      'report.*',
      'exception.*',
      'copilot.use',
      'branch.view',
      'station.*',
      ['vehicle.*', 'branch'],
      ['party.*', 'branch'],
      ['lr.*', 'branch'],
      ['trip.*', 'branch'],
      ['fuel_entry.*', 'branch'],
      ['driver_ledger.*', 'branch'],
      ['driver_ledger.approve', 'branch', { amount: 25_000 }],
      'tyre.*',
      ['job_card.*', 'branch'],
      ['pod.*', 'branch'],
      ['invoice.view', 'branch'],
      ['purchase_bill.view', 'branch'],
      ['purchase_bill.approve', 'branch', { amount: 100_000 }],
      ['settlement.view', 'branch'],
      ['user.view', 'branch'],
      ['user.approve', 'branch'],
    ],
  },
  {
    code: 'OPS_PLANNER',
    name: 'Ops Planner',
    description: 'Bookings, trips and POD',
    grants: [
      'dashboard.view',
      'branch.view',
      'station.*',
      'lr.*',
      'trip.*',
      'pod.*',
      'vehicle.view',
      'party.view',
      'party.create',
      'driver_ledger.view',
      'driver_ledger.create',
      'exception.view',
    ],
  },
  {
    code: 'FUEL_MANAGER',
    name: 'Fuel Manager',
    description: 'Fuel entries and fuel anomalies',
    grants: ['dashboard.view', 'branch.view', 'fuel_entry.*', 'vehicle.view', 'party.view', 'trip.view', 'exception.view'],
  },
  {
    code: 'ACCOUNTS',
    name: 'Accounts',
    description: 'Billing, purchase bills, settlements, payments and the accounting link',
    grants: [
      'dashboard.view',
      'branch.view',
      'invoice.*',
      'purchase_bill.*',
      'settlement.*',
      'payment.*',
      'party.*',
      'vehicle.view',
      'lr.view',
      'trip.view',
      'pod.view',
      'fuel_entry.view',
      'job_card.view',
      'tyre.view',
      'driver_ledger.view',
      ['driver_ledger.approve', 'all', { amount: 50_000 }],
      ['invoice.mark_paid', 'all', { amount: 500_000 }],
      'report.*',
      'exception.*',
      'erp_connection.view',
      'erp_posting.*',
    ],
  },
  {
    code: 'WORKSHOP',
    name: 'Workshop',
    description: 'Job cards and tyres',
    grants: [
      'dashboard.view',
      'branch.view',
      'job_card.*',
      'tyre.*',
      'vehicle.view',
      'vehicle.update',
      'party.view',
      'purchase_bill.view',
      'purchase_bill.create',
    ],
  },
  {
    code: 'DRIVER',
    name: 'Driver',
    description: 'Own trips, advances, expenses, fuel and POD',
    grants: [
      ['trip.view', 'own'],
      ['driver_ledger.view', 'own'],
      ['driver_ledger.create', 'own'],
      ['fuel_entry.view', 'own'],
      ['fuel_entry.create', 'own'],
      ['pod.view', 'own'],
      ['pod.create', 'own'],
    ],
  },
  {
    code: 'CUSTOMER',
    name: 'Customer',
    description: 'Own bookings, POD and invoices',
    grants: [
      ['lr.view', 'own'],
      ['pod.view', 'own'],
      ['invoice.view', 'own'],
    ],
  },
  {
    code: 'CA_READONLY',
    name: 'CA Read-Only',
    description: 'Auditor: view and export everything, change nothing',
    grants: ['*.view', '*.export'],
  },
];

/** What one permission of a default role is granted with. */
export interface ResolvedGrant {
  scope: AclScope;
  limits: Limits;
}

/** Code to scope and limits for one default role, with wildcards expanded. Later grants override earlier ones. */
export function resolveGrants(role: DefaultRole): Map<string, ResolvedGrant> {
  const out = new Map<string, ResolvedGrant>();
  for (const grant of role.grants) {
    const [pattern, scope, limits] = typeof grant === 'string' ? [grant, 'all' as AclScope, undefined] : grant;
    for (const code of expandPattern(pattern)) out.set(code, { scope, limits: limits ?? {} });
  }
  return out;
}
