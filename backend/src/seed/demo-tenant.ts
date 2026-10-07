import type { ProvisionInput } from '../modules/companies/company.provisioner.js';

export const DEMO_PASSWORD = 'Demo@1234';

export const DEMO_TENANT: ProvisionInput = {
  name: 'Demo Roadways Pvt Ltd',
  code: 'demo',
  gstin: '24AABCD1234E1Z5',
  license: { code: 'standard' },
  branches: [
    { code: 'AHD', name: 'HO Ahmedabad', city: 'Ahmedabad', stateCode: '24', isHeadOffice: true },
    { code: 'MUM', name: 'Mumbai', city: 'Mumbai', stateCode: '27' },
    { code: 'SRT', name: 'Surat', city: 'Surat', stateCode: '24' },
    { code: 'DEL', name: 'Delhi', city: 'New Delhi', stateCode: '07' },
  ],
  admin: { code: 'ADMIN', name: 'Admin', email: 'admin@demo.test', password: DEMO_PASSWORD },
};

/**
 * A second company in its own schema, with the same admin person: the sign-in then offers a
 * company picker, and the two companies' data stays apart.
 */
export const DEMO2_TENANT: ProvisionInput = {
  name: 'Second Logistics LLP',
  code: 'demo2',
  gstin: '27AAACS1234F1Z9',
  schema: 'tenant_demo2',
  license: { code: 'standard' },
  branches: [
    { code: 'PUN', name: 'HO Pune', city: 'Pune', stateCode: '27', isHeadOffice: true },
    { code: 'NGP', name: 'Nagpur', city: 'Nagpur', stateCode: '27' },
  ],
  admin: { code: 'ADMIN', name: 'Admin', email: 'admin@demo.test', password: DEMO_PASSWORD },
};

/**
 * A third company in its own dedicated schema (tenant_swift) to demonstrate 
 * multi-company lists and selective company access.
 */
export const DEMO3_TENANT: ProvisionInput = {
  name: 'Swift Logistics Pvt Ltd',
  code: 'swift',
  gstin: '29AABCS1234F1Z3',
  schema: 'tenant_swift',
  license: { code: 'standard' },
  branches: [
    { code: 'BLR', name: 'HO Bangalore', city: 'Bengaluru', stateCode: '29', isHeadOffice: true },
    { code: 'HYD', name: 'Hyderabad Hub', city: 'Hyderabad', stateCode: '36' },
  ],
  admin: { code: 'ADMIN', name: 'Admin', email: 'admin@demo.test', password: DEMO_PASSWORD },
};

/** One login per seeded role so each menu can be tried. */
export const DEMO_USERS: Array<{ code: string; name: string; email: string; role: string; branch: string }> = [
  { code: 'BM01', name: 'Rakesh Shah', email: 'manager@demo.test', role: 'BRANCH_MANAGER', branch: 'MUM' },
  { code: 'OPS01', name: 'Priya Desai', email: 'ops@demo.test', role: 'OPS_PLANNER', branch: 'AHD' },
  { code: 'FUEL01', name: 'Imran Khan', email: 'fuel@demo.test', role: 'FUEL_MANAGER', branch: 'AHD' },
  { code: 'ACC01', name: 'Meena Iyer', email: 'accounts@demo.test', role: 'ACCOUNTS', branch: 'AHD' },
  { code: 'WS01', name: 'Suresh Patel', email: 'workshop@demo.test', role: 'WORKSHOP', branch: 'AHD' },
  { code: 'CA01', name: 'CA Auditor', email: 'ca@demo.test', role: 'CA_READONLY', branch: 'AHD' },
  { code: 'PARTNER', name: 'Karan Sharma', email: 'partner@demo.test', role: 'BRANCH_MANAGER', branch: 'AHD' },
];

