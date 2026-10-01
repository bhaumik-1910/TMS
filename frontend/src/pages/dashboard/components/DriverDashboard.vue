<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Driver Console / Mission Control"
      title="Driver Mission Control"
      subtitle="Unit: TRK-101 (Volvo VNL 860) • Driver: Marcus Vance • Apex Global Logistics"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          DRIVER ONLINE
        </span>
      </template>
      <template #actions>
        <q-btn
          color="positive"
          icon="draw"
          label="Capture Delivery ePOD"
          no-caps
          size="sm"
          class="text-weight-bold"
          @click="openPodDialog"
        />
      </template>
    </AppPageHeader>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Active Assignment"
        value="TRIP #4820"
        icon="local_shipping"
        icon-color="cyan"
        subtitle="Ahmedabad Hub → Mumbai Central DC"
      />
      <AppStatCard
        title="Drive Time Remaining"
        value="8h 45m"
        icon="schedule"
        icon-color="positive"
        subtitle="HOS Limit: 11h Daily"
        change="Compliant"
        :is-positive="true"
      />
      <AppStatCard
        title="Distance Progress"
        value="380 / 540 km"
        icon="straighten"
        icon-color="cyan"
        subtitle="70% Completed • ETA: 08:30 PM"
      />
      <AppStatCard
        title="Pre-Trip Inspection"
        value="PASSED"
        icon="verified"
        icon-color="positive"
        subtitle="14 Checkpoints Verified"
        change="Good"
        :is-positive="true"
      />
    </div>

    <!-- Active Route & Driver Execution Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <!-- Left: Active Route Execution Card -->
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-white">Today's Assigned Route Execution</span>
                <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold" :class="tripStatus === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'">
                  {{ tripStatus }}
                </span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5 font-mono">Consignment: LR-89104 &bull; Seal: #SL-99382 &bull; Temp: Ambient</div>
            </div>
            <div class="flex items-center gap-2">
              <q-btn
                v-if="tripStatus === 'IN_TRANSIT'"
                color="positive"
                icon="check_circle"
                label="Confirm Delivery & Upload POD"
                no-caps
                size="sm"
                class="text-weight-bold"
                @click="podDialogOpen = true"
              />
              <q-btn
                v-else-if="tripStatus === 'ASSIGNED'"
                color="cyan-8"
                text-color="white"
                icon="play_arrow"
                label="Start Linehaul Trip"
                no-caps
                size="sm"
                class="text-weight-bold"
                @click="tripStatus = 'IN_TRANSIT'"
              />
              <span v-else class="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <q-icon name="task_alt" size="16px" />
                Trip Completed
              </span>
            </div>
          </div>

          <!-- Route Progress Bar -->
          <div class="mb-5">
            <div class="flex justify-between text-xs text-slate-300 mb-1">
              <span>Ahmedabad Hub (Origin)</span>
              <span class="text-cyan-4 font-mono font-bold">70% Distance Completed</span>
              <span>Mumbai Central DC (Destination)</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style="width: 70%"></div>
            </div>
          </div>

          <!-- Trip Checkpoints List -->
          <div class="space-y-2">
            <div
              v-for="(cp, idx) in checkpoints"
              :key="idx"
              class="ticket-item p-3 rounded-lg flex items-center justify-between text-xs transition-all"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px]"
                  :class="cp.status === 'DONE' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : cp.status === 'CURRENT' ? 'bg-cyan-950 border border-cyan-800 text-cyan-400' : 'bg-slate-800 text-slate-400'"
                >
                  <q-icon v-if="cp.status === 'DONE'" name="check" size="14px" />
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div>
                  <div class="font-semibold text-white">{{ cp.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ cp.type }} &bull; Target: {{ cp.time }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="font-mono text-cyan-4">{{ cp.recordedTime || 'Pending' }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                  :class="cp.status === 'DONE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : cp.status === 'CURRENT' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'"
                >
                  {{ cp.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Driver Status & Credentials -->
      <div class="lg:col-span-4 space-y-4">
        <!-- Vehicle & License Card -->
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-white mb-3">Vehicle & Driver Profile</div>
          
          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-800">
              <span class="text-slate-400">Assigned Tractor</span>
              <span class="font-mono font-semibold text-white">TRK-101 (2024 Volvo VNL)</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-800">
              <span class="text-slate-400">Trailer Assigned</span>
              <span class="font-mono font-semibold text-white">TRL-5520 (53ft Dry Van)</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-800">
              <span class="text-slate-400">Commercial License</span>
              <span class="font-mono font-semibold text-emerald-400">CDL Class A &bull; Valid</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-800">
              <span class="text-slate-400">DOT Medical Card</span>
              <span class="font-mono font-semibold text-emerald-400">Expires in 184 days</span>
            </div>
            <div class="flex justify-between py-1.5">
              <span class="text-slate-400">Current Odometer</span>
              <span class="font-mono font-semibold text-cyan-4">142,850 km</span>
            </div>
          </div>
        </div>

        <!-- Quick Emergency Contacts -->
        <div class="cyber-card p-4 text-xs">
          <div class="font-semibold text-white mb-2">Operational Assistance</div>
          <div class="space-y-1.5 text-slate-300">
            <div class="flex justify-between">
              <span>Central Dispatch Desk:</span>
              <span class="font-mono font-bold text-cyan-4">+91 (800) 555-0199</span>
            </div>
            <div class="flex justify-between">
              <span>Roadside Breakdown 24/7:</span>
              <span class="font-mono font-bold text-rose-400">+91 (800) 555-9911</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Electronic Proof of Delivery (ePOD) Dialog -->
    <AppSignatureCaptureDialog
      v-model="podDialogOpen"
      title="Electronic Proof of Delivery (ePOD)"
      subtitle="Sign off on cargo condition and handover to consignee"
      @submitted="handlePodSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import AppSignatureCaptureDialog from '../../../components/AppSignatureCaptureDialog.vue';

const $q = useQuasar();

const tripStatus = ref<'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED'>('IN_TRANSIT');
const podDialogOpen = ref(false);

const checkpoints = ref([
  { name: 'Depot Dispatch Inspection', type: 'Pre-Trip Verification', time: '06:00 AM', recordedTime: '05:50 AM', status: 'DONE' },
  { name: 'Shipper Loading Dock (AHD)', type: 'Bill of Lading Signed', time: '08:30 AM', recordedTime: '08:25 AM', status: 'DONE' },
  { name: 'Surat Checkpoint Tollway', type: 'Corridor Transit Milestone', time: '01:30 PM', recordedTime: '01:15 PM', status: 'DONE' },
  { name: 'Vapi Weigh Bridge Inspection', type: 'Axle Weight Verified', time: '04:45 PM', recordedTime: '04:30 PM', status: 'CURRENT' },
  { name: 'Mumbai Central Consignee DC', type: 'Final Delivery & Sign-off', time: '08:30 PM', recordedTime: '', status: 'PENDING' },
]);

function openPodDialog() {
  podDialogOpen.value = true;
}

function handlePodSubmitted() {
  tripStatus.value = 'COMPLETED';
  $q.notify({
    type: 'positive',
    message: 'Delivery Confirmed',
    caption: 'Electronic POD signature stored and shipment closed.',
    position: 'top-right',
  });
}
</script>

<style scoped>
.cyber-card {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.ticket-item {
  background: #111a33;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ticket-item:hover {
  border-color: rgba(0, 242, 254, 0.3);
  background: #14203e;
}
</style>
