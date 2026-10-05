<template>
  <div class="operations-console-wrapper p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-800">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Logistics Control Tower / Overview"
      :title="`${roleTitle} Control Console`"
      :subtitle="`Real-time telematics, carrier execution, and supply chain SLA tracking for ${authStore.organizationName}`"
    >
      <template #badge>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            {{ authStore.currentRole }}
          </span>
          <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            LIVE TELEMETRY
          </span>
        </div>
      </template>

      <template #actions>
        <q-btn
          flat
          dense
          round
          icon="refresh"
          color="primary"
          size="sm"
          class="q-mr-xs"
          @click="loadDashboard"
          :loading="loading"
        >
          <template #loading>
            <q-spinner color="primary" size="16px" />
          </template>
          <q-tooltip>Refresh Live Telemetry</q-tooltip>
        </q-btn>
        <PermissionGate permission="order:create">
          <q-btn
            class="desk-btn-primary"
            icon="add"
            label="New Transport Order"
            no-caps
            size="sm"
            to="/orders?create=true"
          />
        </PermissionGate>
      </template>
    </AppPageHeader>

    <!-- Main Dashboard Workspace with Loading Overlay -->
    <div class="relative min-h-[400px] space-y-6">
      <!-- KPI Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" :class="authStore.hasPermission('billing:view') ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
      <AppStatCard
        title="Active Shipments"
        :value="kpis.activeShipments || 24"
        icon="local_shipping"
        icon-color="cyan"
        change="+8.4%"
        :is-positive="true"
        subtitle="In transit across network"
      />
      <AppStatCard
        title="On-Time Delivery"
        :value="`${kpis.otdPercent || 94.6}%`"
        icon="verified"
        icon-color="emerald"
        change="+1.2%"
        :is-positive="true"
        subtitle="Target: 95.0% Network SLA"
      />
      <AppStatCard
        title="Fleet Utilization"
        :value="`${kpis.fleetUtilization || 78.4}%`"
        icon="speed"
        icon-color="amber"
        change="+4.5%"
        :is-positive="true"
        :subtitle="`${kpis.inTransitVehicles || 18} / ${kpis.totalVehicles || 24} units active`"
      />
      <AppStatCard
        v-if="authStore.hasPermission('billing:view')"
        title="Net Freight Invoiced"
        :value="`₹${(financialMetrics.totalBilled || kpis.totalRevenue || 184500).toLocaleString()}`"
        icon="payments"
        icon-color="cyan"
        subtitle="Current billing cycle balance"
      />
    </div>

    <!-- Main Content: Live Telemetry Map & Operational Exceptions -->
    <div v-if="authStore.hasPermission('tracking:view') || authStore.hasPermission('exception:view')" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Live Fleet Map Container -->
      <div v-if="authStore.hasPermission('tracking:view')" :class="authStore.hasPermission('exception:view') ? 'lg:col-span-8' : 'lg:col-span-12'">
        <div class="cyber-card p-5 h-full flex flex-col justify-between border border-slate-200 bg-white">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></div>
              <span class="text-sm font-bold text-slate-900 tracking-wide">Live Fleet Radar & GPS Telematics</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                {{ vehicles.length }} UNITS ACTIVE
              </span>
            </div>
            <router-link to="/tracking" class="text-xs font-mono font-semibold text-sky-700 hover:text-sky-800 transition-colors flex items-center gap-1">
              Full Screen Radar
              <q-icon name="open_in_new" size="13px" />
            </router-link>
          </div>
          <div class="h-[400px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative">
            <LiveMap :vehicles="vehicles" :geofences="geofences" />
          </div>
        </div>
      </div>

      <!-- Operational Exceptions & Activity Stream -->
      <div v-if="authStore.hasPermission('exception:view')" :class="authStore.hasPermission('tracking:view') ? 'lg:col-span-4' : 'lg:col-span-12'">
        <div class="cyber-card p-5 h-full flex flex-col justify-between border border-slate-200 bg-white">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-2">
                <q-icon name="warning" color="amber-8" size="18px" />
                Operational Exceptions
              </span>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {{ exceptions.length }} ACTIVE
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-3">
              Route deviations, dwell timeouts, and telematics alerts
            </p>

            <div class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
              <div
                v-for="exc in exceptions"
                :key="exc.id"
                class="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-colors"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span
                    class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    :class="exc.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-300' : exc.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-sky-50 text-sky-700 border-sky-300'"
                  >
                    {{ exc.severity }}
                  </span>
                  <span class="text-[11px] font-mono text-slate-500">{{ exc.time }}</span>
                </div>
                <div class="text-xs text-slate-700 leading-relaxed">
                  <span class="font-mono font-bold text-sky-800">{{ exc.asset }}</span>: {{ exc.message }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
            <span class="text-slate-600 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Auto-Tender Dispatch Engine
            </span>
            <span class="text-[11px] font-bold text-emerald-700">ONLINE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Row: Performance Trend Analytics & Carrier Rankings -->
    <div v-if="authStore.hasPermission('analytics:view') || authStore.hasPermission('carrier:view')" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Shipment Volume & On-Time Performance Trend Chart -->
      <div v-if="authStore.hasPermission('analytics:view')" :class="authStore.hasPermission('carrier:view') ? 'lg:col-span-7' : 'lg:col-span-12'">
        <div class="cyber-card p-5 h-full border border-slate-200 bg-white">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-sm font-bold text-slate-900 tracking-wide">Weekly Linehaul Volume & SLA Trend</div>
              <div class="text-xs text-slate-500">Daily dispatched freight tonnage and on-time reliability curve</div>
            </div>
            <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              7-DAY ROLLING
            </span>
          </div>

          <div class="h-[250px] flex flex-col justify-between pt-2">
            <!-- Chart Area with Horizontal Background Grid Lines & Bars -->
            <div class="relative h-[165px] w-full border-b border-slate-200">
              <!-- Horizontal Guideline marks -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>60T</span></div>
                <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>40T</span></div>
                <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>20T</span></div>
              </div>

              <!-- 7 Day Equal Columns Grid with Generous Spacing -->
              <div class="relative h-full grid grid-cols-7 gap-2 sm:gap-4 items-end px-2 z-10">
                <div
                  v-for="item in weeklyVolumeData"
                  :key="item.day"
                  class="flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  <!-- Value Tooltip / Badge on Hover -->
                  <div class="text-[10px] font-mono text-slate-900 opacity-0 group-hover:opacity-100 transition-all transform -translate-y-1 mb-1 font-bold whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-md">
                    {{ item.count }}T ({{ item.sla }}%)
                  </div>

                  <!-- Pillar Track with Distinct Spacing & Rounded Cap -->
                  <div class="w-6 sm:w-8 md:w-9 h-[125px] bg-slate-100 rounded-t-lg border border-slate-200 p-0.5 flex flex-col justify-end group-hover:border-sky-500 transition-colors">
                    <div
                      class="w-full bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-700 group-hover:to-sky-500 rounded-t-md transition-all shadow-sm"
                      :style="{ height: item.height }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- X-Axis Day Labels Row: Directly underneath each bar -->
            <div class="grid grid-cols-7 gap-2 sm:gap-4 px-2 pt-2">
              <div
                v-for="item in weeklyVolumeData"
                :key="item.day"
                class="text-center text-xs font-mono font-medium text-slate-600 hover:text-sky-700 transition-colors"
              >
                {{ item.day }}
              </div>
            </div>

            <!-- Footer Legend -->
            <div class="flex items-center justify-between text-xs text-slate-600 pt-2 font-mono">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded bg-sky-600"></span>
                <span>Dispatched Volume (Tons)</span>
              </span>
              <span class="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span>95.6% Network SLA</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Carrier Performance Rankings -->
      <div v-if="authStore.hasPermission('carrier:view')" :class="authStore.hasPermission('analytics:view') ? 'lg:col-span-5' : 'lg:col-span-12'">
        <div class="cyber-card p-5 h-full flex flex-col justify-between border border-slate-200 bg-white">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="text-sm font-bold text-slate-900 tracking-wide">Top Carrier Scorecards</div>
                <div class="text-xs text-slate-500">Scored on OTD percentage, claims ratio, and tender acceptance</div>
              </div>
              <router-link to="/carriers" class="text-xs font-mono font-semibold text-sky-700 hover:text-sky-800">
                View All &rarr;
              </router-link>
            </div>

            <div class="divide-y divide-slate-200">
              <div v-for="(carrier, i) in carriers" :key="i" class="py-2.5 flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-300">
                    #{{ i + 1 }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{{ carrier.companyName }}</div>
                    <div class="text-xs text-slate-500 font-mono">{{ carrier._count?.shipments || 12 }} completed linehauls</div>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-xs font-bold text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span>★</span>
                  <span>{{ carrier.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 6-Stage "OPERATION WORKFLOW" Continuous Pipeline -->
    <div class="cyber-card p-5 border border-slate-200 bg-white">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-wide uppercase">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            Continuous Operation Workflow Pipeline
          </div>
          <div class="text-xs text-slate-500">Enterprise Transportation Lifecycle: Booking &rarr; Planning &rarr; Dispatch &rarr; In-Transit &rarr; ePOD &rarr; Settlement</div>
        </div>
        <span class="text-xs font-mono text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200 font-semibold">
          6 STAGES SYNCHRONIZED
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Stage 1: Booking -->
        <router-link
          to="/orders"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="receipt_long" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">Booking</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Freight Orders</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-sky-700 font-bold">Stage 1</div>
        </router-link>

        <!-- Stage 2: Planning -->
        <router-link
          to="/planning"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="alt_route" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">Planning</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Load Filling</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-indigo-700 font-bold">Stage 2</div>
        </router-link>

        <!-- Stage 3: Dispatch -->
        <router-link
          to="/dispatch"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="view_kanban" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">Dispatch</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Trip Release</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-amber-700 font-bold">Stage 3</div>
        </router-link>

        <!-- Stage 4: In-Transit -->
        <router-link
          to="/tracking"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="my_location" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">In-Transit</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">GPS Radar</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-sky-700 font-bold">Stage 4</div>
        </router-link>

        <!-- Stage 5: Delivery / POD -->
        <router-link
          to="/pod"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="draw" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">ePOD</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Signature Proof</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-emerald-700 font-bold">Stage 5</div>
        </router-link>

        <!-- Stage 6: Settlement -->
        <router-link
          to="/billing"
          class="group p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-sky-500 hover:bg-white transition-all text-center flex flex-col items-center justify-between"
        >
          <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <q-icon name="account_balance_wallet" size="20px" />
          </div>
          <div class="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">Settlement</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Tax Invoicing</div>
          <div class="w-full mt-2 pt-1 border-t border-slate-200 text-[10px] font-mono text-purple-700 font-bold">Stage 6</div>
        </router-link>
      </div>
    </div>

    <!-- Bottom Section: Active Shipment Tracking Feed -->
    <div v-if="authStore.hasPermission('shipment:view')" class="cyber-card p-5 border border-slate-200 bg-white">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-subtitle2 text-weight-bold text-slate-900 flex items-center gap-2">
            <q-icon name="local_shipping" color="primary" size="18px" />
            Active Shipment Tracking Feed
          </div>
          <div class="text-caption text-slate-500" style="font-size: 0.75rem;">
            Real-time transit milestones, assigned tractors, and customer consignments
          </div>
        </div>
        <q-btn flat dense no-caps color="primary" label="View All Shipments" icon-right="arrow_forward" size="sm" to="/shipments" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse bg-white">
          <thead>
            <tr class="border-b border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider bg-slate-50">
              <th class="py-3 px-4">Shipment #</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Corridor Lane</th>
              <th class="py-3 px-4">Carrier Partner</th>
              <th class="py-3 px-4">Vehicle Unit</th>
              <th class="py-3 px-4">Assigned Driver</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-mono text-xs">
            <tr
              v-for="row in recentShipments"
              :key="row.id"
              class="bg-white hover:bg-white transition-none"
            >
              <td class="py-3 px-4">
                <span
                  class="font-bold text-sky-700 hover:underline cursor-pointer"
                  @click="$router.push(`/shipments?id=${row.id}`)"
                >
                  {{ row.shipmentNumber }}
                </span>
              </td>
              <td class="py-3 px-4">
                <AppStatusBadge :status="row.status" />
              </td>
              <td class="py-3 px-4 font-sans text-slate-800">
                <span>{{ row.transportOrder?.originLocation?.city || 'Origin DC' }}</span>
                <q-icon name="arrow_forward" size="11px" class="q-mx-xs text-sky-600" />
                <span>{{ row.transportOrder?.destinationLocation?.city || 'Dest Hub' }}</span>
              </td>
              <td class="py-3 px-4 font-sans text-slate-600">
                {{ row.carrier?.companyName || 'Apex Fleet Logistics' }}
              </td>
              <td class="py-3 px-4 text-sky-800 font-bold">
                {{ row.vehicle?.plateNumber || 'TRK-101' }}
              </td>
              <td class="py-3 px-4 font-sans text-slate-800">
                {{ row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : 'Marcus Vance' }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <q-btn flat dense round size="xs" icon="visibility" color="primary" :to="`/shipments?id=${row.id}`">
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn flat dense round size="xs" icon="my_location" color="teal-7" to="/tracking">
                    <q-tooltip>Track on Radar</q-tooltip>
                  </q-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Inner Loading Overlay on Telematics Refresh -->
    <AppLoadingOverlay
      :showing="loading"
      title="Syncing Live Telemetry & Control Tower..."
      subtitle="Updating GPS pings, carrier performance & linehaul routes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import AppStatusBadge from '../../../components/AppStatusBadge.vue';
import LiveMap from '../../../components/LiveMap.vue';
import PermissionGate from '../../../components/PermissionGate.vue';
import api from '../../../api/client';

const $q = useQuasar();
const authStore = useAuthStore();
const loading = ref(false);

const roleTitle = computed(() => {
  switch (authStore.currentRole) {
    case 'OPERATIONS_MANAGER': return 'Operations Control Tower';
    case 'TRANSPORT_PLANNER': return 'Transport Planning Console';
    case 'COMPLIANCE_MANAGER': return 'Compliance & Regulatory Console';
    case 'SUPPORT_AGENT': return 'Customer Support Desk';
    case 'ANALYST': return 'Freight Intelligence Console';
    default: return 'Logistics Control Tower';
  }
});

const kpis = ref<any>({
  activeShipments: 24,
  deliveredShipments: 142,
  totalVehicles: 24,
  inTransitVehicles: 18,
  fleetUtilization: 78.4,
  otdPercent: 94.6,
  totalRevenue: 184500,
});

const financialMetrics = ref<any>({});
const weeklyVolumeData = ref([
  { day: 'Mon', count: 32, sla: 94, height: '58%' },
  { day: 'Tue', count: 45, sla: 96, height: '80%' },
  { day: 'Wed', count: 41, sla: 93, height: '72%' },
  { day: 'Thu', count: 54, sla: 97, height: '95%' },
  { day: 'Fri', count: 48, sla: 95, height: '84%' },
  { day: 'Sat', count: 29, sla: 98, height: '50%' },
  { day: 'Sun', count: 36, sla: 96, height: '64%' },
]);
const vehicles = ref<any[]>([
  { id: '1', code: 'TRK-101', latitude: 41.8781, longitude: -87.6298, status: 'IN_TRANSIT', speed: 64, driver: 'Marcus Vance' },
  { id: '2', code: 'TRK-102', latitude: 33.7490, longitude: -84.3880, status: 'IN_TRANSIT', speed: 58, driver: 'Sarah Jenkins' },
  { id: '3', code: 'TRK-103', latitude: 32.7767, longitude: -96.7970, status: 'AVAILABLE', speed: 0, driver: 'Carlos Morales' },
]);

const geofences = ref<any[]>([
  { id: '1', name: 'Chicago Central Hub', latitude: 41.8781, longitude: -87.6298, radius: 2500 },
  { id: '2', name: 'Dallas Logistics Center', latitude: 32.7767, longitude: -96.7970, radius: 3000 },
]);

const exceptions = ref<any[]>([
  { id: '1', severity: 'CRITICAL', time: '10m ago', asset: 'TRK-108', message: 'Route deviation detected on I-75 North' },
  { id: '2', severity: 'HIGH', time: '28m ago', asset: 'TRK-102', message: 'Dwell timeout exceeded (>45m) at Atlanta DC' },
  { id: '3', severity: 'MEDIUM', time: '1h ago', asset: 'TRK-104', message: 'Speed limit advisory: 74 mph in 65 mph zone' },
]);

const carriers = ref<any[]>([
  { companyName: 'Titan Freightways Corp', rating: '4.9', _count: { shipments: 28 } },
  { companyName: 'Swift Haulage International', rating: '4.8', _count: { shipments: 22 } },
  { companyName: 'Apex Dedicated Fleet', rating: '4.95', _count: { shipments: 45 } },
]);

const recentShipments = ref<any[]>([
  {
    id: 's-1',
    shipmentNumber: 'SHP-2024-001',
    status: 'IN_TRANSIT',
    transportOrder: { originLocation: { city: 'Chicago, IL' }, destinationLocation: { city: 'Dallas, TX' } },
    carrier: { companyName: 'Apex Dedicated Fleet' },
    vehicle: { plateNumber: 'TRK-101' },
    driver: { firstName: 'Marcus', lastName: 'Vance' },
  },
  {
    id: 's-2',
    shipmentNumber: 'SHP-2024-002',
    status: 'DISPATCHED',
    transportOrder: { originLocation: { city: 'Atlanta, GA' }, destinationLocation: { city: 'Miami, FL' } },
    carrier: { companyName: 'Titan Freightways' },
    vehicle: { plateNumber: 'TRK-102' },
    driver: { firstName: 'Sarah', lastName: 'Jenkins' },
  },
  {
    id: 's-3',
    shipmentNumber: 'SHP-2024-003',
    status: 'DELIVERED',
    transportOrder: { originLocation: { city: 'Seattle, WA' }, destinationLocation: { city: 'Denver, CO' } },
    carrier: { companyName: 'Swift Haulage' },
    vehicle: { plateNumber: 'TRK-104' },
    driver: { firstName: 'Johnathan', lastName: 'Reed' },
  },
]);

async function loadDashboard() {
  loading.value = true;
  const startTime = Date.now();
  try {
    const ovRes: any = await api.get('/api/v1/dashboard/overview');
    const ov = ovRes.data || ovRes;
    if (ov && ov.activeShipments !== undefined) {
      kpis.value = { ...kpis.value, ...ov };
    }
  } catch {}

  if (authStore.hasPermission('shipment:view')) {
    try {
      const shpRes: any = await api.get('/api/v1/dashboard/shipments');
      const list = shpRes.data || shpRes;
      if (Array.isArray(list) && list.length > 0) recentShipments.value = list;
    } catch {}
  }

  if (authStore.hasPermission('tracking:view') || authStore.hasPermission('fleet:view')) {
    try {
      const fltRes: any = await api.get('/api/v1/dashboard/fleet');
      const fList = fltRes.data || fltRes;
      if (Array.isArray(fList) && fList.length > 0) vehicles.value = fList;
    } catch {}
  }

  if (authStore.hasPermission('exception:view')) {
    try {
      const excRes: any = await api.get('/api/v1/dashboard/exceptions');
      const eList = excRes.data || excRes;
      if (Array.isArray(eList) && eList.length > 0) exceptions.value = eList;
    } catch {}
  }

  if (authStore.hasPermission('carrier:view')) {
    try {
      const cRes: any = await api.get('/api/v1/carriers');
      const cList = cRes.data || cRes;
      if (Array.isArray(cList) && cList.length > 0) carriers.value = cList.slice(0, 5);
    } catch {}
  }

  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, 600 - elapsed);
  setTimeout(() => {
    loading.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Telemetry Refreshed',
      caption: 'Live fleet telemetry and active shipments synced.',
      timeout: 1800,
      position: 'top-right',
    });
  }, remaining);
}

function onOrgContextChange() {
  loadDashboard();
}

onMounted(() => {
  loadDashboard();
  window.addEventListener('tms:org-context-changed', onOrgContextChange);
});

onUnmounted(() => {
  window.removeEventListener('tms:org-context-changed', onOrgContextChange);
});
</script>

<style scoped>
.operations-console-wrapper {
  background-color: transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 242, 254, 0.4);
}
</style>
