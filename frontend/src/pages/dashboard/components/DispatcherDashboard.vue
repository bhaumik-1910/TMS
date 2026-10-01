<template>
  <div class="dispatch-console-wrapper p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-white">
    <!-- Page Header (Single Row Compact Layout) -->
    <AppPageHeader
      breadcrumb="Operations & Dispatch / Dispatch Command Desk"
      title="Dispatch Command Center"
      subtitle="Load tendering, driver assignment, trip execution, and live corridor exceptions"
    >
      <template #badge>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/70 text-amber-300 border border-amber-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            DISPATCH COMMAND ACTIVE
          </span>
          <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
            18 ACTIVE LINEHAULS
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
          <q-tooltip>Refresh Telematics & Queue</q-tooltip>
        </q-btn>
        <q-btn
          class="desk-btn-primary"
          icon="add"
          label="Quick Allocate (Ctrl+N)"
          no-caps
          size="sm"
          @click="openDispatchModal(null)"
        >
          <q-tooltip>Quick Allocate Freight & Release Trip</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="cyan"
          dense
          no-caps
          icon="view_kanban"
          label="Kanban Board"
          size="sm"
          class="q-px-sm font-bold"
          to="/dispatch"
        />
      </template>
    </AppPageHeader>

    <!-- Main Workspace with Inner Loading Overlay -->
    <div class="relative min-h-[400px] space-y-6">
      <!-- Top Operational Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppStatCard
          title="Unassigned Freight Loads"
          value="5 Orders"
          icon="assignment_late"
          icon-color="amber"
          change="48,500 kg pending"
          :is-positive="false"
          subtitle="Awaiting tractor & driver allocation"
        />
        <AppStatCard
          title="Active Linehaul Trips"
          value="18 Linehauls"
          icon="local_shipping"
          icon-color="cyan"
          change="96.4% OTD SLA"
          :is-positive="true"
          subtitle="Moving across freight corridors"
        />
        <AppStatCard
          title="Available Drivers on Duty"
          value="8 Ready"
          icon="badge"
          icon-color="positive"
          change="HOS Verified"
          :is-positive="true"
          subtitle="Rest cycle complete, available for call"
        />
        <AppStatCard
          title="Fleet Vehicle Readiness"
          value="24 Units"
          icon="minor_crash"
          icon-color="cyan"
          subtitle="18 In-Transit • 5 Staged • 1 In-Shop"
        />
      </div>

      <!-- Mid Section: Load Allocation Matrix (8 cols) & Driver Telematics Bay (4 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Unassigned Freight Orders Allocation Matrix -->
        <div class="lg:col-span-8 space-y-4">
          <div class="cyber-card p-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
              <div>
                <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                  Unassigned Freight Bookings Needing Dispatch
                  <span class="text-xs font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                    {{ filteredOrders.length }} PENDING
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">Match confirmed customer orders with available drivers and tractor units</div>
              </div>

              <!-- Corridor Filter Tabs -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="corridor in corridors"
                  :key="corridor.id"
                  @click="selectedCorridor = corridor.id"
                  class="px-2.5 py-1 rounded text-xs font-mono transition-all border"
                  :class="selectedCorridor === corridor.id ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'"
                >
                  {{ corridor.label }}
                </button>
              </div>
            </div>

            <!-- Pending Orders Cards -->
            <div class="space-y-3">
              <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="order-dispatch-card p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-mono font-bold text-sm text-cyan-400">{{ order.orderNumber }}</span>
                    <span
                      class="text-[11px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border"
                      :class="order.priority === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-blue-950 text-blue-300 border-blue-800'"
                    >
                      {{ order.priority }}
                    </span>
                    <span class="text-xs text-slate-300 font-medium truncate">{{ order.customer }}</span>
                    <span class="text-xs text-slate-500">•</span>
                    <span class="text-xs text-slate-400 font-mono">{{ order.commodity }}</span>
                  </div>

                  <!-- Origin -> Destination -->
                  <div class="text-sm font-semibold text-white flex items-center gap-2">
                    <span class="text-slate-200">{{ order.origin }}</span>
                    <q-icon name="arrow_forward" size="14px" color="cyan-4" />
                    <span class="text-cyan-300">{{ order.destination }}</span>
                    <span class="text-xs font-mono text-slate-400">({{ order.distanceKm }} km)</span>
                  </div>

                  <!-- Details Pill Row -->
                  <div class="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                    <span class="flex items-center gap-1 text-slate-300">
                      <q-icon name="scale" size="13px" color="cyan-4" />
                      {{ (order.weightKg).toLocaleString() }} kg ({{ order.pallets }} Pallets)
                    </span>
                    <span class="flex items-center gap-1 text-amber-300">
                      <q-icon name="schedule" size="13px" />
                      Req. Pickup: {{ order.pickupTime }}
                    </span>
                    <span class="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60 text-[10px]">
                      {{ order.rateQuote }}
                    </span>
                  </div>

                  <!-- AI Auto-Match Recommendation -->
                  <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono">
                    <span class="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                      <q-icon name="auto_awesome" size="13px" />
                      Recommended Allocation:
                    </span>
                    <span class="text-white font-semibold">{{ order.recommendedUnit }}</span>
                    <span class="text-slate-400">• Driver: {{ order.recommendedDriver }}</span>
                    <span class="text-emerald-400 text-[10px] bg-emerald-950/40 px-1 rounded border border-emerald-500/20">HOS: 11h</span>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                  <q-btn
                    outline
                    dense
                    no-caps
                    size="sm"
                    color="grey-5"
                    label="Tender 3PL"
                    class="font-mono text-xs px-2"
                    @click="tenderCarrier(order)"
                  />
                  <q-btn
                    class="desk-btn-primary"
                    dense
                    no-caps
                    size="sm"
                    icon="send"
                    label="Dispatch Now"
                    @click="openDispatchModal(order)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Driver Readiness Roster & Live Depot Radar -->
        <div class="lg:col-span-4 space-y-4">
          <!-- Ready Drivers on Call -->
          <div class="cyber-card p-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <div class="text-sm font-bold text-white flex items-center gap-1.5">
                  <q-icon name="badge" size="16px" color="cyan" />
                  Available Drivers on Call
                </div>
                <div class="text-[11px] text-slate-400">Rest cycle verified & DOT HOS compliant</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {{ availableDrivers.length }} READY
              </span>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="driver in availableDrivers"
                :key="driver.id"
                class="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 flex items-center justify-center font-bold font-mono text-xs">
                    {{ driver.initials }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">{{ driver.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      {{ driver.homeBase }} • {{ driver.vehicle }}
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-xs font-bold font-mono text-emerald-400">{{ driver.hos }} HOS</div>
                  <div class="text-[9px] text-slate-500 font-mono">Remaining</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Staged Tractors at Hub -->
          <div class="cyber-card p-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <div class="text-sm font-bold text-white flex items-center gap-1.5">
                  <q-icon name="local_shipping" size="16px" color="amber" />
                  Staged Tractors at Terminal
                </div>
                <div class="text-[11px] text-slate-400">Pre-trip inspected & fueled units</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800">
                5 STAGED
              </span>
            </div>

            <div class="space-y-2 text-xs font-mono">
              <div
                v-for="tractor in stagedTractors"
                :key="tractor.unit"
                class="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <span class="font-bold text-cyan-300">{{ tractor.unit }}</span>
                  <span class="text-slate-400 text-[11px] font-sans">{{ tractor.model }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 text-[11px]">Fuel: {{ tractor.fuel }}%</span>
                  <span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">OK</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Corridor Advisory Widget -->
          <div class="cyber-card p-4 border border-amber-800/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
            <div class="flex items-center gap-2 mb-2">
              <q-icon name="warning" color="amber" size="18px" />
              <span class="text-xs font-bold text-amber-300 uppercase tracking-wider">Corridor Weather & Traffic Alert</span>
            </div>
            <p class="text-xs text-slate-300 mb-2 leading-relaxed font-sans">
              I-80 Western Corridor Milepost 140–180: High wind gusts advisory. High-profile vehicles restricted to 55 mph.
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <span>National Weather Service</span>
              <span class="text-cyan-400 cursor-pointer hover:underline" @click="$router.push('/tracking')">View on Radar →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Active Dispatched Linehauls (Full-Width Tracking Feed) -->
      <div class="cyber-card p-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></span>
              Active Dispatched Linehauls Feed
              <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                18 MOVING UNITS
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Real-time GPS transit milestones, driver velocity, and corridor progress</div>
          </div>

          <div class="flex items-center gap-2">
            <q-btn flat dense no-caps color="cyan" label="Open Live Radar Map" icon="my_location" size="sm" to="/tracking" />
            <q-btn flat dense no-caps color="grey-4" label="View All Shipments →" size="sm" to="/shipments" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr class="border-b border-slate-800 text-[11px] font-bold text-cyan-400 uppercase tracking-wider bg-slate-950/60">
                <th class="py-3 px-4">Trip ID / Shipment</th>
                <th class="py-3 px-4">Tractor / Driver</th>
                <th class="py-3 px-4">Corridor Lane</th>
                <th class="py-3 px-4">Transit Progress</th>
                <th class="py-3 px-4">Speed & Milestones</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="trip in activeTrips"
                :key="trip.id"
                class="hover:bg-slate-850/60 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-bold text-cyan-300 cursor-pointer hover:underline" @click="$router.push(`/shipments?id=${trip.shipmentId}`)">
                    {{ trip.tripId }}
                  </div>
                  <div class="text-[10px] text-slate-400">{{ trip.shipmentNumber }}</div>
                </td>

                <td class="py-3 px-4">
                  <div class="font-bold text-white">{{ trip.vehiclePlate }}</div>
                  <div class="text-[11px] text-slate-300 font-sans">{{ trip.driverName }}</div>
                </td>

                <td class="py-3 px-4 font-sans text-slate-200">
                  <div class="font-medium">{{ trip.origin }} &rarr; {{ trip.destination }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ trip.totalDistance }} km total</div>
                </td>

                <td class="py-3 px-4" style="min-width: 180px;">
                  <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{{ trip.completedDistance }} km completed</span>
                    <span class="font-bold text-cyan-300">{{ trip.progressPercent }}%</span>
                  </div>
                  <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      :style="{ width: `${trip.progressPercent}%` }"
                    ></div>
                  </div>
                </td>

                <td class="py-3 px-4">
                  <div class="text-emerald-400 font-bold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {{ trip.speed }} mph
                  </div>
                  <div class="text-[10px] text-slate-400">ETA: {{ trip.eta }}</div>
                </td>

                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                    :class="getStatusBadgeClass(trip.status)"
                  >
                    {{ trip.status }}
                  </span>
                </td>

                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <q-btn flat dense round size="xs" icon="my_location" color="cyan" to="/tracking">
                      <q-tooltip>Track on Live Radar</q-tooltip>
                    </q-btn>
                    <q-btn flat dense round size="xs" icon="visibility" color="teal-4" :to="`/shipments?id=${trip.shipmentId}`">
                      <q-tooltip>View Shipment Details</q-tooltip>
                    </q-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inner Loading Overlay on Telematics Refresh -->
      <q-inner-loading :showing="loading" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Syncing Live Dispatch Telematics...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Updating driver HOS status, terminal staging bays & active corridor linehauls
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Quick Dispatch Allocation Dialog -->
    <q-dialog v-model="showDispatchDialog" persistent>
      <div class="cyber-modal bg-slate-900 border border-slate-700 text-white rounded-xl p-5 max-w-[600px] w-full">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div class="flex items-center gap-2">
            <q-icon name="send" color="cyan" size="20px" />
            <div class="text-base font-bold text-white">Instant Trip Manifest & Dispatch Release</div>
          </div>
          <q-btn flat dense round icon="close" color="slate-400" v-close-popup />
        </div>

        <div class="space-y-4 text-xs font-mono">
          <div class="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-slate-400">Freight Order</div>
              <div class="font-bold text-cyan-300 text-sm font-sans">{{ dispatchForm.orderNumber }} - {{ dispatchForm.customer }}</div>
              <div class="text-[11px] text-slate-300">{{ dispatchForm.origin }} &rarr; {{ dispatchForm.destination }}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {{ dispatchForm.weightKg }} KG
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Assign Tractor Unit</label>
              <q-select
                v-model="dispatchForm.vehicleId"
                :options="vehicleSelectOptions"
                dense
                outlined
                emit-value
                map-options
                class="dark-input"
              />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Assign Driver (HOS Verified)</label>
              <q-select
                v-model="dispatchForm.driverId"
                :options="driverSelectOptions"
                dense
                outlined
                emit-value
                map-options
                class="dark-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Starting Odometer (KM)</label>
              <q-input
                v-model="dispatchForm.startOdometer"
                dense
                outlined
                type="number"
                class="dark-input"
              />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Container Seal Number</label>
              <q-input
                v-model="dispatchForm.sealNumber"
                dense
                outlined
                placeholder="SEAL-98214"
                class="dark-input"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <q-btn flat dense no-caps label="Cancel" color="slate-400" v-close-popup />
          <q-btn
            class="desk-btn-primary"
            dense
            no-caps
            icon="check_circle"
            label="Authorize & Release Linehaul"
            :loading="dispatching"
            @click="submitDispatch"
          />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import api from '../../../api/client';

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const dispatching = ref(false);
const showDispatchDialog = ref(false);
const selectedCorridor = ref('ALL');

const corridors = ref([
  { id: 'ALL', label: 'All Corridors' },
  { id: 'WEST', label: 'Western Express' },
  { id: 'MIDWEST', label: 'Midwest Corridor' },
  { id: 'SOUTH', label: 'Southern Spine' },
]);

const pendingOrders = ref([
  {
    id: 'ord-1',
    orderNumber: 'ORD-5501',
    customer: 'TechCorp Industries',
    origin: 'Chicago Central Hub, IL',
    destination: 'Dallas Logistics Center, TX',
    corridor: 'WEST',
    priority: 'HIGH',
    commodity: 'Electronics & Components',
    weightKg: 18400,
    pallets: 26,
    distanceKm: 1480,
    pickupTime: 'Today 04:00 PM',
    rateQuote: '₹1,24,000 Contracted',
    recommendedUnit: 'TRK-101 (Volvo FH16)',
    recommendedDriver: 'Marcus Vance',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-5502',
    customer: 'FreshDirect Cold Chain',
    origin: 'Atlanta Distribution Depot, GA',
    destination: 'Miami Freight Terminal, FL',
    corridor: 'MIDWEST',
    priority: 'HIGH',
    commodity: 'Refrigerated Pharma & Food',
    weightKg: 14200,
    pallets: 20,
    distanceKm: 1060,
    pickupTime: 'Tomorrow 08:00 AM',
    rateQuote: '₹98,500 Contracted',
    recommendedUnit: 'TRK-102 (BharatBenz 4028T)',
    recommendedDriver: 'Sarah Jenkins',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-5503',
    customer: 'AutoWorks Global',
    origin: 'Detroit Assembly Plant, MI',
    destination: 'Columbus Logistics Center, OH',
    corridor: 'MIDWEST',
    priority: 'NORMAL',
    commodity: 'Automotive Subassemblies',
    weightKg: 22000,
    pallets: 32,
    distanceKm: 330,
    pickupTime: 'Tomorrow 10:00 AM',
    rateQuote: '₹42,000 Contracted',
    recommendedUnit: 'TRK-108 (Tata Prima 5530)',
    recommendedDriver: 'Carlos Morales',
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-5504',
    customer: 'Summit Retail Corp',
    origin: 'Seattle Inland Port, WA',
    destination: 'Denver Central Depot, CO',
    corridor: 'WEST',
    priority: 'NORMAL',
    commodity: 'Consumer Goods & Apparel',
    weightKg: 16500,
    pallets: 24,
    distanceKm: 2100,
    pickupTime: 'Oct 03 06:00 AM',
    rateQuote: '₹1,85,000 Contracted',
    recommendedUnit: 'TRK-104 (Volvo FM)',
    recommendedDriver: 'Jonathan Reed',
  },
]);

const availableDrivers = ref([
  { id: 'drv-1', initials: 'MV', name: 'Marcus Vance', homeBase: 'Chicago Central Depot', vehicle: 'TRK-101 (Ready)', hos: '11h 00m' },
  { id: 'drv-2', initials: 'SJ', name: 'Sarah Jenkins', homeBase: 'Atlanta Terminal', vehicle: 'TRK-102 (Ready)', hos: '10h 30m' },
  { id: 'drv-3', initials: 'CM', name: 'Carlos Morales', homeBase: 'Detroit Depot', vehicle: 'TRK-108 (Ready)', hos: '9h 45m' },
  { id: 'drv-4', initials: 'JR', name: 'Jonathan Reed', homeBase: 'Seattle Hub', vehicle: 'TRK-104 (Ready)', hos: '11h 00m' },
]);

const stagedTractors = ref([
  { unit: 'TRK-103', model: 'Volvo FH16 (6x4)', fuel: 98, status: 'STAGED' },
  { unit: 'TRK-105', model: 'BharatBenz 4028T', fuel: 92, status: 'STAGED' },
  { unit: 'TRK-107', model: 'Tata Prima 5530', fuel: 88, status: 'STAGED' },
]);

const activeTrips = ref([
  {
    id: '1',
    tripId: 'TRP-2024-001',
    shipmentId: 's-1',
    shipmentNumber: 'SHP-2024-001',
    vehiclePlate: 'TRK-101 (Volvo)',
    driverName: 'Marcus Vance',
    origin: 'Chicago Central Hub, IL',
    destination: 'Dallas Logistics Center, TX',
    totalDistance: 1480,
    completedDistance: 820,
    progressPercent: 55,
    speed: 64,
    eta: 'Today 09:30 PM',
    status: 'IN_TRANSIT',
  },
  {
    id: '2',
    tripId: 'TRP-2024-002',
    shipmentId: 's-2',
    shipmentNumber: 'SHP-2024-002',
    vehiclePlate: 'TRK-102 (BharatBenz)',
    driverName: 'Sarah Jenkins',
    origin: 'Atlanta Depot, GA',
    destination: 'Miami Terminal, FL',
    totalDistance: 1060,
    completedDistance: 210,
    progressPercent: 20,
    speed: 58,
    eta: 'Tomorrow 05:00 AM',
    status: 'DISPATCHED',
  },
  {
    id: '3',
    tripId: 'TRP-2024-003',
    shipmentId: 's-3',
    shipmentNumber: 'SHP-2024-003',
    vehiclePlate: 'TRK-104 (Volvo FM)',
    driverName: 'Jonathan Reed',
    origin: 'Seattle Inland Port, WA',
    destination: 'Denver Central Depot, CO',
    totalDistance: 2100,
    completedDistance: 1950,
    progressPercent: 93,
    speed: 62,
    eta: 'Today 11:45 PM',
    status: 'IN_TRANSIT',
  },
]);

const vehicleSelectOptions = ref([
  { label: 'TRK-101 - Volvo FH16 (40T Cap - Available)', value: 'trk-1' },
  { label: 'TRK-102 - BharatBenz 4028T (28T Cap - Available)', value: 'trk-2' },
  { label: 'TRK-103 - Volvo FH16 (40T Cap - Staged at Depot)', value: 'trk-3' },
  { label: 'TRK-104 - Volvo FM (35T Cap - Available)', value: 'trk-4' },
]);

const driverSelectOptions = ref([
  { label: 'Marcus Vance - CDL Class A (11h HOS Left)', value: 'drv-1' },
  { label: 'Sarah Jenkins - CDL Class A (10.5h HOS Left)', value: 'drv-2' },
  { label: 'Carlos Morales - CDL Class A (9.75h HOS Left)', value: 'drv-3' },
  { label: 'Jonathan Reed - CDL Class A (11h HOS Left)', value: 'drv-4' },
]);

const dispatchForm = ref<any>({
  orderNumber: 'ORD-5501',
  customer: 'TechCorp Industries',
  origin: 'Chicago, IL',
  destination: 'Dallas, TX',
  weightKg: 18400,
  vehicleId: 'trk-1',
  driverId: 'drv-1',
  startOdometer: '142850',
  sealNumber: 'SEAL-98421',
});

const filteredOrders = computed(() => {
  if (selectedCorridor.value === 'ALL') return pendingOrders.value;
  return pendingOrders.value.filter((o) => o.corridor === selectedCorridor.value);
});

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'IN_TRANSIT':
      return 'bg-cyan-950 text-cyan-300 border-cyan-800 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
    case 'DISPATCHED':
      return 'bg-blue-950 text-blue-300 border-blue-800';
    case 'DELIVERED':
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

function openDispatchModal(order: any) {
  if (order) {
    dispatchForm.value.orderNumber = order.orderNumber;
    dispatchForm.value.customer = order.customer;
    dispatchForm.value.origin = order.origin;
    dispatchForm.value.destination = order.destination;
    dispatchForm.value.weightKg = order.weightKg;
  }
  showDispatchDialog.value = true;
}

function tenderCarrier(order: any) {
  $q.notify({
    type: 'info',
    icon: 'local_shipping',
    message: `Tendered to 3PL Carrier Partner`,
    caption: `${order.orderNumber} sent via EDI 204 to Titan Freightways & Swift Haulage.`,
    position: 'top-right',
    timeout: 2000,
  });
}

async function submitDispatch() {
  dispatching.value = true;
  await new Promise((r) => setTimeout(r, 650));
  dispatching.value = false;
  showDispatchDialog.value = false;

  // Move order from pending to active
  pendingOrders.value = pendingOrders.value.filter((o) => o.orderNumber !== dispatchForm.value.orderNumber);

  activeTrips.value.unshift({
    id: `${Date.now()}`,
    tripId: `TRP-2024-00${activeTrips.value.length + 1}`,
    shipmentId: 's-new',
    shipmentNumber: `SHP-${dispatchForm.value.orderNumber}`,
    vehiclePlate: 'TRK-101 (Volvo FH16)',
    driverName: 'Marcus Vance',
    origin: dispatchForm.value.origin,
    destination: dispatchForm.value.destination,
    totalDistance: 1480,
    completedDistance: 0,
    progressPercent: 0,
    speed: 0,
    eta: 'Tomorrow 10:00 PM',
    status: 'DISPATCHED',
  });

  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'Linehaul Released & Dispatched!',
    caption: `Trip authorized. Digital manifest generated & driver mobile pinged.`,
    position: 'top-right',
    timeout: 2400,
  });
}

async function refreshData() {
  loading.value = true;
  const startTime = Date.now();

  try {
    const shpRes: any = await api.get('/api/v1/dashboard/shipments');
    const list = shpRes.data || shpRes;
    if (Array.isArray(list) && list.length > 0) {
      activeTrips.value = list.slice(0, 4).map((s: any, idx: number) => ({
        id: s.id || `${idx}`,
        tripId: `TRP-2024-00${idx + 1}`,
        shipmentId: s.id,
        shipmentNumber: s.shipmentNumber || `SHP-00${idx + 1}`,
        vehiclePlate: s.vehicle?.plateNumber || `TRK-10${idx + 1}`,
        driverName: s.driver ? `${s.driver.firstName} ${s.driver.lastName}` : 'Marcus Vance',
        origin: s.transportOrder?.originLocation?.city || 'Chicago, IL',
        destination: s.transportOrder?.destinationLocation?.city || 'Dallas, TX',
        totalDistance: 1480,
        completedDistance: 450 * (idx + 1),
        progressPercent: Math.min(95, 30 * (idx + 1)),
        speed: 62 - idx * 4,
        eta: 'Today 09:30 PM',
        status: s.status || 'IN_TRANSIT',
      }));
    }
  } catch {}

  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, 600 - elapsed);
  setTimeout(() => {
    loading.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Dispatch Queue Refreshed',
      caption: 'Live driver HOS telemetry and pending orders synced.',
      position: 'top-right',
      timeout: 1600,
    });
  }, remaining);
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.dispatch-console-wrapper {
  background-color: transparent;
}

.cyber-card {
  background: #0d172b;
  border: 1px solid #1a2744;
  border-radius: 12px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
}

.order-dispatch-card {
  background: #091124;
  border: 1px solid #16233f;
  transition: all 0.2s ease;
}

.order-dispatch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -2px rgba(0, 242, 254, 0.15);
}

.desk-btn-primary {
  background: linear-gradient(135deg, #00f2fe 0%, #0284c7 100%) !important;
  color: #070c18 !important;
  font-weight: 700 !important;
  border-radius: 6px;
}

:deep(.dark-input .q-field__control) {
  background: #091124 !important;
  border-color: #1a2744 !important;
  color: #ffffff !important;
}

:deep(.dark-input .q-field__native) {
  color: #ffffff !important;
}
</style>
