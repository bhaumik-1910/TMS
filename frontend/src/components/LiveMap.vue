<template>
  <div class="relative-position full-width full-height" style="min-height: 380px; border-radius: var(--tms-radius-md); overflow: hidden; background: #e2e8f0;">
    <!-- Leaflet Map Container -->
    <div ref="mapContainer" class="full-width full-height" style="min-height: 380px; z-index: 1;"></div>

    <!-- Map Floating Telemetry Overlay (Sleek, minimal, modern) -->
    <transition name="fade">
      <div
        v-if="selectedVehicle"
        class="absolute-top-right q-ma-md tms-card q-pa-sm"
        style="z-index: 1000; width: 280px; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border: 1px solid var(--tms-border); box-shadow: var(--tms-shadow-dropdown);"
      >
        <div class="row items-center justify-between no-wrap q-mb-xs">
          <div class="row items-center q-gutter-x-xs">
            <q-badge color="primary" rounded />
            <span class="text-subtitle2 text-weight-bold text-slate-900 font-mono">
              {{ selectedVehicle.vehicleNumber }}
            </span>
          </div>
          <q-btn icon="close" flat round dense size="xs" color="grey-6" @click="selectedVehicle = null" />
        </div>
        <div class="text-caption text-grey-6 q-mb-xs" style="font-size: 0.72rem;">
          {{ selectedVehicle.make }} {{ selectedVehicle.model }} • {{ selectedVehicle.vehicleType?.name || 'Heavy Semi' }}
        </div>
        <div class="column q-gutter-y-xs text-caption" style="font-size: 0.75rem;">
          <div class="row justify-between">
            <span class="text-grey-6">Speed:</span>
            <span class="text-weight-bold font-mono text-slate-800">{{ selectedVehicle.currentSpeed || 0 }} km/h</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-6">GPS Coordinates:</span>
            <span class="font-mono text-grey-7" style="font-size: 0.7rem;">{{ selectedVehicle.currentLatitude?.toFixed(4) }}, {{ selectedVehicle.currentLongitude?.toFixed(4) }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-6">Fleet Status:</span>
            <span class="text-weight-bold" :class="selectedVehicle.status === 'IN_TRANSIT' ? 'text-primary' : 'text-positive'">
              {{ selectedVehicle.status }}
            </span>
          </div>
          <div v-if="selectedVehicle.shipments?.[0]" class="q-mt-xs q-pt-xs" style="border-top: 1px dashed var(--tms-border);">
            <div class="text-grey-6" style="font-size: 0.7rem;">Active Shipment:</div>
            <div class="text-weight-bold font-mono text-primary" style="font-size: 0.75rem;">
              {{ selectedVehicle.shipments[0].shipmentNumber }}
            </div>
            <div class="text-grey-7" style="font-size: 0.7rem;">
              {{ selectedVehicle.shipments[0].transportOrder?.originLocation?.city }} → {{ selectedVehicle.shipments[0].transportOrder?.destinationLocation?.city }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Map Controls Bar (Bottom Left Overlay) -->
    <div
      class="absolute-bottom-left q-ma-sm row items-center q-gutter-x-xs q-px-sm q-py-xs bg-white rounded-borders"
      style="z-index: 1000; border: 1px solid var(--tms-border); box-shadow: var(--tms-shadow-1);"
    >
      <span class="text-caption text-grey-6 font-mono" style="font-size: 0.7rem;">OpenStreetMap Live Freight Radar</span>
      <q-separator vertical class="q-mx-xs" />
      <span class="text-caption text-weight-medium text-slate-800 font-mono" style="font-size: 0.7rem;">
        {{ (props.vehicles || []).length }} Connected GPS
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import L from 'leaflet';

const props = defineProps<{
  vehicles?: any[];
  routePath?: [number, number][];
  geofences?: any[];
  center?: [number, number];
  zoom?: number;
}>();

const emit = defineEmits(['select-vehicle']);

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let routePolyline: L.Polyline | null = null;
let geofenceLayer: L.LayerGroup | null = null;

const selectedVehicle = ref<any | null>(null);

// Sleek minimal truck icon generator (28px circle with white glyph)
function createTruckIcon(color: string = '#2563eb') {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
        <svg style="width: 14px; height: 14px; fill: white;" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function initMap() {
  if (!mapContainer.value) return;

  const defaultCenter = props.center || [39.8283, -98.5795]; // Center of USA
  const defaultZoom = props.zoom || 5;

  try {
    map = L.map(mapContainer.value, {
      zoomControl: false,
    }).setView(defaultCenter, defaultZoom);

    // Add compact zoom control to top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    geofenceLayer = L.layerGroup().addTo(map);

    renderGeofences();
    renderVehicles();
    renderRoute();
  } catch (err) {
    console.warn('Map initialization note:', err);
  }
}

function renderGeofences() {
  if (!geofenceLayer || !props.geofences) return;
  geofenceLayer.clearLayers();

  props.geofences.forEach((gf) => {
    L.circle([gf.latitude, gf.longitude], {
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      weight: 1.5,
      radius: gf.radius || 1200,
      dashArray: '3, 3',
    })
      .bindTooltip(`<b>${gf.name}</b><br>Radius: ${gf.radius}m`, { direction: 'top' })
      .addTo(geofenceLayer!);
  });
}

function renderVehicles() {
  if (!markersLayer || !props.vehicles) return;
  markersLayer.clearLayers();

  props.vehicles.forEach((v) => {
    if (!v.currentLatitude || !v.currentLongitude) return;

    const isMoving = v.status === 'IN_TRANSIT';
    const markerColor = isMoving ? '#2563eb' : v.status === 'AVAILABLE' ? '#16a34a' : '#d97706';
    const marker = L.marker([v.currentLatitude, v.currentLongitude], {
      icon: createTruckIcon(markerColor),
    });

    marker.bindTooltip(
      `<b>${v.vehicleNumber}</b><br>${v.status} • ${v.currentSpeed || 0} km/h`,
      { direction: 'top', offset: [0, -8] },
    );

    marker.on('click', () => {
      selectedVehicle.value = v;
      emit('select-vehicle', v);
    });

    markersLayer!.addLayer(marker);
  });
}

function renderRoute() {
  if (!map) return;
  if (routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }

  if (props.routePath && props.routePath.length > 1) {
    routePolyline = L.polyline(props.routePath, {
      color: '#0f172a',
      weight: 3,
      opacity: 0.85,
      dashArray: '4, 4',
    }).addTo(map);

    map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
  }
}

watch(() => props.vehicles, () => renderVehicles(), { deep: true });
watch(() => props.geofences, () => renderGeofences(), { deep: true });
watch(() => props.routePath, () => renderRoute(), { deep: true });

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});
</script>
