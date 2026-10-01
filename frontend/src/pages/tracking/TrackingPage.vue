<template>
  <q-page>
    <AppPageHeader
      breadcrumb="Operations / Live Telematics"
      title="Real-Time Telemetry & Fleet Tracking"
      subtitle="WebSocket-powered live GPS updates, dynamic ETA computation, and geofence monitoring"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" size="sm" @click="loadTrackingData" :loading="loading" class="q-mr-xs">
          <q-tooltip>Refresh Telemetry</q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          icon="play_arrow"
          label="Simulate GPS Step"
          size="sm"
          no-caps
          class="text-weight-bold"
          @click="simulateGpsMove"
          :loading="simulating"
        />
      </template>
    </AppPageHeader>

    <!-- Top Telemetry Summary Badges -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-4">
        <div class="tms-card q-pa-sm row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-badge color="positive" rounded />
            <span class="text-caption text-weight-bold">Live GPS Telemetry</span>
          </div>
          <span class="text-caption font-mono text-grey-7">WebSockets Active</span>
        </div>
      </div>
      <div class="col-12 col-sm-4">
        <div class="tms-card q-pa-sm row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="fence" color="primary" size="18px" />
            <span class="text-caption text-weight-bold">Active Geofences</span>
          </div>
          <span class="text-caption font-mono text-grey-7">{{ geofences.length }} Hub Boundaries</span>
        </div>
      </div>
      <div class="col-12 col-sm-4">
        <div class="tms-card q-pa-sm row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="speed" color="warning" size="18px" />
            <span class="text-caption text-weight-bold">Fleet In Transit</span>
          </div>
          <span class="text-caption font-mono text-grey-7">{{ movingVehiclesCount }} Units Rolling</span>
        </div>
      </div>
    </div>

    <!-- Map & Side Feed Split -->
    <div class="row q-col-gutter-md">
      <!-- Left: Interactive Leaflet Map -->
      <div class="col-12 col-lg-8">
        <div class="tms-card" style="height: 620px;">
          <LiveMap
            :vehicles="vehicles"
            :geofences="geofences"
            :route-path="selectedRoutePath"
            @select-vehicle="onSelectVehicle"
          />
        </div>
      </div>

      <!-- Right: Active Fleet Units & Geofence Event Log -->
      <div class="col-12 col-lg-4">
        <div class="tms-card q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle2 text-weight-bold text-slate-900 q-mb-xs">
              Monitored Fleet Units
            </div>
            <div class="text-caption text-grey-6 q-mb-sm">
              Click unit to inspect live route trail & telemetry
            </div>

            <q-list separator>
              <q-item
                v-for="v in vehicles"
                :key="v.id"
                clickable
                class="rounded-borders q-pa-xs q-mb-xs"
                :class="selectedVehicle?.id === v.id ? 'bg-blue-1' : ''"
                style="border: 1px solid #e2e8f0;"
                @click="onSelectVehicle(v)"
              >
                <q-item-section avatar style="min-width: 36px;">
                  <div
                    class="flex flex-center rounded-borders"
                    :style="{
                      width: '30px',
                      height: '30px',
                      background: v.status === 'IN_TRANSIT' ? '#dbeafe' : '#f1f5f9',
                    }"
                  >
                    <q-icon
                      name="local_shipping"
                      :color="v.status === 'IN_TRANSIT' ? 'primary' : 'grey-7'"
                      size="18px"
                    />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold font-mono">{{ v.vehicleNumber }}</q-item-label>
                  <q-item-label caption>{{ v.make }} {{ v.model }} • {{ v.status }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-right">
                    <span class="font-mono text-weight-bold">{{ v.currentSpeed || 0 }} km/h</span>
                    <div class="text-caption text-grey-6" style="font-size: 0.65rem;">Last ping just now</div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Geofence & Delay Alert Feed -->
          <div class="q-mt-md q-pt-md" style="border-top: 1px solid #e2e8f0;">
            <div class="text-caption text-weight-bold text-slate-800 text-uppercase q-mb-xs">
              Geofence & Exception Stream
            </div>
            <div class="column q-gutter-y-xs text-caption">
              <div class="q-pa-xs bg-green-1 text-green-9 rounded-borders row items-center justify-between">
                <span>TRK-101 entered Chicago Hub</span>
                <span class="font-mono text-grey-7" style="font-size: 0.7rem;">08:15 AM</span>
              </div>
              <div class="q-pa-xs bg-blue-1 text-blue-9 rounded-borders row items-center justify-between">
                <span>TRK-102 dispatched on I-55 South</span>
                <span class="font-mono text-grey-7" style="font-size: 0.7rem;">08:22 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import AppPageHeader from '../../components/AppPageHeader.vue';
import LiveMap from '../../components/LiveMap.vue';

const notify = useAppNotify();
const loading = ref(false);
const simulating = ref(false);

const vehicles = ref<any[]>([]);
const geofences = ref<any[]>([]);
const selectedVehicle = ref<any | null>(null);
const selectedRoutePath = ref<[number, number][]>([]);

const movingVehiclesCount = computed(() => {
  return vehicles.value.filter((v) => v.status === 'IN_TRANSIT').length;
});

async function loadTrackingData() {
  loading.value = true;
  try {
    const [fRes, gRes]: any[] = await Promise.all([
      api.get('/api/v1/tracking/fleet'),
      api.get('/api/v1/tracking/geofences'),
    ]);
    vehicles.value = fRes.data || fRes || [];
    geofences.value = gRes.data || gRes || [];

    if (vehicles.value[0]) {
      onSelectVehicle(vehicles.value[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function onSelectVehicle(v: any) {
  selectedVehicle.value = v;
  // Build sample corridor route from origin to current to dest
  if (v.currentLatitude && v.currentLongitude) {
    selectedRoutePath.value = [
      [41.8615, -87.6853], // Chicago Hub
      [40.20, -89.40],
      [38.62, -90.19],
      [v.currentLatitude, v.currentLongitude],
      [32.7767, -96.7970], // Dallas Terminal
    ];
  }
}

async function simulateGpsMove() {
  if (!vehicles.value.length) return;
  simulating.value = true;

  const targetVehicle = vehicles.value.find((v) => v.status === 'IN_TRANSIT') || vehicles.value[0];
  const deltaLat = (Math.random() - 0.5) * 0.15;
  const deltaLng = (Math.random() - 0.5) * 0.15;

  const newLat = (targetVehicle.currentLatitude || 37.5) + deltaLat;
  const newLng = (targetVehicle.currentLongitude || -91.2) + deltaLng;
  const speed = Math.round(55 + Math.random() * 20);

  try {
    // If vehicle has shipment, record telemetry
    const shipmentId = targetVehicle.shipments?.[0]?.id;
    if (shipmentId) {
      await api.post('/api/v1/tracking/telemetry', {
        shipmentId,
        vehicleId: targetVehicle.id,
        latitude: newLat,
        longitude: newLng,
        speed,
        heading: 215,
      });
    }

    targetVehicle.currentLatitude = newLat;
    targetVehicle.currentLongitude = newLng;
    targetVehicle.currentSpeed = speed;

    notify.info(`GPS telemetry updated for ${targetVehicle.vehicleNumber} (${speed} km/h). Telemetry broadcasted.`);
    onSelectVehicle(targetVehicle);
  } catch (err) {
    console.error(err);
  } finally {
    simulating.value = false;
  }
}

onMounted(() => {
  loadTrackingData();
});
</script>
