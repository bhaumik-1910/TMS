<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Fleet & Asset Management / Telematics Overview"
      title="Fleet Assets & Vehicle Telematics"
      subtitle="Vehicle health monitoring, preventative maintenance schedules, and driver roster compliance"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
          <q-icon name="directions_car" size="14px" />
          FLEET OPERATIONS
        </span>
      </template>
      <template #actions>
        <q-btn
          color="cyan-8"
          text-color="white"
          icon="add"
          label="Add Vehicle Unit"
          no-caps
          size="sm"
          class="text-weight-bold"
          to="/fleet"
        />
      </template>
    </AppPageHeader>

    <!-- Fleet KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Total Fleet Size"
        value="24 Vehicles"
        icon="directions_car"
        icon-color="cyan"
        subtitle="16 Heavy Tractors • 8 Medium Vans"
      />
      <AppStatCard
        title="Active on Road"
        value="18 Units"
        icon="local_shipping"
        icon-color="positive"
        change="75% Utilized"
        :is-positive="true"
        subtitle="Currently in linehaul transit"
      />
      <AppStatCard
        title="Idle / Available"
        value="4 Units"
        icon="check_circle"
        icon-color="positive"
        subtitle="Staged at regional depots"
      />
      <AppStatCard
        title="In Maintenance"
        value="2 Units"
        icon="build"
        icon-color="warning"
        subtitle="Scheduled preventative service"
      />
    </div>

    <!-- Fleet Health & Driver Rosters Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <!-- Active Fleet Status Overview -->
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div class="text-base font-bold text-white">Vehicle Telemetry & Inspection Health</div>
              <div class="text-xs text-slate-400">Live GPS tracking status, fuel levels, and odometer alerts</div>
            </div>
            <q-btn flat dense no-caps size="sm" color="cyan" label="Open Fleet Assets →" to="/fleet" />
          </div>

          <div class="space-y-3">
            <div
              v-for="unit in vehicles"
              :key="unit.id"
              class="ticket-item p-3 rounded-lg flex items-center justify-between transition-all"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                  <q-icon name="local_shipping" size="20px" />
                </div>
                <div>
                  <div class="font-bold text-sm text-white font-mono">{{ unit.code }} &bull; {{ unit.model }}</div>
                  <div class="text-xs text-slate-400">Assigned Driver: <span class="text-slate-200">{{ unit.driver }}</span> &bull; Fuel: <span class="text-cyan-3 font-mono">{{ unit.fuel }}</span></div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-xs font-mono font-semibold text-slate-300">{{ unit.odometer }}</div>
                  <div class="text-[11px] text-slate-400">{{ unit.location }}</div>
                </div>
                <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold" :class="unit.status === 'IN_TRANSIT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'">
                  {{ unit.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Maintenance & Compliance Alerts -->
      <div class="lg:col-span-4 space-y-4">
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-white mb-3">Service & Inspection Alerts</div>
          
          <div class="space-y-3 text-xs">
            <div class="p-3 rounded border border-amber-800/80 bg-amber-950/40">
              <div class="font-semibold text-amber-300">Unit TRK-106 &bull; Oil Service Due</div>
              <div class="text-amber-200/80 mt-0.5">Odometer: 149,820 km (180 km remaining until scheduled B-service)</div>
            </div>

            <div class="p-3 rounded border border-cyan-800/80 bg-cyan-950/40">
              <div class="font-semibold text-cyan-300">Annual DOT Inspection Required</div>
              <div class="text-cyan-200/80 mt-0.5">Unit TRK-102 inspection certificate expires in 12 days.</div>
            </div>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="grid grid-cols-2 gap-3">
          <div class="quick-nav-btn p-3 rounded-lg text-center cursor-pointer" @click="$router.push('/drivers')">
            <q-icon name="badge" color="cyan" size="24px" />
            <div class="text-xs font-bold text-white mt-1">Drivers Roster</div>
          </div>
          <div class="quick-nav-btn p-3 rounded-lg text-center cursor-pointer" @click="$router.push('/tracking')">
            <q-icon name="my_location" color="cyan" size="24px" />
            <div class="text-xs font-bold text-white mt-1">GPS Telematics</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';

const vehicles = ref([
  { id: '1', code: 'TRK-101', model: '2024 Volvo VNL 860', driver: 'Marcus Vance', fuel: '82%', odometer: '142,850 km', location: 'Chicago, IL', status: 'IN_TRANSIT' },
  { id: '2', code: 'TRK-102', model: '2023 Freightliner Cascadia', driver: 'Sarah Jenkins', fuel: '64%', odometer: '188,400 km', location: 'Atlanta, GA', status: 'IN_TRANSIT' },
  { id: '3', code: 'TRK-103', model: '2024 Peterbilt 579', driver: 'Carlos Morales', fuel: '95%', odometer: '89,200 km', location: 'Dallas, TX', status: 'AVAILABLE' },
  { id: '4', code: 'TRK-104', model: '2022 Kenworth T680', driver: 'Johnathan Reed', fuel: '40%', odometer: '210,500 km', location: 'Denver, CO', status: 'IN_TRANSIT' },
]);
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

.quick-nav-btn {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.quick-nav-btn:hover {
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.08);
}
</style>
