<template>
  <div class="login-wrapper window-height row items-center justify-center q-pa-md relative-position overflow-hidden">
    <!-- Ambient Cyber Glows in Background -->
    <div class="ambient-glow ambient-glow-top"></div>
    <div class="ambient-glow ambient-glow-bottom"></div>

    <!-- Centered Glassmorphic Login Container -->
    <div class="login-card full-width q-pa-md q-pa-sm-lg relative-position" style="max-width: 880px; z-index: 10;">
      
      <!-- Top Branding Header -->
      <div class="text-center q-mb-md">
        <div class="brand-badge inline-block q-pa-sm q-mb-sm">
          <q-icon name="local_shipping" size="32px" color="cyan" />
        </div>
        <h1 class="text-h5 text-sm-h4 text-weight-bolder text-white row items-center justify-center q-gutter-x-xs no-margin">
          <span>APEX</span>
          <span class="text-cyan font-mono">TMS</span>
        </h1>
        <p class="text-caption text-grey-5 q-mt-xs q-mb-none">
          Next-Generation Enterprise Transportation & Logistics Cloud
        </p>
      </div>

      <!-- Standard Credentials Form -->
      <q-card flat bordered class="auth-form-card q-pa-md q-mb-md">
        <div class="row items-center justify-between text-caption font-mono text-cyan text-weight-bold q-mb-sm">
          <div class="row items-center q-gutter-x-xs">
            <q-icon name="lock" size="14px" />
            <span>CORPORATE SIGN IN</span>
          </div>
          <span class="text-grey-6 text-weight-regular" style="font-size: 11px;">Encrypted TLS 1.3</span>
        </div>

        <q-form @submit.prevent="handleLogin" class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <div class="text-caption text-weight-medium text-grey-4 q-mb-xs" style="font-size: 11px;">Corporate Email</div>
            <q-input
              v-model="email"
              outlined
              dense
              placeholder="operations@tms.com"
              type="email"
              :rules="[val => !!val || 'Email is required']"
              hide-bottom-space
              class="font-mono text-body2"
              input-class="text-white font-mono"
            >
              <template #prepend>
                <q-icon name="mail" size="16px" color="cyan" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-4">
            <div class="text-caption text-weight-medium text-grey-4 q-mb-xs" style="font-size: 11px;">Password</div>
            <q-input
              v-model="password"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :rules="[val => !!val || 'Password is required']"
              hide-bottom-space
              class="font-mono text-body2"
              input-class="text-white font-mono"
            >
              <template #prepend>
                <q-icon name="key" size="16px" color="cyan" />
              </template>
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  size="xs"
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  color="grey-5"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-3">
            <q-btn
              type="submit"
              class="full-width text-weight-bold"
              color="cyan"
              text-color="black"
              no-caps
              label="Sign In"
              :loading="authStore.isLoading"
              style="height: 40px !important; min-height: 40px !important; border-radius: 8px;"
            />
          </div>
        </q-form>
      </q-card>

      <!-- Quick 1-Click Role Login Section -->
      <div class="quick-login-box">
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-x-xs text-caption text-weight-bold text-grey-3">
            <q-icon name="verified_user" color="cyan" size="16px" />
            <span>1-Click Instant Persona Sign In</span>
          </div>
          <span class="persona-pass-badge text-caption font-mono text-cyan q-px-sm q-py-xs">
            Pass: Tms@123456
          </span>
        </div>

        <!-- Filter Tabs -->
        <q-tabs
          v-model="activeCategory"
          dense
          no-caps
          class="auth-tabs text-grey-5 q-mb-sm"
          active-color="cyan"
          active-bg-color="transparent"
          indicator-color="cyan"
          align="justify"
        >
          <q-tab name="all" label="All (13 Roles)" icon="apps" />
          <q-tab name="management" label="Executive" icon="admin_panel_settings" />
          <q-tab name="operations" label="Dispatch" icon="alt_route" />
          <q-tab name="ground" label="Fleet" icon="local_shipping" />
          <q-tab name="commercial" label="Finance" icon="account_balance" />
        </q-tabs>

        <!-- Persona Quick Cards Grid (Native Quasar Row & Col Grid) -->
        <div class="row q-col-gutter-sm custom-scroll" style="max-height: 290px; overflow-y: auto;">
          <div
            v-for="persona in filteredPersonas"
            :key="persona.role"
            class="col-12 col-sm-6 col-md-4"
          >
            <div
              class="persona-card q-pa-sm cursor-pointer row items-center justify-between no-wrap transition-all"
              :class="{ 'active-persona': email === persona.email, 'default-persona': email !== persona.email }"
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
                  <div class="text-caption text-weight-bold text-white ellipsis persona-name">
                    {{ persona.name }}
                  </div>
                  <div class="text-caption text-grey-5 font-mono ellipsis" style="font-size: 10px;">
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
                color="cyan"
                :loading="authStore.isLoading && email === persona.email"
                class="shrink-0 q-ml-xs persona-arrow"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="q-mt-md q-pt-sm row items-center justify-between text-caption text-grey-6" style="border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px;">
        <div class="row items-center q-gutter-x-sm">
          <span>Enterprise Edition</span>
          <span>&bull;</span>
          <span>Multi-Tenant</span>
          <span>&bull;</span>
          <span>ISO 27001 Compliant</span>
        </div>
        <div class="font-mono text-grey-5">
          v2.6 Cloud &bull; <a href="mailto:support@tms.com" class="text-cyan text-decoration-none">support@tms.com</a>
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
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'TMS Admin',
    email: 'admin@tms.com',
    role: 'TMS_ADMIN',
    scope: 'Organization Config',
    category: 'management',
    icon: 'manage_accounts',
    color: '#2dd4bf',
    bg: 'rgba(45, 212, 191, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Operations Mgr',
    email: 'operations@tms.com',
    role: 'OPERATIONS_MANAGER',
    scope: 'End-to-End SLA Monitoring',
    category: 'management',
    icon: 'dashboard_customize',
    color: '#00f2fe',
    bg: 'rgba(0, 242, 254, 0.15)',
    redirect: '/dashboard',
  },
  // Planning & Dispatch
  {
    name: 'Transport Planner',
    email: 'planner@tms.com',
    role: 'TRANSPORT_PLANNER',
    scope: 'Routing & Consolidation',
    category: 'operations',
    icon: 'alt_route',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Dispatcher',
    email: 'dispatcher@tms.com',
    role: 'DISPATCHER',
    scope: 'Trip Release & Assign',
    category: 'operations',
    icon: 'local_shipping',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Analyst',
    email: 'analyst@tms.com',
    role: 'ANALYST',
    scope: 'Freight Intelligence',
    category: 'operations',
    icon: 'query_stats',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    redirect: '/dashboard',
  },
  // Fleet & Ground Operations
  {
    name: 'Fleet Manager',
    email: 'fleet@tms.com',
    role: 'FLEET_MANAGER',
    scope: 'Vehicles & Telematics',
    category: 'ground',
    icon: 'directions_car',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Driver Console',
    email: 'driver@tms.com',
    role: 'DRIVER',
    scope: 'Active Trips & Signature',
    category: 'ground',
    icon: 'directions_bus',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Compliance Mgr',
    email: 'compliance@tms.com',
    role: 'COMPLIANCE_MANAGER',
    scope: 'E-Way & Regulatory',
    category: 'ground',
    icon: 'verified_user',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.15)',
    redirect: '/dashboard',
  },
  // Commercial & Portals
  {
    name: 'Finance Manager',
    email: 'finance@tms.com',
    role: 'FINANCE_MANAGER',
    scope: 'Invoicing & Audits',
    category: 'commercial',
    icon: 'account_balance',
    color: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Carrier Partner',
    email: 'carrier@tms.com',
    role: 'CARRIER',
    scope: 'Bidding & Load Orders',
    category: 'commercial',
    icon: 'business',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Customer Shipper',
    email: 'customer@tms.com',
    role: 'CUSTOMER',
    scope: 'Booking & Tracking',
    category: 'commercial',
    icon: 'storefront',
    color: '#00f2fe',
    bg: 'rgba(0, 242, 254, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Support Agent',
    email: 'support@tms.com',
    role: 'SUPPORT_AGENT',
    scope: 'Tickets & Claims',
    category: 'commercial',
    icon: 'support_agent',
    color: '#f472b6',
    bg: 'rgba(244, 114, 182, 0.15)',
    redirect: '/dashboard',
  },
];

const filteredPersonas = computed(() => {
  if (activeCategory.value === 'all') return allPersonas;
  return allPersonas.filter(p => p.category === activeCategory.value);
});

async function handleLogin() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
}

async function quickLogin(persona: Persona) {
  email.value = persona.email;
  password.value = 'Tms@123456';
  const success = await authStore.login(persona.email, 'Tms@123456');
  if (success) {
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.login-wrapper {
  background: radial-gradient(circle at 50% 20%, #0d172b 0%, #070c18 100%);
  min-height: 100vh;
}

.ambient-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(140px);
}

.ambient-glow-top {
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 242, 254, 0.08);
}

.ambient-glow-bottom {
  bottom: -200px;
  right: 15%;
  background: rgba(37, 99, 235, 0.08);
}

.brand-badge {
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(37, 99, 235, 0.1));
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);
}

.login-card {
  background: rgba(13, 23, 43, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 242, 254, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-form-card {
  background: rgba(7, 12, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.auth-tabs {
  background: rgba(7, 12, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.persona-pass-badge {
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-radius: 6px;
}

.persona-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: 48px;
}

.default-persona {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.default-persona:hover {
  background: rgba(26, 38, 64, 0.85);
  border-color: rgba(0, 242, 254, 0.45);
  transform: translateY(-1px);
}

.active-persona {
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.6);
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.2);
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

.persona-card:hover .persona-name {
  color: #00f2fe !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 242, 254, 0.5);
}
</style>
