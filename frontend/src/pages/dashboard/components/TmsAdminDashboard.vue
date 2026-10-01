<template>
  <div class="figma-dark-console min-h-screen p-4 sm:p-6 text-slate-100 font-sans w-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span class="w-2.5 h-6 rounded bg-gradient-to-b from-teal-400 to-cyan-600 inline-block"></span>
            TMS Admin Operations Console
          </h1>
          <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wide bg-teal-950 text-teal-300 border border-teal-800/80 shadow-[0_0_10px_rgba(20,184,166,0.25)]">
            {{ authStore.organizationName }}
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Tenant organization governance, personnel provisioning, freight SLA monitoring, and operational pipeline.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <q-btn
          color="primary"
          icon="tune"
          label="Tenant Settings"
          no-caps
          size="sm"
          class="font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-[0_0_12px_rgba(20,184,166,0.3)]"
          to="/settings"
        />
        <q-btn
          color="slate-800"
          text-color="white"
          icon="manage_accounts"
          label="Manage Users"
          no-caps
          size="sm"
          class="border border-slate-700 hover:border-cyan-400"
          to="/admin/users"
        />
      </div>
    </div>

    <!-- 5 Figma High-Tech Glowing KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px]">Total Trips</span>
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 tracking-tight my-1">
          138
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <span class="text-emerald-400 font-bold">↑ +12.4%</span> volume
        </div>
        <div class="figma-card-accent-line bg-cyan-400"></div>
      </div>

      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px]">Utilization</span>
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-white tracking-tight my-1">
          86%
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <span class="text-cyan-400 font-bold">18/24 Units</span> rolling
        </div>
        <div class="figma-card-accent-line bg-cyan-400"></div>
      </div>

      <div class="figma-stat-card figma-glow-amber p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px]">Efficiency</span>
          <span class="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 tracking-tight my-1">
          5.35
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <span class="text-emerald-400 font-bold">SLA Rating</span> out of 6.0
        </div>
        <div class="figma-card-accent-line bg-amber-400"></div>
      </div>

      <div class="figma-stat-card figma-glow-red p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px]">Exceptions</span>
          <span class="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-rose-400 tracking-tight my-1">
          4
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <span class="text-rose-400 font-bold">Live alerts</span> flagged
        </div>
        <div class="figma-card-accent-line bg-rose-500"></div>
      </div>

      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px]">Active Fleet</span>
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-cyan-300 tracking-tight my-1">
          47
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <span class="text-cyan-400 font-bold">Commercial</span> linehauls
        </div>
        <div class="figma-card-accent-line bg-cyan-400"></div>
      </div>
    </div>

    <!-- 6-Stage "OPERATION WORKFLOW" from Figma -->
    <div class="figma-panel rounded-xl p-5 border border-slate-800 bg-slate-900/80 backdrop-blur mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
            <span class="w-2.5 h-2.5 rounded bg-gradient-to-r from-teal-400 to-cyan-500"></span>
            TMS Operational Lifecycle Pipeline
          </div>
          <div class="text-xs text-slate-400">Continuous execution stages across all enterprise freight corridors</div>
        </div>
        <span class="text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
          6 STAGES SYNCHRONIZED
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <router-link
          to="/orders"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="receipt_long" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Booking</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">14 Unplanned</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">Stage 1</div>
        </router-link>

        <router-link
          to="/planning"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="alt_route" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Planning</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">8 In-Queue</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-indigo-400 font-bold">Stage 2</div>
        </router-link>

        <router-link
          to="/dispatch"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="view_kanban" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Dispatch</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">18 Active</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-amber-400 font-bold">Stage 3</div>
        </router-link>

        <router-link
          to="/tracking"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <q-icon name="my_location" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">In-Transit</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">47 Rolling</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">Stage 4</div>
        </router-link>

        <router-link
          to="/pod"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="draw" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">ePOD</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">142 Done</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">Stage 5</div>
        </router-link>

        <router-link
          to="/billing"
          class="figma-workflow-step group p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="account_balance_wallet" size="20px" />
          </div>
          <div class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Settlement</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Cycle Paid</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-purple-400 font-bold">Stage 6</div>
        </router-link>
      </div>
    </div>

    <!-- Active Personnel & Roles Summary Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8 figma-panel rounded-xl p-5 border border-slate-800 bg-slate-900/70 backdrop-blur">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <div class="text-sm font-bold text-white">Active Personnel & Role Assignments</div>
            <div class="text-xs text-slate-400 font-mono">Provisioned users within {{ authStore.organizationName }}</div>
          </div>
          <q-btn flat dense no-caps size="sm" color="cyan-4" label="All Users & Passwords →" to="/admin/users" />
        </div>

        <div class="space-y-2.5">
          <div
            v-for="user in recentUsers"
            :key="user.id"
            class="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
          >
            <div>
              <div class="font-bold text-xs text-white">{{ user.name }}</div>
              <div class="text-[11px] text-slate-400 font-mono">{{ user.email }} • Role: <span class="text-cyan-400">{{ user.role }}</span></div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-3">
        <div class="figma-panel rounded-xl p-5 border border-slate-800 bg-slate-900/70 backdrop-blur">
          <div class="text-sm font-bold text-white mb-3">Organization Management</div>
          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-500/70 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/admin/users')">
              <div class="flex items-center gap-2.5">
                <q-icon name="people" color="cyan-4" size="18px" />
                <span class="font-semibold text-slate-200">User Access Control</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="slate-500" />
            </div>

            <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-500/70 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/admin/roles')">
              <div class="flex items-center gap-2.5">
                <q-icon name="security" color="amber-4" size="18px" />
                <span class="font-semibold text-slate-200">55 Permissions Matrix</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="slate-500" />
            </div>

            <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-cyan-500/70 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/settings')">
              <div class="flex items-center gap-2.5">
                <q-icon name="tune" color="emerald-4" size="18px" />
                <span class="font-semibold text-slate-200">Tenant Configuration</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../../stores/auth';

const authStore = useAuthStore();

const recentUsers = ref([
  { id: '1', name: 'Marcus Brody', email: 'operations@tms.com', role: 'OPERATIONS_MANAGER' },
  { id: '2', name: 'Elena Rostova', email: 'planner@tms.com', role: 'TRANSPORT_PLANNER' },
  { id: '3', name: 'Dave Kroll', email: 'dispatcher@tms.com', role: 'DISPATCHER' },
  { id: '4', name: 'Marcus Vance', email: 'driver@tms.com', role: 'DRIVER' },
  { id: '5', name: 'Frank Sterling', email: 'finance@tms.com', role: 'FINANCE_MANAGER' },
]);
</script>

<style scoped>
.figma-dark-console {
  background-color: #070c18;
  border-radius: 12px;
}

.figma-stat-card {
  background: #0d172b;
  border: 1px solid #1a2744;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.figma-stat-card:hover {
  transform: translateY(-2px);
  border-color: #00f2fe;
}

.figma-card-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0.8;
}

.figma-glow-cyan {
  box-shadow: 0 4px 20px -2px rgba(6, 182, 212, 0.15);
}

.figma-glow-amber {
  box-shadow: 0 4px 20px -2px rgba(245, 158, 11, 0.15);
}

.figma-glow-red {
  box-shadow: 0 4px 20px -2px rgba(244, 63, 94, 0.15);
}

.figma-panel {
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35);
}

.figma-workflow-step {
  transition: all 0.2s ease;
}

.figma-workflow-step:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px -2px rgba(6, 182, 212, 0.3);
}
</style>
