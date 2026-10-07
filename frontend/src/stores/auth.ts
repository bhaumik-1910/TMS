import { defineStore } from 'pinia';
import api from '../api/client';
import { useAppNotify } from '../composables/useAppNotify';
import { PermissionService } from '../services/permission.service';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId: string;
  organization?: any;
  roles: string[];
  permissions: string[];
}

// Master Role -> Permission Matrix (Section 6)
export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  TMS_ADMIN: [
    'dashboard:view',
    'user:view', 'user:create', 'user:update',
    'organization:view', 'organization:update',
    'role:view', 'role:create', 'role:update',
    'permission:view', 'permission:manage',
    'shipment:view', 'shipment:create', 'shipment:update',
    'dispatch:view', 'dispatch:create', 'dispatch:update',
    'fleet:view', 'driver:view', 'carrier:view',
    'tracking:view', 'route:view',
    'document:view', 'document:create',
    'pod:view',
    'billing:view',
    'analytics:view', 'report:view',
    'audit:view',
    'settings:view', 'settings:update',
  ],
  OPERATIONS_MANAGER: [
    'dashboard:view',
    'shipment:view', 'shipment:create', 'shipment:update',
    'dispatch:view', 'dispatch:create', 'dispatch:update',
    'fleet:view', 'driver:view', 'carrier:view',
    'tracking:view',
    'route:view', 'route:create', 'route:update',
    'exception:view', 'exception:create', 'exception:update', 'exception:resolve',
    'analytics:view',
  ],
  TRANSPORT_PLANNER: [
    'dashboard:view',
    'shipment:view', 'shipment:create', 'shipment:update',
    'route:view', 'route:create', 'route:update',
    'fleet:view', 'driver:view', 'carrier:view',
    'tracking:view',
    'analytics:view',
  ],
  DISPATCHER: [
    'dashboard:view',
    'shipment:view',
    'dispatch:view', 'dispatch:create', 'dispatch:update', 'dispatch:assign', 'dispatch:dispatch',
    'driver:view', 'fleet:view',
    'tracking:view',
    'exception:view', 'exception:update',
    'document:view',
  ],
  FLEET_MANAGER: [
    'dashboard:view',
    'fleet:view', 'fleet:create', 'fleet:update',
    'driver:view', 'driver:create', 'driver:update',
    'document:view', 'document:create',
    'tracking:view',
    'analytics:view',
  ],
  DRIVER: [
    'dashboard:view',
    'shipment:view',
    'tracking:view',
    'pod:view', 'pod:create', 'pod:update',
    'document:view', 'document:create',
    'exception:view', 'exception:create',
  ],
  CARRIER: [
    'dashboard:view',
    'carrier:view',
    'shipment:view',
    'tracking:view',
    'document:view',
    'pod:view',
    'claim:view', 'claim:create',
    'billing:view',
  ],
  CUSTOMER: [
    'dashboard:view',
    'shipment:view',
    'tracking:view',
    'document:view',
    'pod:view',
    'claim:view', 'claim:create',
    'billing:view',
  ],
  FINANCE_MANAGER: [
    'dashboard:view',
    'shipment:view',
    'billing:view', 'billing:create', 'billing:update', 'billing:approve', 'billing:export',
    'payment:view', 'payment:create', 'payment:update',
    'freight-audit:view', 'freight-audit:create', 'freight-audit:approve',
    'settlement:view', 'settlement:create', 'settlement:approve',
    'analytics:view', 'report:view', 'report:export',
  ],
  COMPLIANCE_MANAGER: [
    'dashboard:view',
    'document:view', 'document:create', 'document:update',
    'claim:view', 'claim:update', 'claim:approve',
    'audit:view',
    'analytics:view',
    'report:view',
  ],
  SUPPORT_AGENT: [
    'dashboard:view',
    'shipment:view',
    'tracking:view',
    'support:view', 'support:create', 'support:update', 'support:assign', 'support:resolve',
    'document:view',
  ],
  ANALYST: [
    'dashboard:view',
    'shipment:view',
    'fleet:view',
    'tracking:view',
    'billing:view',
    'analytics:view', 'analytics:export',
    'report:view', 'report:export',
  ],
};

// Default Primary Landing Routes per Enterprise Persona — Always land on role dashboard first
export const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  SUPER_ADMIN: '/dashboard',
  TMS_ADMIN: '/dashboard',
  OPERATIONS_MANAGER: '/dashboard',
  TRANSPORT_PLANNER: '/dashboard',
  DISPATCHER: '/dashboard',
  FLEET_MANAGER: '/dashboard',
  DRIVER: '/dashboard',
  CARRIER: '/dashboard',
  CUSTOMER: '/dashboard',
  FINANCE_MANAGER: '/dashboard',
  COMPLIANCE_MANAGER: '/dashboard',
  SUPPORT_AGENT: '/dashboard',
  ANALYST: '/dashboard',
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('tms_user') || 'null') as UserProfile | null,
    token: localStorage.getItem('tms_access_token') || '',
    refreshToken: localStorage.getItem('tms_refresh_token') || '',
    activeRole: localStorage.getItem('tms_active_role') || 'OPERATIONS_MANAGER',
    orgContext: localStorage.getItem('tms_org_context') || 'SYSTEM',
    availableOrganizations: [] as any[],
    picker: null as { loginToken: string; user: any; companies: any[] } | null,
    activeCompany: null as { id: number; code: string; name: string } | null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentRole: (state) => state.activeRole || (state.user?.roles?.[0] ?? 'OPERATIONS_MANAGER'),
    userName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : 'Guest User',
    organizationName: (state) => state.user?.organization?.name || 'Apex Global Logistics',
    currentOrgContext: (state) => state.orgContext,

    activeContextLabel(): string {
      if (this.orgContext === 'SYSTEM') return 'SYSTEM (All Organizations)';
      const found = this.availableOrganizations.find((o) => o.id === this.orgContext || o.code === this.orgContext);
      return found ? found.name : 'Organization Scope';
    },

    isSuperAdmin(): boolean {
      return this.currentRole === 'SUPER_ADMIN' || (this.user?.roles?.includes('SUPER_ADMIN') ?? false);
    },

    // Effective permissions: union of user's permissions and current role's permissions
    effectivePermissions(): string[] {
      if (this.isSuperAdmin) return ['*'];
      const set = new Set<string>();

      // Permissions from active role definition
      const rolePerms = ROLE_PERMISSIONS_MAP[this.currentRole] || [];
      rolePerms.forEach((p) => set.add(p));

      // Permissions from user profile (e.g. backend response)
      if (this.user?.permissions) {
        this.user.permissions.forEach((p) => set.add(p));
      }

      return Array.from(set);
    },
  },

  actions: {
    async login(email: string, pass: string) {
      this.isLoading = true;
      const notify = useAppNotify();
      try {
        let res: any;
        try {
          res = await api.post('/api/auth/login', { email, password: pass });
        } catch (e: any) {
          // Fallback to legacy path if needed
          res = await api.post('/api/v1/auth/login', { email, password: pass });
        }
        const data = res.data || res;

        // Two-Token Multi-Tenant Flow: Login Token + Companies Selection
        if (data.loginToken && Array.isArray(data.companies)) {
          this.picker = {
            loginToken: data.loginToken,
            user: data.user,
            companies: data.companies,
          };
          this.availableOrganizations = data.companies;
          return {
            requiresCompanySelection: true,
            companies: data.companies,
            user: data.user,
          };
        }

        // Direct Token Flow (if any)
        const { accessToken, refreshToken, user } = data;
        this.token = accessToken || '';
        this.refreshToken = refreshToken || '';
        this.user = user;
        this.activeRole = user?.roles?.[0] || 'OPERATIONS_MANAGER';

        if (accessToken) localStorage.setItem('tms_access_token', accessToken);
        if (refreshToken) localStorage.setItem('tms_refresh_token', refreshToken);
        if (user) localStorage.setItem('tms_user', JSON.stringify(user));
        localStorage.setItem('tms_active_role', this.activeRole);

        notify.success(`Welcome back, ${user?.firstName || user?.name || 'User'}! Signed in as ${this.activeRole}.`);
        return { requiresCompanySelection: false, user };
      } catch (err: any) {
        notify.error(err?.response?.data?.message || err?.message || 'Invalid credentials or login failed');
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async switchCompany(companyId: number) {
      this.isLoading = true;
      const notify = useAppNotify();
      try {
        const bearer = this.picker?.loginToken || this.token;
        const res: any = await api.post(
          '/api/auth/switch-company',
          { companyId, refreshToken: this.refreshToken || undefined },
          { headers: { Authorization: `Bearer ${bearer}` } },
        );
        const data = res.data || res;
        const { accessToken, refreshToken } = data;

        this.token = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('tms_access_token', accessToken);
        localStorage.setItem('tms_refresh_token', refreshToken);

        // Find selected company in list
        const comp =
          this.picker?.companies?.find((c: any) => c.companyId === companyId) ||
          this.availableOrganizations?.find((c: any) => c.companyId === companyId || c.id === companyId);

        const compName = comp?.name || 'Demo Roadways Pvt Ltd';
        const compCode = comp?.code || 'demo';
        const roleLabel = comp?.role || comp?.roleCode || 'ADMIN';

        this.orgContext = compCode;
        this.activeRole = roleLabel;
        localStorage.setItem('tms_org_context', compCode);
        localStorage.setItem('tms_active_role', roleLabel);

        const userName = this.picker?.user?.name || this.user?.firstName || 'Admin';
        const userEmail = this.picker?.user?.email || this.user?.email || 'admin@demo.test';

        this.user = {
          id: String(companyId),
          email: userEmail,
          firstName: userName.split(' ')[0] || userName,
          lastName: userName.split(' ').slice(1).join(' ') || '',
          organizationId: String(companyId),
          organization: { id: companyId, name: compName, code: compCode },
          roles: [roleLabel],
          permissions: ['*'],
        };
        localStorage.setItem('tms_user', JSON.stringify(this.user));

        this.picker = null;
        notify.success(`Company active: ${compName} (${roleLabel})`);
        return comp;
      } catch (err: any) {
        notify.error(err?.response?.data?.message || err?.message || 'Failed to switch company');
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCompanies() {
      try {
        const res: any = await api.get('/api/auth/companies');
        const list = res.data || res;
        if (Array.isArray(list)) {
          this.availableOrganizations = list;
          return list;
        }
        return [];
      } catch (e) {
        return [];
      }
    },

    // Fast Role Switcher to effortlessly preview views of all 13 roles
    async switchRole(roleName: string) {
      this.activeRole = roleName;
      localStorage.setItem('tms_active_role', roleName);
      const notify = useAppNotify();

      const roleEmails: Record<string, string> = {
        SUPER_ADMIN: 'admin@demo.test',
        TMS_ADMIN: 'admin@demo.test',
        OPERATIONS_MANAGER: 'manager@demo.test',
        TRANSPORT_PLANNER: 'ops@demo.test',
        DISPATCHER: 'ops@demo.test',
        FLEET_MANAGER: 'fuel@demo.test',
        DRIVER: 'driver@tms.com',
        CARRIER: 'carrier@tms.com',
        CUSTOMER: 'customer@tms.com',
        FINANCE_MANAGER: 'accounts@demo.test',
        COMPLIANCE_MANAGER: 'ca@demo.test',
        SUPPORT_AGENT: 'partner@demo.test',
        ANALYST: 'ca@demo.test',
      };

      const email = roleEmails[roleName] || 'admin@demo.test';
      const pass = email.endsWith('@demo.test') ? 'Demo@1234' : 'Tms@123456';
      const res: any = await this.login(email, pass);
      if (res && res.requiresCompanySelection && res.companies?.length) {
        await this.switchCompany(res.companies[0].companyId);
      }
    },

    logout() {
      this.user = null;
      this.token = '';
      this.refreshToken = '';
      this.picker = null;
      localStorage.removeItem('tms_access_token');
      localStorage.removeItem('tms_refresh_token');
      localStorage.removeItem('tms_user');
      localStorage.removeItem('tms_active_role');
      localStorage.removeItem('tms_org_context');
      window.location.href = '/auth/login';
    },

    hasPermission(permissionKey: string): boolean {
      return PermissionService.hasPermission(permissionKey, this.effectivePermissions);
    },

    hasAnyPermission(...permissionKeys: string[]): boolean {
      return PermissionService.hasAnyPermission(permissionKeys, this.effectivePermissions);
    },

    hasAllPermissions(...permissionKeys: string[]): boolean {
      return PermissionService.hasAllPermissions(permissionKeys, this.effectivePermissions);
    },

    hasRole(...roles: string[]): boolean {
      if (this.isSuperAdmin) return true;
      return roles.includes(this.currentRole);
    },

    async setOrganizationContext(orgId: string) {
      const notify = useAppNotify();
      this.orgContext = orgId;
      localStorage.setItem('tms_org_context', orgId);

      const label = orgId === 'SYSTEM' ? 'SYSTEM (All Organizations)' : (this.availableOrganizations.find(o => o.id === orgId)?.name || 'Tenant Scope');
      notify.info(`Context switched to: ${label}`);
      window.dispatchEvent(new CustomEvent('tms:org-context-changed', { detail: orgId }));
    },

    async loadOrganizations() {
      try {
        const res: any = await api.get('/api/v1/organizations');
        this.availableOrganizations = res.data || res || [];
      } catch (err) {
        console.warn('Could not load organizations list:', err);
      }
    },
  },
});
