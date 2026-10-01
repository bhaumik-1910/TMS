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
        const res: any = await api.post('/api/v1/auth/login', { email, password: pass });
        const { accessToken, refreshToken, user } = res.data || res;

        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.activeRole = user.roles?.[0] || 'OPERATIONS_MANAGER';

        localStorage.setItem('tms_access_token', accessToken);
        localStorage.setItem('tms_refresh_token', refreshToken);
        localStorage.setItem('tms_user', JSON.stringify(user));
        localStorage.setItem('tms_active_role', this.activeRole);

        notify.success(`Welcome back, ${user.firstName}! Signed in as ${this.activeRole}.`);
        return true;
      } catch (err: any) {
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // Fast Role Switcher to effortlessly preview views of all 13 roles
    async switchRole(roleName: string) {
      this.activeRole = roleName;
      localStorage.setItem('tms_active_role', roleName);
      const notify = useAppNotify();

      const roleEmails: Record<string, string> = {
        SUPER_ADMIN: 'superadmin@tms.com',
        TMS_ADMIN: 'admin@tms.com',
        OPERATIONS_MANAGER: 'operations@tms.com',
        TRANSPORT_PLANNER: 'planner@tms.com',
        DISPATCHER: 'dispatcher@tms.com',
        FLEET_MANAGER: 'fleet@tms.com',
        DRIVER: 'driver@tms.com',
        CARRIER: 'carrier@tms.com',
        CUSTOMER: 'customer@tms.com',
        FINANCE_MANAGER: 'finance@tms.com',
        COMPLIANCE_MANAGER: 'compliance@tms.com',
        SUPPORT_AGENT: 'support@tms.com',
        ANALYST: 'analyst@tms.com',
      };

      const email = roleEmails[roleName] || 'operations@tms.com';
      await this.login(email, 'Tms@123456');
    },

    logout() {
      this.user = null;
      this.token = '';
      this.refreshToken = '';
      localStorage.removeItem('tms_access_token');
      localStorage.removeItem('tms_refresh_token');
      localStorage.removeItem('tms_user');
      localStorage.removeItem('tms_active_role');
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
