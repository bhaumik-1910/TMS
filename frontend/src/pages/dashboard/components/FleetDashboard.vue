<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Fleet & Asset Management / Telematics Overview"
      title="Fleet Assets & Vehicle Telematics"
      subtitle="Vehicle health monitoring, preventative maintenance schedules, and driver roster compliance"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
          <q-icon name="directions_car" size="14px" />
          FLEET OPERATIONS
        </span>
      </template>
      <template #actions>
        <q-btn
          color="primary"
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
        icon-color="primary"
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
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <div class="text-base font-bold text-slate-900">Vehicle Telemetry & Inspection Health</div>
              <div class="text-xs text-slate-500">Live GPS tracking status, fuel levels, and odometer alerts</div>
            </div>
            <q-btn flat dense no-caps size="sm" color="primary" label="Open Fleet Assets →" to="/fleet" />
          </div>

          <div class="space-y-3">
            <div
              v-for="unit in vehicles"
              :key="unit.id"
              class="ticket-item p-3 rounded-lg flex items-center justify-between bg-white"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <q-icon name="local_shipping" size="20px" />
                </div>
                <div>
                  <div class="font-bold text-sm text-slate-900 font-mono">{{ unit.code }} &bull; {{ unit.model }}</div>
                  <div class="text-xs text-slate-500">Assigned Driver: <span class="text-slate-800 font-semibold">{{ unit.driver }}</span> &bull; Fuel: <span class="text-sky-700 font-mono font-bold">{{ unit.fuel }}</span></div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-xs font-mono font-semibold text-slate-700">{{ unit.odometer }}</div>
                  <div class="text-[11px] text-slate-500">{{ unit.location }}</div>
                </div>
                <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold" :class="unit.status === 'IN_TRANSIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold' : 'bg-sky-50 text-sky-700 border border-sky-300 font-bold'">
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
          <div class="text-sm font-semibold text-slate-900 mb-3">Service & Inspection Alerts</div>
          
          <div class="space-y-3 text-xs">
            <div class="p-3 rounded border border-amber-200 bg-amber-50">
              <div class="font-semibold text-amber-800 font-bold">Unit TRK-106 &bull; Oil Service Due</div>
              <div class="text-amber-700 mt-0.5">Odometer: 149,820 km (180 km remaining until scheduled B-service)</div>
            </div>

            <div class="p-3 rounded border border-sky-200 bg-sky-50">
              <div class="font-semibold text-sky-800 font-bold">Annual DOT Inspection Required</div>
              <div class="text-sky-700 mt-0.5">Unit TRK-102 inspection certificate expires in 12 days.</div>
            </div>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="grid grid-cols-2 gap-3">
          <div class="quick-nav-btn p-3 rounded-lg text-center cursor-pointer bg-white" @click="$router.push('/drivers')">
            <q-icon name="badge" color="primary" size="24px" />
            <div class="text-xs font-bold text-slate-900 mt-1">Drivers Roster</div>
          </div>
          <div class="quick-nav-btn p-3 rounded-lg text-center cursor-pointer bg-white" @click="$router.push('/tracking')">
            <q-icon name="my_location" color="primary" size="24px" />
            <div class="text-xs font-bold text-slate-900 mt-1">GPS Telematics</div>
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
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ticket-item {
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.ticket-item:hover {
  border-color: #0284c7;
  background: #ffffff;
}

.quick-nav-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.quick-nav-btn:hover {
  border-color: #0284c7;
  background: #ffffff;
}
</style>
