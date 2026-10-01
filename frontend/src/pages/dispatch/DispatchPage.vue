<template>
  <div class="trip-allocation-page q-pa-md">
    <!-- Header with Title & Action Controls (Single-Row) -->
    <div class="row items-center justify-between no-wrap q-mb-md gap-3">
      <div class="min-w-0">
        <div class="text-h6 text-weight-bold text-white row items-center no-wrap q-gutter-x-sm">
          <q-icon name="send" color="cyan" size="24px" />
          <span class="truncate">Trip Allocation & Dispatch Console</span>
        </div>
        <div class="text-caption text-grey-5 truncate">
          Fleet allocation, odometer controls, live dispatch &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> to allocate new trip
        </div>
      </div>

      <div class="row items-center no-wrap q-gutter-x-sm flex-shrink-0">
        <!-- View Toggle (Table / Pipeline) -->
        <div class="view-mode-toggle q-mr-xs">
          <button
            type="button"
            class="view-mode-btn"
            :class="{ active: activeView === 'table' }"
            @click="activeView = 'table'"
          >
            <q-icon name="table_rows" size="15px" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            class="view-mode-btn"
            :class="{ active: activeView === 'board' }"
            @click="activeView = 'board'"
          >
            <q-icon name="view_kanban" size="15px" />
            <span>Pipeline Board</span>
          </button>
        </div>

        <q-btn
          unelevated
          icon="refresh"
          label="Refresh"
          class="desk-btn-secondary"
          :loading="isRefreshing"
          @click="onRefresh"
        >
          <template #loading>
            <q-spinner color="cyan" size="16px" />
          </template>
          <q-tooltip>Refresh Trips & Pipeline</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportTripsPdf"
        >
          <q-tooltip>Download / Print Trips in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportTripsCsv"
        >
          <q-tooltip>Export Trips to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Allocate Trip (Ctrl+N)"
          class="desk-btn-primary"
          @click="openAddModal"
        >
          <q-tooltip>Allocate & Dispatch Trip (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Dispatch Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- Table View using DeskDataTable -->
      <div v-if="activeView === 'table'">
      <DeskDataTable
        title="Active Dispatch Register"
        :rows="filteredTrips"
        :columns="tableColumns"
        row-key="id"
        selection-mode="none"
        :allow-create="false"
        :allow-export="false"
        :allow-refresh="true"
        :allow-delete="true"
        @create="openAddModal"
        @edit="trackTrip"
        @delete="confirmDeleteTrip"
        @row-dblclick="trackTrip"
        @refresh="onRefresh"
      >
        <!-- Custom Filter in Table Toolbar -->
        <template #top-filters>
          <q-select
            v-model="stageFilter"
            :options="stageOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 130px;"
          />
        </template>

        <!-- Custom Cell: Trip ID -->
        <template #body-cell-tripId="{ value }">
          <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
        </template>

        <!-- Custom Cell: Vehicle -->
        <template #body-cell-vehicle="{ value }">
          <span class="font-mono text-weight-semibold text-white">{{ value }}</span>
        </template>

        <!-- Custom Cell: Driver -->
        <template #body-cell-driver="{ value }">
          <span class="text-white text-weight-medium">{{ value }}</span>
        </template>

        <!-- Custom Cell: Route -->
        <template #body-cell-route="{ value }">
          <span class="text-weight-bold text-cyan-3">{{ value }}</span>
        </template>

        <!-- Custom Cell: LR Ref -->
        <template #body-cell-lrRef="{ value }">
          <span class="font-mono text-grey-4">{{ value }}</span>
        </template>

        <!-- Custom Cell: Date -->
        <template #body-cell-startDate="{ value }">
          <span class="font-mono text-grey-4">{{ value }}</span>
        </template>

        <!-- Custom Cell: Distance -->
        <template #body-cell-plannedKm="{ value }">
          <span class="font-mono text-weight-bold text-white">{{ value }} KM</span>
        </template>

        <!-- Custom Cell: Stage -->
        <template #body-cell-stage="{ value }">
          <span
            class="desk-pill"
            :class="
              value === 'In Transit'
                ? 'desk-pill-active'
                : value === 'Delivered'
                ? 'desk-pill-success'
                : value === 'Loading'
                ? 'desk-pill-warning'
                : 'desk-pill-draft'
            "
          >
            {{ value }}
          </span>
        </template>

        <!-- Custom Cell: Actions matching Reference Image -->
        <template #body-cell-actions="{ props }">
          <div class="row items-center q-gutter-x-xs no-wrap justify-center">
            <button class="btn-table-action" @click.stop="editTrip(props.row)">
              Edit
            </button>
            <button class="btn-table-action" @click.stop="trackTrip(props.row)">
              Track
            </button>
            <button
              class="btn-table-icon btn-table-icon--danger"
              @click.stop="confirmDeleteTrip(props.row)"
              title="Delete Trip"
            >
              <q-icon name="delete" size="14px" />
            </button>
          </div>
        </template>
      </DeskDataTable>
    </div>

    <!-- Pipeline Board View -->
    <div v-else class="row q-col-gutter-sm">
      <div v-for="stg in stages" :key="stg.name" class="col-12 col-sm-6 col-md-3">
        <div class="pipeline-column bg-surface-2 q-pa-sm rounded-borders border">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-weight-bold text-caption text-uppercase text-grey-3">{{ stg.name }}</span>
            <q-badge color="cyan-9" text-color="cyan-1" rounded>{{ getTripsInStage(stg.name).length }}</q-badge>
          </div>

          <div class="pipeline-card-list scroll" style="max-height: 65vh;">
            <div
              v-for="t in getTripsInStage(stg.name)"
              :key="t.id"
              class="trip-card bg-surface q-pa-sm q-mb-xs rounded-borders border cursor-pointer hover-glow"
              @click="trackTrip(t)"
            >
              <div class="row items-center justify-between">
                <span class="text-cyan-4 font-mono text-weight-bold">{{ t.tripId }}</span>
                <span class="text-caption text-grey-4 font-mono">{{ t.vehicle }}</span>
              </div>
              <div class="text-caption text-weight-medium text-white q-my-xs">{{ t.route }}</div>
              <div class="row items-center justify-between text-caption text-grey-5">
                <span>{{ t.driver }}</span>
                <span class="font-mono text-cyan-3">{{ t.plannedKm }} KM</span>
              </div>
            </div>

            <div v-if="getTripsInStage(stg.name).length === 0" class="text-center text-caption text-grey-6 q-pa-md">
              No trips in this stage
            </div>
          </div>
        </div>
      </div>

      <!-- Inner Loading Overlay on Dispatch Refresh -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Refreshing Dispatch Pipeline & Trips...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Syncing trip allocations, driver statuses & live odometer logs
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Add / Edit Trip Desk Dialog matching Image 1 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Dispatch Trip — ${editingTrip?.tripId}` : 'Allocate & Dispatch Trip'"
      width="640px"
      :confirm-label="isEditing ? 'Update Trip' : 'Dispatch Trip'"
      cancel-label="Cancel"
      @confirm="saveTrip"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveTrip">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Assign Fleet Vehicle" required shortcut="1">
              <DeskCombo
                v-model="newTrip.vehicle"
                :options="vehicleOptions"
                placeholder="Select vehicle..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Assign Driver" required shortcut="2">
              <DeskCombo
                v-model="newTrip.driver"
                :options="driverOptions"
                placeholder="Select driver..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Route Corridor" required shortcut="3">
              <q-input
                v-model="newTrip.route"
                dense
                outlined
                placeholder="e.g. AHD → MUM"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Lorry Receipt Ref" required shortcut="4">
              <q-input
                v-model="newTrip.lrRef"
                dense
                outlined
                placeholder="e.g. LR/240048"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Starting Odometer (KM)" shortcut="5">
              <q-input
                v-model="newTrip.odoStart"
                dense
                outlined
                placeholder="e.g. 48,200"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Planned Trip Distance (KM)" shortcut="6">
              <q-input
                v-model="newTrip.plannedKm"
                dense
                outlined
                placeholder="e.g. 540"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog (No browser alert) -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Trip"
      icon="warning"
      width="480px"
      confirm-label="Delete Trip"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteTrip"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently cancel and delete Trip
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.tripId }}</span>
          (Vehicle: <strong class="text-white">{{ deletingItem?.vehicle }}</strong>)?
        </div>
        <div class="text-caption text-red-3">
          This operation will cancel the trip dispatch and return the vehicle and driver to available status.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import {
  DeskDataTable,
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  GridColumn,
} from '../../framework';

const router = useRouter();
const $q = useQuasar();

export interface TripItem {
  id: string;
  tripId: string;
  vehicle: string;
  driver: string;
  route: string;
  lrRef: string;
  startDate: string;
  odoStart: string;
  odoEnd: string;
  plannedKm: string;
  actualKm: string;
  stage: string;
}

const showAddModal = ref(false);
const isEditing = ref(false);
const editingTrip = ref<TripItem | null>(null);
const showDeleteDialog = ref(false);
const deletingItem = ref<TripItem | null>(null);
const searchQuery = ref('');
const stageFilter = ref('ALL');
const activeView = ref<'table' | 'board'>('table');

const stages = [
  { name: 'Planned' },
  { name: 'Loading' },
  { name: 'In Transit' },
  { name: 'Delivered' },
];

const stageOptions = [
  { label: 'All Stages', value: 'ALL' },
  { label: 'Planned', value: 'Planned' },
  { label: 'Loading', value: 'Loading' },
  { label: 'In Transit', value: 'In Transit' },
  { label: 'Delivered', value: 'Delivered' },
];

const vehicleOptions = [
  'GJ-01-AB-1122 (Tractor • 28T)',
  'MH-14-DX-9000 (Multi-Axle • 35T)',
  'RJ-13-TR-7788 (Container • 20T)',
  'GJ-05-BT-2211 (Linehaul • 16T)',
];

const driverOptions = [
  'Ramesh Alumar (DRV-001)',
  'Kishore Bhai (DRV-002)',
  'Suresh Patel (DRV-003)',
  'Devraj Patel (DRV-004)',
];

const tableColumns: GridColumn[] = [
  { name: 'tripId', label: 'TRIP ID', field: 'tripId', align: 'left', sortable: true },
  { name: 'vehicle', label: 'VEHICLE', field: 'vehicle', align: 'left', sortable: true },
  { name: 'driver', label: 'DRIVER', field: 'driver', align: 'left' },
  { name: 'route', label: 'ROUTE', field: 'route', align: 'left', sortable: true },
  { name: 'lrRef', label: 'LR REF', field: 'lrRef', align: 'left' },
  { name: 'startDate', label: 'DATE', field: 'startDate', align: 'center' },
  { name: 'plannedKm', label: 'DISTANCE', field: 'plannedKm', align: 'right' },
  { name: 'stage', label: 'STAGE', field: 'stage', align: 'center' },
  { name: 'actions', label: 'ACTION', field: 'actions', align: 'center' },
];

const trips = ref<TripItem[]>([
  {
    id: '1',
    tripId: 'TR/240078',
    vehicle: 'GJ-01-AB-1122',
    driver: 'Ramesh Alumar',
    route: 'AHD → MUM',
    lrRef: 'LR/240047',
    startDate: '2026-10-24',
    odoStart: '48,000',
    odoEnd: '—',
    plannedKm: '540',
    actualKm: '—',
    stage: 'In Transit',
  },
  {
    id: '2',
    tripId: 'TR/240077',
    vehicle: 'MH-14-DX-9000',
    driver: 'Kishore Bhai',
    route: 'AHD → VAPI',
    lrRef: 'LR/240046',
    startDate: '2026-10-24',
    odoStart: '1,12,400',
    odoEnd: '—',
    plannedKm: '360',
    actualKm: '—',
    stage: 'Loading',
  },
  {
    id: '3',
    tripId: 'TR/240076',
    vehicle: 'RJ-13-TR-7788',
    driver: 'Suresh Patel',
    route: 'SRT → PUN',
    lrRef: 'LR/240045',
    startDate: '2026-10-23',
    odoStart: '89,500',
    odoEnd: '—',
    plannedKm: '410',
    actualKm: '—',
    stage: 'Planned',
  },
  {
    id: '4',
    tripId: 'TR/240075',
    vehicle: 'GJ-05-BT-2211',
    driver: 'Devraj Patel',
    route: 'MUM → SUB',
    lrRef: 'LR/240044',
    startDate: '2026-10-22',
    odoStart: '64,100',
    odoEnd: '64,190',
    plannedKm: '90',
    actualKm: '92',
    stage: 'Delivered',
  },
]);

const newTrip = ref({
  vehicle: 'GJ-01-AB-1122',
  driver: 'Ramesh Alumar',
  route: 'AHD → MUM',
  lrRef: 'LR/240048',
  odoStart: '48,200',
  plannedKm: '540',
});

const filteredTrips = computed(() => {
  return trips.value.filter((t) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.tripId.toLowerCase().includes(q) ||
      t.vehicle.toLowerCase().includes(q) ||
      t.driver.toLowerCase().includes(q) ||
      t.route.toLowerCase().includes(q);
    const matchStage = stageFilter.value === 'ALL' || t.stage === stageFilter.value;
    return matchSearch && matchStage;
  });
});

function getTripsInStage(stageName: string): TripItem[] {
  return trips.value.filter((t) => t.stage === stageName);
}

function openAddModal() {
  isEditing.value = false;
  editingTrip.value = null;
  newTrip.value = {
    vehicle: 'GJ-01-AB-1122',
    driver: 'Ramesh Alumar',
    route: 'AHD → MUM',
    lrRef: 'LR/240048',
    odoStart: '48,200',
    plannedKm: '540',
  };
  showAddModal.value = true;
}

function editTrip(trip: TripItem) {
  isEditing.value = true;
  editingTrip.value = trip;
  newTrip.value = {
    vehicle: trip.vehicle,
    driver: trip.driver,
    route: trip.route,
    lrRef: trip.lrRef,
    odoStart: trip.odoStart,
    plannedKm: trip.plannedKm,
  };
  showAddModal.value = true;
}

function confirmDeleteTrip(trip: TripItem) {
  deletingItem.value = trip;
  showDeleteDialog.value = true;
}

function executeDeleteTrip() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  const targetTripId = deletingItem.value.tripId;

  trips.value = trips.value.filter((t) => t.id !== targetId);
  showDeleteDialog.value = false;
  deletingItem.value = null;

  $q.notify({
    type: 'positive',
    message: 'Trip Removed',
    caption: `${targetTripId} was cancelled and deleted.`,
    position: 'top-right',
  });
}

function trackTrip(trip: TripItem) {
  router.push({ path: '/tracking', query: { search: trip.tripId } });
}

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Dispatch Console Refreshed',
      caption: 'Loaded active fleet trips and odometer status.',
      timeout: 1800,
      position: 'top-right',
    });
  }, 650);
}

function exportTripsCsv() {
  exportToCsv(
    'dispatch_trips_allocation',
    [
      { label: 'Trip ID', field: 'tripId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Driver', field: 'driver' },
      { label: 'Route', field: 'route' },
      { label: 'LR Reference', field: 'lrRef' },
      { label: 'Start Date', field: 'startDate' },
      { label: 'Odo Start', field: 'odoStart' },
      { label: 'Odo End', field: 'odoEnd' },
      { label: 'Planned KM', field: 'plannedKm' },
      { label: 'Actual KM', field: 'actualKm' },
      { label: 'Stage', field: 'stage' },
    ],
    filteredTrips.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${filteredTrips.value.length} trips exported to CSV.`,
    position: 'top-right',
  });
}

function exportTripsPdf() {
  exportToPdf({
    title: 'Trip Allocation & Dispatch Register',
    subtitle: `Active Filter: ${stageFilter.value} | Total Records: ${filteredTrips.value.length}`,
    columns: [
      { label: 'Trip #', field: 'tripId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Driver', field: 'driver' },
      { label: 'Route', field: 'route' },
      { label: 'LR Ref', field: 'lrRef' },
      { label: 'Planned KM', field: 'plannedKm', align: 'right' },
      { label: 'Stage', field: 'stage', align: 'center' },
    ],
    rows: filteredTrips.value,
  });
}

function saveTrip() {
  if (!newTrip.value.vehicle || !newTrip.value.driver || !newTrip.value.route) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please assign a vehicle, driver, and route.',
      position: 'top-right',
    });
    return;
  }

  if (isEditing.value && editingTrip.value) {
    const idx = trips.value.findIndex((t) => t.id === editingTrip.value!.id);
    if (idx !== -1) {
      trips.value[idx] = {
        ...trips.value[idx],
        vehicle: newTrip.value.vehicle.split(' ')[0],
        driver: newTrip.value.driver.split(' ')[0] + ' ' + (newTrip.value.driver.split(' ')[1] || ''),
        route: newTrip.value.route,
        lrRef: newTrip.value.lrRef,
        odoStart: newTrip.value.odoStart,
        plannedKm: newTrip.value.plannedKm,
      };
      showAddModal.value = false;
      $q.notify({
        type: 'positive',
        message: 'Trip Updated',
        caption: `Trip ${editingTrip.value.tripId} details updated successfully.`,
        position: 'top-right',
      });
      return;
    }
  }

  const num = 240079 + trips.value.length;
  trips.value.unshift({
    id: String(Date.now()),
    tripId: `TR/${num}`,
    vehicle: newTrip.value.vehicle.split(' ')[0],
    driver: newTrip.value.driver.split(' ')[0] + ' ' + (newTrip.value.driver.split(' ')[1] || ''),
    route: newTrip.value.route,
    lrRef: newTrip.value.lrRef,
    startDate: new Date().toISOString().slice(0, 10),
    odoStart: newTrip.value.odoStart,
    odoEnd: '—',
    plannedKm: newTrip.value.plannedKm,
    actualKm: '—',
    stage: 'Planned',
  });

  $q.notify({
    type: 'positive',
    message: 'Trip Allocated',
    caption: `Trip TR/${num} dispatched successfully.`,
    position: 'top-right',
  });
  showAddModal.value = false;
}
</script>

<style scoped>
.trip-allocation-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.pipeline-column {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 480px;
}

.trip-card {
  background: #111a33;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.trip-card:hover {
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
}

.desk-kbd {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #00f2fe;
  font-family: var(--desk-font-mono, monospace);
  font-size: 10px;
}

/* Custom Segmented View Toggle matching Cyber Dark Theme */
.view-mode-toggle {
  display: inline-flex;
  align-items: center;
  background: #090f1d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
}

.view-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;
  white-space: nowrap;
}

.view-mode-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}

.view-mode-btn.active {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.15);
}

.view-mode-btn .q-icon {
  font-size: 15px;
}
</style>
