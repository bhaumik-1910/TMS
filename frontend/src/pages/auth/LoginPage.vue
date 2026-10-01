<template>
  <div class="login-wrapper min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient Cyber Glows in Background -->
    <div class="ambient-glow ambient-glow-top"></div>
    <div class="ambient-glow ambient-glow-bottom"></div>

    <!-- Centered Glassmorphic Login Container -->
    <div class="login-card w-full max-w-3xl rounded-2xl relative z-10 p-6 sm:p-8 backdrop-blur-xl border border-slate-800 shadow-2xl">
      
      <!-- Top Branding Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 mb-3 shadow-[0_0_20px_rgba(0,242,254,0.25)]">
          <q-icon name="local_shipping" size="32px" class="text-cyan-400" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-wide text-white flex items-center justify-center gap-2">
          <span>APEX</span>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono">TMS</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Next-Generation Enterprise Transportation & Logistics Cloud
        </p>
      </div>

      <!-- Standard Credentials Form -->
      <div class="p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-950/50 mb-6">
        <div class="text-xs font-mono font-bold text-cyan-400 mb-3 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <q-icon name="lock" size="14px" /> CORPORATE SIGN IN
          </span>
          <span class="text-[11px] text-slate-500 font-normal">Encrypted TLS 1.3</span>
        </div>

        <q-form @submit.prevent="handleLogin" class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-5">
            <div class="text-[11px] font-semibold text-slate-300 mb-1">Corporate Email</div>
            <q-input
              v-model="email"
              outlined
              dense
              placeholder="operations@tms.com"
              type="email"
              :rules="[val => !!val || 'Email is required']"
              hide-bottom-space
              class="font-mono text-sm"
              input-class="text-white font-mono"
            >
              <template #prepend>
                <q-icon name="mail" size="16px" color="cyan" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-4">
            <div class="text-[11px] font-semibold text-slate-300 mb-1">Password</div>
            <q-input
              v-model="password"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :rules="[val => !!val || 'Password is required']"
              hide-bottom-space
              class="font-mono text-sm"
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
              class="desk-btn-primary full-width font-bold"
              no-caps
              label="Sign In"
              :loading="authStore.isLoading"
              style="height: 40px !important; min-height: 40px !important;"
            />
          </div>
        </q-form>
      </div>

      <!-- Quick 1-Click Role Login Section -->
      <div class="quick-login-box">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <q-icon name="verified_user" color="cyan" size="16px" />
            <span>1-Click Instant Persona Sign In</span>
          </div>
          <span class="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
            Pass: Tms@123456
          </span>
        </div>

        <!-- Filter Tabs -->
        <q-tabs
          v-model="activeCategory"
          dense
          no-caps
          class="text-slate-400 mb-3 bg-slate-950/60 rounded-lg p-0.5 border border-slate-800"
          active-color="cyan"
          active-bg-color="cyan-950/40"
          indicator-color="cyan"
          align="justify"
        >
          <q-tab name="all" label="All (13 Roles)" icon="apps" />
          <q-tab name="management" label="Executive" icon="admin_panel_settings" />
          <q-tab name="operations" label="Dispatch" icon="alt_route" />
          <q-tab name="ground" label="Fleet" icon="local_shipping" />
          <q-tab name="commercial" label="Finance" icon="account_balance" />
        </q-tabs>

        <!-- Persona Quick Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
          <div
            v-for="persona in filteredPersonas"
            :key="persona.role"
            class="persona-card p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
            :class="{ 'border-cyan-400/60 bg-cyan-950/30': email === persona.email }"
            @click="quickLogin(persona)"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                :style="`background-color: ${persona.bg}; color: ${persona.color};`"
              >
                <q-icon :name="persona.icon" size="16px" />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {{ persona.name }}
                </div>
                <div class="text-[10px] text-slate-400 truncate font-mono">
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
              class="shrink-0 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div class="flex items-center gap-3">
          <span>Enterprise Edition</span>
          <span>&bull;</span>
          <span>Multi-Tenant</span>
          <span>&bull;</span>
          <span>ISO 27001 Compliant</span>
        </div>
        <div class="font-mono text-slate-400">
          v2.6 Cloud &bull; <a href="mailto:support@tms.com" class="text-cyan-400 hover:underline">support@tms.com</a>
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
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.15)',
    redirect: '/dashboard',
  },
  {
    name: 'Dispatcher',
    email: 'dispatcher@tms.com',
    role: 'DISPATCHER',
    scope: 'Trip Release & Assign',
    category: 'operations',
    icon: 'view_kanban',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
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

.login-card {
  background: rgba(13, 23, 43, 0.85);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 242, 254, 0.06);
}

.persona-card {
  transition: all 0.18s ease;
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
