<template>
  <div class="planner-console-wrapper p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-white">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Transport Planning / Load Consolidation"
      title="Transport Planning & Optimization Console"
      subtitle="Load consolidation, vehicle density & AI corridor routing"
    >
      <template #badge>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            AI OPTIMIZER v3.4 ACTIVE
          </span>
          <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20">
            142,000 KG PENDING PLAN
          </span>
        </div>
      </template>

      <template #actions>
        <q-btn
          flat
          dense
          round
          icon="refresh"
          color="cyan"
          size="sm"
          class="q-mr-xs"
          @click="refreshData"
          :loading="loading"
        >
          <template #loading>
            <q-spinner color="cyan" size="16px" />
          </template>
          <q-tooltip>Refresh Planning Queue</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="cyan"
          dense
          no-caps
          icon="auto_awesome"
          label="Auto-Consolidate All"
          size="sm"
          class="q-px-sm q-mr-xs font-bold"
          @click="runAutoBatch"
          :loading="batchOptimizing"
        />
        <q-btn
          class="desk-btn-primary"
          icon="alt_route"
          label="Open Planning Workspace"
          no-caps
          size="sm"
          to="/planning"
        />
      </template>
    </AppPageHeader>

    <!-- Main Planning Workspace with Loading Overlay -->
    <div class="relative min-h-[400px] space-y-6">
      <!-- Planning KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Unplanned Orders"
        value="8 Orders"
        icon="receipt_long"
        icon-color="amber"
        change="+2 today"
        :is-positive="false"
        subtitle="142,000 kg cargo pending allocation"
      />
      <AppStatCard
        title="Available Capacity"
        value="6 Tractors / 4 3PL"
        icon="local_shipping"
        icon-color="cyan"
        subtitle="Staged across primary hubs (184T free)"
      />
      <AppStatCard
        title="Avg. Load Fill Rate"
        value="88.4%"
        icon="pie_chart"
        icon-color="emerald"
        change="+3.2%"
        :is-positive="true"
        subtitle="Weight & volumetric cube density"
      />
      <AppStatCard
        title="Optimization Savings"
        value="₹68,450 / wk"
        icon="trending_up"
        icon-color="cyan"
        change="+12.4%"
        :is-positive="true"
        subtitle="Multi-drop route consolidation"
      />
    </div>

    <!-- Planning Workspace Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Left Column (8 Cols): Queue & AI Batch Recommendations -->
      <div class="lg:col-span-8 space-y-5">
        <!-- Unconsolidated Orders Queue -->
        <div class="cyber-card p-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
            <div>
              <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></span>
                Unconsolidated Orders in Planning Queue
                <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  {{ filteredOrders.length }} ORDERS
                </span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">Filter by corridor lane, select orders, and assign to vehicle capacity</div>
            </div>

            <!-- Corridor Filter Tabs -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="lane in ['ALL', 'AHM-MUM', 'SUR-PUN', 'MUM-DEL']"
                :key="lane"
                class="px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border"
                :class="selectedLane === lane ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,242,254,0.2)]' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'"
                @click="selectedLane = lane"
              >
                {{ lane }}
              </button>
            </div>
          </div>

          <!-- Orders List -->
          <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scroll">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-planning-item p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-850/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              :class="{ 'border-cyan-400/60 bg-cyan-950/20': selectedOrderIds.includes(order.id) }"
            >
              <div class="flex items-start sm:items-center gap-3">
                <q-checkbox
                  v-model="selectedOrderIds"
                  :val="order.id"
                  dense
                  color="cyan"
                  class="mt-0.5 sm:mt-0"
                />
                <div>
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="font-mono font-bold text-sm text-cyan-300">{{ order.orderNumber }}</span>
                    <span class="text-xs px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                      {{ order.customer }}
                    </span>
                    <span class="text-xs text-amber-300 font-mono font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                      {{ order.weight }} &bull; {{ order.volume }}
                    </span>
                    <span
                      class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border"
                      :class="order.priority === 'URGENT' ? 'bg-red-950 text-red-300 border-red-500/40' : 'bg-blue-950 text-blue-300 border-blue-500/40'"
                    >
                      {{ order.priority }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <span class="text-white">{{ order.origin }}</span>
                    <q-icon name="arrow_forward" size="11px" class="text-cyan-400" />
                    <span class="text-white">{{ order.destination }}</span>
                    <span class="text-slate-500 text-[11px] font-mono ml-2">SLA: {{ order.sla }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <q-btn
                  outline
                  dense
                  no-caps
                  color="cyan"
                  label="Stage in Batch"
                  size="sm"
                  class="q-px-sm text-xs font-semibold"
                  @click="stageOrder(order)"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Batch Footer -->
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">
              Selected: <strong class="text-cyan-300">{{ selectedOrderIds.length }} orders</strong> ({{ selectedTotalWeight }} kg)
            </span>
            <div class="flex items-center gap-2">
              <q-btn
                v-if="selectedOrderIds.length > 0"
                class="desk-btn-primary"
                dense
                no-caps
                size="sm"
                icon="merge_type"
                label="Consolidate Into New Trip Plan"
                to="/planning"
              />
            </div>
          </div>
        </div>

        <!-- AI Multi-Drop Trip Consolidation Recommendations -->
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <q-icon name="auto_fix_high" color="cyan" size="18px" />
                AI-Recommended Multi-Drop Trip Batches
              </div>
              <div class="text-xs text-slate-400">Pre-optimized corridor combinations maximizing weight and volumetric cube</div>
            </div>
            <span class="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              HIGH CONFIDENCE
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Batch Alpha -->
            <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-mono font-bold text-xs text-cyan-300">BATCH #TP-901</span>
                  <span class="text-[11px] font-bold text-emerald-400 font-mono">94.2% VEHICLE FILL</span>
                </div>
                <div class="text-xs font-bold text-white mb-1">Ahmedabad &rarr; Surat &rarr; Mumbai Corridor</div>
                <div class="text-[11px] text-slate-400 mb-2 font-mono">Assigned: 28 Ton Multi-Axle (GJ-01-AX-9942)</div>

                <div class="space-y-1 mb-3 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <div class="flex justify-between">
                    <span>Cargo Weight:</span>
                    <strong class="text-white">26,400 kg / 28,000 kg</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Volume Density:</span>
                    <strong class="text-white">58 m³ / 62 m³</strong>
                  </div>
                  <div class="flex justify-between text-cyan-300 font-bold">
                    <span>Est. Fuel & Toll Savings:</span>
                    <span>₹14,200</span>
                  </div>
                </div>
              </div>

              <q-btn
                class="desk-btn-primary full-width text-xs font-bold"
                dense
                no-caps
                label="Approve & Send to Dispatch"
                icon="send"
                @click="approveBatch('TP-901')"
              />
            </div>

            <!-- Batch Beta -->
            <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-mono font-bold text-xs text-cyan-300">BATCH #TP-902</span>
                  <span class="text-[11px] font-bold text-emerald-400 font-mono">89.6% VEHICLE FILL</span>
                </div>
                <div class="text-xs font-bold text-white mb-1">Surat Depot &rarr; Vapi &rarr; Pune Express</div>
                <div class="text-[11px] text-slate-400 mb-2 font-mono">Assigned: 20 Ton HCV (MH-04-CP-8119)</div>

                <div class="space-y-1 mb-3 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <div class="flex justify-between">
                    <span>Cargo Weight:</span>
                    <strong class="text-white">17,920 kg / 20,000 kg</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Volume Density:</span>
                    <strong class="text-white">39 m³ / 44 m³</strong>
                  </div>
                  <div class="flex justify-between text-cyan-300 font-bold">
                    <span>Est. Fuel & Toll Savings:</span>
                    <span>₹9,800</span>
                  </div>
                </div>
              </div>

              <q-btn
                class="desk-btn-primary full-width text-xs font-bold"
                dense
                no-caps
                label="Approve & Send to Dispatch"
                icon="send"
                @click="approveBatch('TP-902')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (4 Cols): Live Simulation, Staged Fleet & Spot Rates -->
      <div class="lg:col-span-4 space-y-5">
        <!-- Live Vehicle Trailer Loading Simulation Bay -->
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <q-icon name="view_in_ar" color="cyan" size="18px" />
              Live Trailer Axle Simulation
            </div>
            <span
              class="text-xs font-mono font-bold px-2 py-0.5 rounded border"
              :class="stagedFillRate > 100 ? 'bg-rose-950 text-rose-300 border-rose-500/50' : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'"
            >
              {{ stagedFillRate > 100 ? 'OVERLOAD LIMIT' : `${stagedFillRate}% STAGED` }}
            </span>
          </div>

          <!-- Truck Trailer Graphical Diagram -->
          <div class="relative bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-3 overflow-hidden">
            <div class="flex items-center gap-2 mb-2.5">
              <!-- Trailer Box -->
              <div class="flex-1 relative h-18 bg-slate-900/90 rounded-lg border-2 border-dashed border-cyan-500/40 p-1.5 overflow-hidden flex flex-col justify-end">
                <div
                  class="w-full bg-gradient-to-t from-cyan-600/70 via-blue-600/50 to-cyan-400/30 rounded transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]"
                  :style="`height: ${Math.min(stagedFillRate, 100)}%`"
                >
                  <span v-if="stagedFillRate > 25">{{ stagedFillRate }}% PAYLOAD</span>
                </div>
                <!-- Grid line marks -->
                <div class="absolute inset-0 pointer-events-none flex flex-col justify-between p-1 opacity-20">
                  <div class="border-b border-cyan-400 w-full"></div>
                  <div class="border-b border-cyan-400 w-full"></div>
                </div>
              </div>

              <!-- Truck Cab -->
              <div class="w-10 h-14 bg-slate-850 rounded-r-xl border border-slate-700 flex flex-col items-center justify-center shrink-0">
                <q-icon name="local_shipping" color="cyan" size="20px" />
                <span class="text-[8px] font-mono text-slate-400">CAB</span>
              </div>
            </div>

            <!-- Axle Indicators -->
            <div class="flex justify-between px-3 text-[10px] font-mono text-slate-500">
              <span>Tandem: {{ (selectedWeightNum * 0.55).toFixed(0) }} kg</span>
              <span>Drive: {{ (selectedWeightNum * 0.35).toFixed(0) }} kg</span>
              <span>Steer: {{ (selectedWeightNum * 0.10).toFixed(0) }} kg</span>
            </div>
          </div>

          <!-- Staged Weight Progress -->
          <div class="space-y-2 font-mono text-xs mb-3">
            <div class="flex justify-between text-slate-300">
              <span>Staged Weight:</span>
              <strong :class="stagedFillRate > 100 ? 'text-rose-400' : 'text-cyan-300'">
                {{ selectedWeightNum.toLocaleString() }} / 28,000 kg
              </strong>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="stagedFillRate > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'"
                :style="`width: ${Math.min(stagedFillRate, 100)}%`"
              ></div>
            </div>
          </div>

          <q-btn
            class="desk-btn-primary full-width text-xs font-bold"
            dense
            no-caps
            icon="alt_route"
            label="Open in 3D Capacity Optimizer"
            to="/planning"
          />
        </div>

        <!-- Staged Fleet Capacity Radar -->
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <q-icon name="local_shipping" color="cyan" size="18px" />
              Staged Fleet Capacity
            </div>
            <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              3 READY
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="veh in stagedVehicles"
              :key="veh.plate"
              class="p-3 rounded-lg border border-slate-800 bg-slate-900/60"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono font-bold text-xs text-white">{{ veh.plate }}</span>
                <span class="text-[11px] font-mono text-cyan-300 font-bold">{{ veh.capacity }}</span>
              </div>
              <div class="text-xs text-slate-400 mb-2">{{ veh.type }} &bull; Staged: <span class="text-slate-200">{{ veh.location }}</span></div>
              
              <!-- Utilization Meter -->
              <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mb-1">
                <div
                  class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                  :style="`width: ${veh.plate === 'GJ-01-AX-9942' ? Math.min(stagedFillRate, 100) : veh.fillPercent}%`"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{{ veh.plate === 'GJ-01-AX-9942' ? stagedFillRate : veh.fillPercent }}% Staged</span>
                <span>Free: {{ veh.plate === 'GJ-01-AX-9942' ? `${Math.max(28000 - selectedWeightNum, 0).toLocaleString()} kg` : veh.freeCapacity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Carrier Spot Rates & Contracts -->
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-bold text-white tracking-wide">Carrier Lane Rates</div>
            <router-link to="/carriers" class="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300">
              All &rarr;
            </router-link>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div class="font-bold text-white group-hover:text-cyan-300 transition-colors">Titan Freightways</div>
                <div class="text-slate-400 text-[11px]">Ahmedabad &rarr; Mumbai Corridor</div>
              </div>
              <span class="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                ₹2,100 / MT
              </span>
            </div>

            <div class="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div class="font-bold text-white group-hover:text-cyan-300 transition-colors">Swift TransLog</div>
                <div class="text-slate-400 text-[11px]">Surat &rarr; Pune Express</div>
              </div>
              <span class="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                ₹1,850 / MT
              </span>
            </div>

            <div class="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div class="font-bold text-white group-hover:text-cyan-300 transition-colors">Apex Dedicated Linehaul</div>
                <div class="text-slate-400 text-[11px]">Mumbai &rarr; Delhi Corridor</div>
              </div>
              <span class="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                ₹2,750 / MT
              </span>
            </div>
          </div>
        </div>

        <!-- Algorithm Presets -->
        <div class="cyber-card p-5">
          <div class="text-sm font-bold text-white tracking-wide mb-1 flex items-center gap-2">
            <q-icon name="tune" color="cyan" size="16px" />
            Optimization Algorithm Engine
          </div>
          <p class="text-xs text-slate-400 mb-3">
            Active multi-drop heuristic: Minimum distance & fuel cost penalty with volumetric axle limit
          </p>
          <div class="space-y-1.5 text-xs font-mono mb-4 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div class="flex justify-between text-slate-300">
              <span>Objective:</span>
              <strong class="text-cyan-300">Fuel & Toll Min</strong>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Max Drops / Trip:</span>
              <strong class="text-white">4 Drops</strong>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Density Factor:</span>
              <strong class="text-white">1.18x (High Cube)</strong>
            </div>
          </div>
          <q-btn
            outline
            dense
            no-caps
            color="cyan"
            icon="tune"
            label="Tune Engine Parameters"
            to="/planning"
            class="full-width text-xs font-bold"
          />
        </div>
      </div>
    </div>

      <!-- Inner Loading Overlay on Refresh -->
      <AppLoadingOverlay
        :showing="loading"
        title="Refreshing Planning Console..."
        subtitle="Syncing multi-drop orders & live fleet capacity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';

const $q = useQuasar();
const loading = ref(false);
const batchOptimizing = ref(false);
const selectedLane = ref('ALL');
const selectedOrderIds = ref<string[]>(['1']);

const queueOrders = ref([
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: 'Reliance Retail DC',
    weight: '24,000 kg',
    weightNum: 24000,
    volume: '42 m³',
    origin: 'Ahmedabad Hub',
    destination: 'Mumbai Central DC',
    lane: 'AHM-MUM',
    priority: 'URGENT',
    sla: 'Today 18:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: 'Adani Logistics',
    weight: '18,500 kg',
    weightNum: 18500,
    volume: '34 m³',
    origin: 'Surat Depot',
    destination: 'Pune Distribution',
    lane: 'SUR-PUN',
    priority: 'HIGH',
    sla: 'Tomorrow 10:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: 'Tata Steel Ltd',
    weight: '32,000 kg',
    weightNum: 32000,
    volume: '18 m³',
    origin: 'Mumbai Port',
    destination: 'Vadodara Hub',
    lane: 'AHM-MUM',
    priority: 'STANDARD',
    sla: 'Tomorrow 14:00',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: 'Asian Paints Ltd',
    weight: '16,200 kg',
    weightNum: 16200,
    volume: '28 m³',
    origin: 'Ankleshwar GIDC',
    destination: 'Bhiwandi Hub',
    lane: 'AHM-MUM',
    priority: 'URGENT',
    sla: 'Today 22:00',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: 'Maruti Suzuki Auto',
    weight: '22,400 kg',
    weightNum: 22400,
    volume: '56 m³',
    origin: 'Sanand Plant',
    destination: 'Delhi NCR Hub',
    lane: 'MUM-DEL',
    priority: 'HIGH',
    sla: '2 Oct 12:00',
  },
]);

const stagedVehicles = ref([
  {
    plate: 'GJ-01-AX-9942',
    type: '28T Multi-Axle Taurus',
    location: 'Ahmedabad Central Yard',
    capacity: '28,000 kg',
    fillPercent: 0,
    freeCapacity: '28,000 kg',
  },
  {
    plate: 'MH-04-CP-8119',
    type: '20T HCV 10-Wheeler',
    location: 'Surat Ring Road Yard',
    capacity: '20,000 kg',
    fillPercent: 0,
    freeCapacity: '20,000 kg',
  },
  {
    plate: 'DL-01-AB-4491',
    type: '32T Multi-Axle Trailer',
    location: 'Mumbai Port Logistics Park',
    capacity: '32,000 kg',
    fillPercent: 0,
    freeCapacity: '32,000 kg',
  },
]);

const filteredOrders = computed(() => {
  if (selectedLane.value === 'ALL') return queueOrders.value;
  return queueOrders.value.filter((o) => o.lane === selectedLane.value);
});

const selectedWeightNum = computed(() => {
  return queueOrders.value
    .filter((o) => selectedOrderIds.value.includes(o.id))
    .reduce((acc, curr) => acc + curr.weightNum, 0);
});

const selectedTotalWeight = computed(() => {
  return selectedWeightNum.value.toLocaleString();
});

const stagedFillRate = computed(() => {
  return Math.round((selectedWeightNum.value / 28000) * 100);
});

function refreshData() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Planning Queue refreshed with live orders',
      caption: 'Telematics, order weights, and staged tractors updated.',
      timeout: 1800,
      position: 'top-right',
    });
  }, 650);
}

function runAutoBatch() {
  batchOptimizing.value = true;
  setTimeout(() => {
    batchOptimizing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'auto_awesome',
      message: 'AI Optimizer generated 2 high-density trip batches!',
      caption: 'Estimated cost savings: ₹24,000',
      timeout: 3000,
      position: 'top-right',
    });
  }, 900);
}

function stageOrder(order: any) {
  if (!selectedOrderIds.value.includes(order.id)) {
    selectedOrderIds.value.push(order.id);
  }
  $q.notify({
    type: 'info',
    icon: 'merge_type',
    message: `Order ${order.orderNumber} staged in plan`,
    timeout: 1500,
    position: 'top-right',
  });
}

function approveBatch(batchId: string) {
  $q.notify({
    type: 'positive',
    icon: 'verified',
    message: `Trip Batch #${batchId} Approved & Pushed to Dispatch Console!`,
    caption: 'Tractor and driver allocated en-route',
    timeout: 3000,
    position: 'top-right',
  });
}
</script>

<style scoped>
.planner-console-wrapper {
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
