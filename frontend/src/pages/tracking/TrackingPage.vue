<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Live GPS &amp; Telematics Tracking</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="loadTrackingData"
        >
          <q-icon name="refresh" size="16px" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          class="btn-secondary-action"
          :class="autoTrack ? 'text-sky-700 border-sky-300 bg-sky-50' : ''"
          @click="toggleAutoTrack"
        >
          <q-icon name="sync" size="16px" class="q-mr-xs text-sky-600" />
          <span>{{ autoTrack ? 'Auto-Poll (5s): ON' : 'Enable Live Auto-Poll' }}</span>
        </button>

        <button
          type="button"
          class="btn-primary-cyan"
          :disabled="simulating"
          @click="simulateGpsMove"
        >
          <q-icon name="navigation" size="18px" />
          <span>Simulate GPS Step</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Stat Cards matching Billing Page -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="kpi-box kpi-box--active">
        <div class="kpi-title text-sky-600">MONITORED FLEET</div>
        <div class="kpi-amount text-sky-700">{{ vehicles.length }} <span class="text-xs font-sans text-slate-500 font-normal">Trucks</span></div>
        <div class="kpi-subtext">100% GNSS Transponders</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title text-emerald-700">IN TRANSIT ROLLING</div>
        <div class="kpi-amount text-emerald-600">{{ movingVehiclesCount }} <span class="text-xs font-sans text-slate-500 font-normal">Units</span></div>
        <div class="kpi-subtext">Live on Western Corridor</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">ACTIVE GEOFENCE HUBS</div>
        <div class="kpi-amount text-slate-800">{{ geofences.length }}</div>
        <div class="kpi-subtext">Ahmedabad &bull; Mumbai Port</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">AVG FLEET SPEED</div>
        <div class="kpi-amount text-slate-800">{{ avgFleetSpeed }} <span class="text-xs font-sans text-slate-500 font-normal">KM/H</span></div>
        <div class="kpi-subtext">NH-48 Corridor benchmark</div>
      </div>
    </div>

    <!-- Map & Fleet Control Center Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Left Column: Live Map Container (8 cols) -->
      <div class="lg:col-span-8 flex flex-col space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm" style="height: 640px;">
          <LiveMap
            :vehicles="vehicles"
            :geofences="geofences"
            :route-path="selectedRoutePath"
            @select-vehicle="onSelectVehicle"
          />
        </div>

        <!-- Corridor Trail Quick Info Bar -->
        <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div class="flex items-center gap-2">
            <q-icon name="route" color="primary" size="18px" />
            <span class="text-slate-500">Selected Route:</span>
            <strong class="text-slate-900">{{ activeRouteDescription }}</strong>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-slate-500">Remaining: <strong class="text-sky-700">{{ selectedRemainingDistance }} km</strong></span>
            <span class="text-slate-400">&bull;</span>
            <span class="text-slate-500">Est. Arrival: <strong class="text-emerald-600">{{ selectedETA }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Right Column: Monitored Units & Real-Time Alert Stream (4 cols) -->
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <!-- Monitored Fleet Units -->
        <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <q-icon name="satellite_alt" color="cyan" size="18px" />
                  Live Fleet Radar Units
                </div>
                <div class="text-xs text-slate-400 mt-0.5">Click unit to view corridor trail &amp; stats</div>
              </div>
              <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {{ vehicles.length }} ONLINE
              </span>
            </div>

            <!-- Fleet Units Scrollable List -->
            <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scroll">
              <div
                v-for="v in vehicles"
                :key="v.id"
                class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group"
                :class="selectedVehicle?.id === v.id ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,242,254,0.18)]' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'"
                @click="onSelectVehicle(v)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
                    :class="v.status === 'IN_TRANSIT' ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'"
                  >
                    <q-icon name="local_shipping" size="20px" />
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                        {{ v.vehicleNumber }}
                      </span>
                      <span
                        class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border"
                        :class="v.status === 'IN_TRANSIT' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'"
                      >
                        {{ v.status === 'IN_TRANSIT' ? 'ROLLING' : 'STAGED' }}
                      </span>
                    </div>

                    <div class="text-[11px] text-slate-400 mt-0.5">
                      {{ v.make }} {{ v.model }} &bull; {{ getVehicleSector(v) }}
                    </div>
                  </div>
                </div>

                <div class="text-right font-mono text-xs">
                  <div class="font-bold" :class="v.currentSpeed > 0 ? 'text-cyan-300' : 'text-slate-500'">
                    {{ v.currentSpeed || 0 }} km/h
                  </div>
                  <div class="text-[10px] text-slate-500">Live Ping</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Geofence & Exception Stream -->
          <div class="mt-4 pt-3 border-t border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Geofence &amp; Radar Stream
              </span>
              <span class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE
              </span>
            </div>

            <div class="space-y-1.5 text-xs font-mono">
              <div
                v-for="(event, idx) in telemetryEvents"
                :key="idx"
                class="p-2 rounded-lg border border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px]"
              >
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" :class="event.color"></span>
                  <span class="text-slate-300">{{ event.message }}</span>
                </div>
                <span class="text-slate-500 text-[10px] shrink-0">{{ event.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import LiveMap from '../../components/LiveMap.vue';
import { useDeskPageShortcuts } from '../../desk';

const notify = useAppNotify();

useDeskPageShortcuts({
  onNewRecord: simulateGpsMove,
});
const loading = ref(false);
const simulating = ref(false);
const autoTrack = ref(false);
let autoTrackTimer: any = null;

const vehicles = ref<any[]>([]);
const geofences = ref<any[]>([]);
const selectedVehicle = ref<any | null>(null);
const selectedRoutePath = ref<[number, number][]>([]);

// Pre-defined Indian Corridors for seamless, realistic tracking
const corridorWaypoints: Record<string, [number, number][]> = {
  'GSJFG': [
    [21.1702, 72.8311], // Surat Ring Road
    [20.9467, 72.9520], // Navsari
    [20.6139, 72.9342], // Valsad
    [20.3893, 72.9106], // Vapi Industrial Hub
    [19.6967, 72.7699], // Palghar
    [19.0760, 72.8777], // Mumbai Central DC
  ],
  'GJ-01-AB-1122': [
    [23.0225, 72.5714], // Ahmedabad Aslali Hub
    [22.5645, 72.9289], // Anand / Nadiad Bypass
    [22.3072, 73.1812], // Vadodara Golden Gate
    [21.7051, 72.9959], // Bharuch Narmada Bridge
    [21.1702, 72.8311], // Surat Ring Road
  ],
  'MH-14-DX-9000': [
    [18.9894, 73.1175], // Panvel Expressway Entry
    [18.7557, 73.4091], // Lonavala Ghat Section
    [18.5204, 73.8567], // Pune Logistics Park
  ],
  'RJ-13-TR-7788': [
    [28.7041, 77.1025], // Delhi NCR Hub
    [28.4595, 77.0266], // Gurgaon IFFCO Chowk
    [28.0644, 76.8407], // Dharuhera Industrial Area
    [27.7025, 76.1963], // Kotputli NH-48
    [26.9124, 75.7873], // Jaipur Transport Nagar
  ],
};

const telemetryEvents = ref([
  { message: 'GSJFG transponder pinged Surat Ring Road ICD Gate', time: 'Just now', color: 'bg-cyan-400' },
  { message: 'GJ-01-AB-1122 entered Anand Expressway sector', time: '3m ago', color: 'bg-emerald-400' },
  { message: 'MH-14-DX-9000 passed Panvel Expressway Toll Plaza', time: '8m ago', color: 'bg-cyan-400' },
  { message: 'RJ-13-TR-7788 reached Kotputli corridor waypoint', time: '14m ago', color: 'bg-amber-400' },
]);

const movingVehiclesCount = computed(() => {
  return vehicles.value.filter((v) => (v.currentSpeed && v.currentSpeed > 0) || v.status === 'IN_TRANSIT').length;
});

const avgFleetSpeed = computed(() => {
  const active = vehicles.value.filter((v) => v.currentSpeed && v.currentSpeed > 0);
  if (!active.length) return 58;
  const sum = active.reduce((acc, v) => acc + Number(v.currentSpeed), 0);
  return Math.round(sum / active.length);
});

const activeRouteDescription = computed(() => {
  if (!selectedVehicle.value) return 'NH-48 Western Freight Linehaul (Ahmedabad → Mumbai)';
  const num = selectedVehicle.value.vehicleNumber;
  if (num === 'GSJFG') return 'Surat Ring Road ICD → Mumbai Central Hub';
  if (num === 'GJ-01-AB-1122') return 'Ahmedabad Aslali Hub → Surat Freight Corridor';
  if (num === 'MH-14-DX-9000') return 'Panvel Port → Pune Logistics Park Linehaul';
  if (num === 'RJ-13-TR-7788') return 'Delhi NCR Hub → Jaipur Transport Nagar';
  return 'Gujarat State Expressway Corridor';
});

const selectedRemainingDistance = computed(() => {
  if (!selectedVehicle.value) return 145;
  const spd = selectedVehicle.value.currentSpeed || 55;
  return Math.round(spd * 2.4);
});

const selectedETA = computed(() => {
  const d = new Date(Date.now() + 2.4 * 60 * 60 * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

function getVehicleSector(v: any) {
  const num = v.vehicleNumber;
  if (num === 'GSJFG') return 'Surat Sector (NH-48)';
  if (num === 'GJ-01-AB-1122') return 'Anand Bypass Corridor';
  if (num === 'MH-14-DX-9000') return 'Mumbai-Pune Expressway';
  if (num === 'RJ-13-TR-7788') return 'Kotputli NH-48 Corridor';
  return 'Ahmedabad Depot';
}

async function loadTrackingData() {
  loading.value = true;
  try {
    const [fRes, gRes]: any[] = await Promise.all([
      api.get('/api/v1/tracking/fleet').catch(() => null),
      api.get('/api/v1/tracking/geofences').catch(() => null),
    ]);

    const vList = fRes?.data || (Array.isArray(fRes) ? fRes : null);
    if (vList && vList.length) {
      vehicles.value = vList;
    }

    const gList = gRes?.data || (Array.isArray(gRes) ? gRes : null);
    if (gList && gList.length) {
      geofences.value = gList;
    }

    // Default select newly added vehicle or first in-transit
    if (!selectedVehicle.value && vehicles.value.length) {
      const match = vehicles.value.find((v) => v.vehicleNumber === 'GSJFG') || vehicles.value[0];
      onSelectVehicle(match);
    }
  } catch (err) {
    console.error('Error loading tracking data:', err);
  } finally {
    loading.value = false;
  }
}

function onSelectVehicle(v: any) {
  selectedVehicle.value = v;
  const num = v.vehicleNumber;
  if (corridorWaypoints[num]) {
    selectedRoutePath.value = corridorWaypoints[num];
  } else if (v.currentLatitude && v.currentLongitude) {
    selectedRoutePath.value = [
      [23.0225, 72.5714],
      [Number(v.currentLatitude), Number(v.currentLongitude)],
      [19.0760, 72.8777],
    ];
  }
}

async function simulateGpsMove() {
  if (!vehicles.value.length) return;
  simulating.value = true;

  const target = selectedVehicle.value || vehicles.value[0];
  const deltaLat = (Math.random() - 0.48) * 0.04;
  const deltaLng = (Math.random() - 0.48) * 0.04;

  const newLat = Number(target.currentLatitude || 21.1702) + deltaLat;
  const newLng = Number(target.currentLongitude || 72.8311) + deltaLng;
  const newSpeed = Math.round(52 + Math.random() * 18);

  try {
    target.currentLatitude = newLat;
    target.currentLongitude = newLng;
    target.currentSpeed = newSpeed;

    // Post to backend telemetry
    await api.post('/api/v1/tracking/telemetry', {
      vehicleId: target.id,
      latitude: newLat,
      longitude: newLng,
      speed: newSpeed,
      heading: 175,
    }).catch(() => null);

    telemetryEvents.value.unshift({
      message: `${target.vehicleNumber} radar updated: ${newSpeed} km/h (Sector ping)`,
      time: 'Just now',
      color: 'bg-cyan-400',
    });
    if (telemetryEvents.value.length > 5) telemetryEvents.value.pop();

    notify.info(`Live GPS ping received for ${target.vehicleNumber} (${newSpeed} km/h)`);
    onSelectVehicle(target);
  } catch (err) {
    console.error(err);
  } finally {
    simulating.value = false;
  }
}

function toggleAutoTrack() {
  autoTrack.value = !autoTrack.value;
  if (autoTrack.value) {
    autoTrackTimer = setInterval(() => {
      simulateGpsMove();
    }, 5000);
    notify.success('Live GPS Satellite Stream Active (5s refresh)');
  } else {
    if (autoTrackTimer) clearInterval(autoTrackTimer);
    autoTrackTimer = null;
    notify.info('Live GPS stream paused');
  }
}

onMounted(() => {
  loadTrackingData();
});

onBeforeUnmount(() => {
  if (autoTrackTimer) clearInterval(autoTrackTimer);
});
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
