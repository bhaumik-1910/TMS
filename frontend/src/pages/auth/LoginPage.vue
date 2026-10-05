<template>
  <div class="login-wrapper window-height row items-center justify-center q-pa-md relative-position overflow-hidden bg-slate-50">
    <!-- Centered Enterprise Login Container -->
    <div class="login-card full-width q-pa-md q-pa-sm-lg relative-position" style="max-width: 880px; z-index: 10;">
      
      <!-- Top Branding Header -->
      <div class="text-center q-mb-md">
        <div class="brand-badge inline-block q-pa-sm q-mb-sm">
          <q-icon name="local_shipping" size="32px" color="primary" />
        </div>
        <h1 class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 row items-center justify-center q-gutter-x-xs no-margin">
          <span>APEX</span>
          <span class="text-primary font-mono">TMS</span>
        </h1>
        <p class="text-caption text-slate-500 q-mt-xs q-mb-none">
          Next-Generation Enterprise Transportation & Logistics Cloud
        </p>
      </div>

      <!-- Standard Credentials Form -->
      <q-card flat bordered class="auth-form-card q-pa-md q-mb-md bg-slate-50 border border-slate-200">
        <div class="row items-center justify-between text-caption font-mono text-primary text-weight-bold q-mb-sm">
          <div class="row items-center q-gutter-x-xs">
            <q-icon name="lock" size="14px" />
            <span>CORPORATE SIGN IN</span>
          </div>
          <span class="text-slate-400 text-weight-regular" style="font-size: 11px;">Encrypted TLS 1.3</span>
        </div>

        <q-form @submit.prevent="handleLogin" class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <div class="text-caption text-weight-medium text-slate-700 q-mb-xs" style="font-size: 11px;">Corporate Email</div>
            <q-input
              v-model="email"
              outlined
              dense
              placeholder="operations@tms.com"
              type="email"
              :rules="[val => !!val || 'Email is required']"
              hide-bottom-space
              class="font-mono text-body2 bg-white"
              input-class="text-slate-900 font-mono"
            >
              <template #prepend>
                <q-icon name="mail" size="16px" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-4">
            <div class="text-caption text-weight-medium text-slate-700 q-mb-xs" style="font-size: 11px;">Password</div>
            <q-input
              v-model="password"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :rules="[val => !!val || 'Password is required']"
              hide-bottom-space
              class="font-mono text-body2 bg-white"
              input-class="text-slate-900 font-mono"
            >
              <template #prepend>
                <q-icon name="key" size="16px" color="primary" />
              </template>
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  size="xs"
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  color="grey-6"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-3">
            <q-btn
              type="submit"
              class="full-width text-weight-bold"
              color="primary"
              text-color="white"
              no-caps
              label="Sign In"
              :loading="authStore.isLoading"
              style="height: 40px !important; min-height: 40px !important; border-radius: 6px;"
            />
          </div>
        </q-form>
      </q-card>

      <!-- Quick 1-Click Role Login Section -->
      <div class="quick-login-box">
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-x-xs text-caption text-weight-bold text-slate-800">
            <q-icon name="verified_user" color="primary" size="16px" />
            <span>1-Click Instant Persona Sign In</span>
          </div>
          <span class="persona-pass-badge text-caption font-mono text-primary q-px-sm q-py-xs">
            Pass: Tms@123456
          </span>
        </div>

        <!-- Filter Tabs -->
        <q-tabs
          v-model="activeCategory"
          dense
          no-caps
          class="auth-tabs text-slate-500 q-mb-sm bg-slate-100 border border-slate-200"
          active-color="primary"
          active-bg-color="white"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="all" label="All (13 Roles)" icon="apps" />
          <q-tab name="management" label="Executive" icon="admin_panel_settings" />
          <q-tab name="operations" label="Dispatch" icon="alt_route" />
          <q-tab name="ground" label="Fleet" icon="local_shipping" />
          <q-tab name="commercial" label="Finance" icon="account_balance" />
        </q-tabs>

        <!-- Persona Quick Cards Grid -->
        <div class="row q-col-gutter-sm custom-scroll" style="max-height: 290px; overflow-y: auto;">
          <div
            v-for="persona in filteredPersonas"
            :key="persona.role"
            class="col-12 col-sm-6 col-md-4"
          >
            <div
              class="persona-card q-pa-sm cursor-pointer row items-center justify-between no-wrap transition-all bg-white border border-slate-200 shadow-xs"
              :class="{ 'active-persona': email === persona.email }"
              @click="quickLogin(persona)"
            >
              <div class="row items-center no-wrap q-gutter-x-sm ellipsis col">
                <div
                  class="persona-icon-box row items-center justify-center shrink-0"
                  :style="{ backgroundColor: persona.bg, color: persona.color }"
                >
                  <q-icon :name="persona.icon" size="16px" />
                </div>
                <div class="ellipsis col">
                  <div class="text-caption text-weight-bold text-slate-900 ellipsis persona-name">
                    {{ persona.name }}
                  </div>
                  <div class="text-caption text-slate-500 font-mono ellipsis" style="font-size: 10px;">
                    {{ persona.scope }}
                  </div>
                </div>
              </div>

              <q-btn
                round
                flat
                dense
                icon="arrow_forward"
                size="xs"
                color="primary"
                :loading="authStore.isLoading && email === persona.email"
                class="shrink-0 q-ml-xs persona-arrow"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="q-mt-md q-pt-sm row items-center justify-between text-caption text-slate-500" style="border-top: 1px solid #e2e8f0; font-size: 11px;">
        <div class="row items-center q-gutter-x-sm">
          <span>Enterprise Edition</span>
          <span>&bull;</span>
          <span>Multi-Tenant</span>
          <span>&bull;</span>
          <span>ISO 27001 Compliant</span>
        </div>
        <div class="font-mono text-slate-500">
          v2.6 Cloud &bull; <a href="mailto:support@tms.com" class="text-primary text-decoration-none">support@tms.com</a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('operations@tms.com');
const password = ref('Tms@123456');
const showPassword = ref(false);
const activeCategory = ref('all');

interface Persona {
  name: string;
  email: string;
  role: string;
  scope: string;
  category: 'management' | 'operations' | 'ground' | 'commercial';
  icon: string;
  color: string;
  bg: string;
  redirect: string;
}

const allPersonas: Persona[] = [
  // Management & Admin
  {
    name: 'Super Admin',
    email: 'superadmin@tms.com',
    role: 'SUPER_ADMIN',
    scope: 'Multi-Tenant Root Control',
    category: 'management',
    icon: 'admin_panel_settings',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/dashboard',
  },
  {
    name: 'TMS Admin',
    email: 'admin@tms.com',
    role: 'TMS_ADMIN',
    scope: 'Organization Config',
    category: 'management',
    icon: 'manage_accounts',
    color: '#0d9488',
    bg: '#ccfbf1',
    redirect: '/dashboard',
  },
  {
    name: 'Operations Mgr',
    email: 'operations@tms.com',
    role: 'OPERATIONS_MANAGER',
    scope: 'End-to-End SLA Monitoring',
    category: 'management',
    icon: 'dashboard_customize',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/dashboard',
  },
  {
    name: 'Executive Analyst',
    email: 'analyst@tms.com',
    role: 'EXECUTIVE_ANALYST',
    scope: 'Freight Profitability & KPI',
    category: 'management',
    icon: 'analytics',
    color: '#7c3aed',
    bg: '#ede9fe',
    redirect: '/analytics',
  },
  // Dispatch & Logistics Operations
  {
    name: 'Load Planner',
    email: 'planner@tms.com',
    role: 'LOAD_PLANNER',
    scope: 'Route Optimization & Consolidations',
    category: 'operations',
    icon: 'alt_route',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/planning',
  },
  {
    name: 'Dispatcher',
    email: 'dispatcher@tms.com',
    role: 'DISPATCHER',
    scope: 'Manifest Assignment & Gate-Out',
    category: 'operations',
    icon: 'send',
    color: '#d97706',
    bg: '#fef3c7',
    redirect: '/dispatch',
  },
  {
    name: 'Tracking Agent',
    email: 'tracking@tms.com',
    role: 'TRACKING_OFFICER',
    scope: 'GPS Geo-Fences & Milestone Status',
    category: 'operations',
    icon: 'radar',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/tracking',
  },
  {
    name: 'Exceptions Clerk',
    email: 'exceptions@tms.com',
    role: 'EXCEPTION_OFFICER',
    scope: 'Delays, Detention & Route Deviations',
    category: 'operations',
    icon: 'report_problem',
    color: '#dc2626',
    bg: '#fee2e2',
    redirect: '/exceptions',
  },
  // Ground Operations & Fleet
  {
    name: 'Fleet Manager',
    email: 'fleet@tms.com',
    role: 'FLEET_MANAGER',
    scope: 'Telematics, Service & Tyre Logs',
    category: 'ground',
    icon: 'rv_hookup',
    color: '#2563eb',
    bg: '#dbeafe',
    redirect: '/fleet',
  },
  {
    name: 'Compliance Officer',
    email: 'compliance@tms.com',
    role: 'COMPLIANCE_OFFICER',
    scope: 'PUC, Fastag, Fitness & E-Way Bills',
    category: 'ground',
    icon: 'fact_check',
    color: '#16a34a',
    bg: '#dcfce7',
    redirect: '/documents',
  },
  {
    name: 'Driver (Mobile PWA)',
    email: 'driver@tms.com',
    role: 'DRIVER',
    scope: 'Linehaul ETA, Bilty & Digital POD',
    category: 'ground',
    icon: 'local_shipping',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/driver-app',
  },
  // Commercial & Customer Portals
  {
    name: 'Finance / Auditor',
    email: 'finance@tms.com',
    role: 'FINANCE_AUDITOR',
    scope: 'Invoice Biling, Audit & Sync',
    category: 'commercial',
    icon: 'receipt_long',
    color: '#059669',
    bg: '#d1fae5',
    redirect: '/billing',
  },
  {
    name: 'Customer Portal',
    email: 'customer@tms.com',
    role: 'CUSTOMER_PORTAL',
    scope: 'Order Tracking & Bilty Downloads',
    category: 'commercial',
    icon: 'storefront',
    color: '#0284c7',
    bg: '#e0f2fe',
    redirect: '/orders',
  },
];

const filteredPersonas = computed(() => {
  if (activeCategory.value === 'all') return allPersonas;
  return allPersonas.filter(p => p.category === activeCategory.value);
});

async function handleLogin() {
  const persona = allPersonas.find(p => p.email === email.value);
  const targetRoute = persona ? persona.redirect : '/dashboard';

  try {
    await authStore.login(email.value, password.value);
    router.push(targetRoute);
  } catch (err) {
    console.error('Login error:', err);
  }
}

async function quickLogin(persona: Persona) {
  email.value = persona.email;
  password.value = 'Tms@123456';

  try {
    await authStore.login(persona.email, 'Tms@123456');
    router.push(persona.redirect);
  } catch (err) {
    console.error('Quick login error:', err);
  }
}
</script>

<style scoped>
.login-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
}

.brand-badge {
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  border-radius: 16px;
}

.login-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}

.auth-form-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.auth-tabs {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.persona-pass-badge {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
}

.persona-card {
  border-radius: 6px;
  transition: all 0.2s ease;
  min-height: 48px;
}

.persona-card:hover {
  border-color: #0284c7;
  background: #f0f9ff;
  transform: translateY(-1px);
}

.active-persona {
  background: #f0f9ff !important;
  border-color: #0284c7 !important;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.15);
}

.persona-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.persona-arrow {
  opacity: 0.7;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.persona-card:hover .persona-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
