<template>
  <div class="relative-position full-width full-height" style="min-height: 520px; border-radius: 16px; overflow: hidden; background: #070c18; border: 1px solid rgba(0, 242, 254, 0.25); box-shadow: 0 0 25px rgba(0, 242, 254, 0.08);">
    <!-- Leaflet Map Container -->
    <div ref="mapContainer" class="full-width full-height" style="min-height: 520px; z-index: 1;"></div>

    <!-- Map Floating Telemetry HUD (Dark Cyber Command Theme) -->
    <transition name="fade">
      <div
        v-if="selectedVehicle"
        class="absolute-top-right q-ma-md p-3.5 rounded-xl text-white font-sans"
        style="z-index: 1000; width: 310px; background: rgba(11, 19, 41, 0.94); backdrop-filter: blur(14px); border: 1px solid rgba(0, 242, 254, 0.35); box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);"
      >
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]"></span>
            <span class="font-mono font-bold text-sm text-cyan-300 tracking-wider">
              {{ selectedVehicle.vehicleNumber }}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {{ selectedVehicle.status || 'ONLINE' }}
            </span>
          </div>
          <q-btn icon="close" flat round dense size="xs" color="grey-5" @click="selectedVehicle = null" />
        </div>

        <div class="text-xs text-slate-300 mb-2 font-medium">
          {{ selectedVehicle.make }} {{ selectedVehicle.model }} &bull; {{ selectedVehicle.vehicleTypeStr || selectedVehicle.vehicleType?.name || 'Heavy Commercial' }}
        </div>

        <div class="space-y-1.5 text-xs font-mono">
          <div class="flex justify-between items-center py-1 px-2 rounded bg-slate-950/70 border border-slate-800">
            <span class="text-slate-400">Telemetry Speed:</span>
            <strong class="text-cyan-300 text-sm font-bold">{{ selectedVehicle.currentSpeed || 0 }} km/h</strong>
          </div>

          <div class="flex justify-between items-center py-1 px-2 rounded bg-slate-950/70 border border-slate-800">
            <span class="text-slate-400">GPS Ping:</span>
            <span class="text-slate-200 text-[11px]">
              {{ Number(selectedVehicle.currentLatitude || 22.5645).toFixed(4) }}° N, {{ Number(selectedVehicle.currentLongitude || 72.9289).toFixed(4) }}° E
            </span>
          </div>

          <div class="flex justify-between items-center py-1 px-2 rounded bg-slate-950/70 border border-slate-800">
            <span class="text-slate-400">Corridor Sector:</span>
            <span class="text-emerald-400 font-bold">Western Freight NH-48</span>
          </div>

          <div class="flex justify-between items-center py-1 px-2 rounded bg-slate-950/70 border border-slate-800">
            <span class="text-slate-400">Assigned Driver:</span>
            <span class="text-white font-medium">Ramesh Kumar (DRV-401)</span>
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-mono">Signal: 5G GNSS Lock</span>
          <q-btn
            dense
            no-caps
            size="xs"
            color="cyan"
            flat
            icon="my_location"
            label="Center Camera"
            @click="focusVehicle(selectedVehicle)"
          />
        </div>
      </div>
    </transition>

    <!-- Map Radar Stats Bar (Bottom Left Overlay) -->
    <div
      class="absolute-bottom-left q-ma-sm px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-xs text-white"
      style="z-index: 1000; background: rgba(7, 12, 24, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(0, 242, 254, 0.3);"
    >
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span class="text-cyan-300 font-bold">Gati Shakti Radar v4.2</span>
      <span class="text-slate-600">&bull;</span>
      <span class="text-slate-300">{{ (props.vehicles || []).length }} Live Units Streamed</span>
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

// Glowing cyber truck icon generator (32px circle with cyan glow)
function createTruckIcon(color: string = '#00f2fe', isMoving: boolean = true) {
  const pulseAnim = isMoving ? 'animation: pulse 2s infinite;' : '';
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color}, 0 2px 6px rgba(0,0,0,0.6); border: 2px solid #070c18; ${pulseAnim}">
        <svg style="width: 15px; height: 15px; fill: #070c18;" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function initMap() {
  if (!mapContainer.value) return;

  // Center on Gujarat & Western Freight Corridor of India by default
  const defaultCenter = props.center || [22.2587, 72.8000];
  const defaultZoom = props.zoom || 7;

  try {
    map = L.map(mapContainer.value, {
      zoomControl: false,
    }).setView(defaultCenter, defaultZoom);

    // Zoom control top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // CartoDB Dark Matter tiles (sleek futuristic command center)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB &copy; OpenStreetMap',
      subdomains: 'abcd',
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
    const lat = gf.centerLatitude || gf.latitude;
    const lng = gf.centerLongitude || gf.longitude;
    if (!lat || !lng) return;

    L.circle([lat, lng], {
      color: '#00f2fe',
      fillColor: '#0284c7',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: gf.radiusMeters || gf.radius || 1500,
      dashArray: '4, 4',
    })
      .bindTooltip(`<div style="background:#070c18; color:#00f2fe; padding:4px 8px; border-radius:6px; font-family:monospace; border:1px solid rgba(0,242,254,0.4); font-size:11px;"><b>${gf.name}</b><br>Safe Hub Radius: ${gf.radiusMeters || 1500}m</div>`, { direction: 'top' })
      .addTo(geofenceLayer!);
  });
}

function renderVehicles() {
  if (!markersLayer || !props.vehicles) return;
  markersLayer.clearLayers();

  const latLngs: [number, number][] = [];

  props.vehicles.forEach((v) => {
    const lat = Number(v.currentLatitude);
    const lng = Number(v.currentLongitude);
    if (!lat || !lng) return;

    latLngs.push([lat, lng]);

    const isMoving = (v.currentSpeed && v.currentSpeed > 0) || v.status === 'IN_TRANSIT';
    const markerColor = isMoving ? '#00f2fe' : (v.status === 'AVAILABLE' ? '#10b981' : '#f59e0b');
    const marker = L.marker([lat, lng], {
      icon: createTruckIcon(markerColor, isMoving),
    });

    marker.bindTooltip(
      `<div style="background:#070c18; color:#ffffff; padding:4px 8px; border-radius:6px; font-family:monospace; border:1px solid rgba(0,242,254,0.4); font-size:11px;">
        <strong style="color:#00f2fe">${v.vehicleNumber}</strong><br>
        Speed: <b>${v.currentSpeed || 0} km/h</b> &bull; ${v.status}
      </div>`,
      { direction: 'top', offset: [0, -10] },
    );

    marker.on('click', () => {
      selectedVehicle.value = v;
      emit('select-vehicle', v);
    });

    markersLayer!.addLayer(marker);
  });

  if (map && latLngs.length > 1 && !props.routePath?.length) {
    try {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch {
      // bounds fallback
    }
  }
}

function renderRoute() {
  if (!map) return;
  if (routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }

  if (props.routePath && props.routePath.length > 1) {
    routePolyline = L.polyline(props.routePath, {
      color: '#00f2fe',
      weight: 3.5,
      opacity: 0.9,
      dashArray: '6, 6',
    }).addTo(map);

    try {
      map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    } catch {
      // fitbounds fallback
    }
  }
}

function focusVehicle(v: any) {
  if (!map || !v) return;
  const lat = Number(v.currentLatitude);
  const lng = Number(v.currentLongitude);
  if (lat && lng) {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
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

<style>
.leaflet-container {
  background-color: #070c18 !important;
}
.leaflet-bar a {
  background-color: #0b1329 !important;
  color: #00f2fe !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.leaflet-bar a:hover {
  background-color: #00f2fe !important;
  color: #070c18 !important;
}
</style>
