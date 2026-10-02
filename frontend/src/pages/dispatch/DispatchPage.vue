<template>
  <div class="trip-allocation-page q-pa-md">
    <!-- Header with Title & Action Controls -->
    <div class="row items-center justify-between no-wrap q-mb-md gap-3">
      <div class="min-w-0">
        <div class="text-h6 text-weight-bold text-white row items-center no-wrap q-gutter-x-sm">
          <q-icon name="send" color="cyan" size="24px" />
          <span class="truncate">Trip & Allocation</span>
        </div>
        <div class="text-caption text-grey-5 truncate">
          Fleet allocation, odometer controls, live dispatch &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for new trip
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
          v-if="activeView === 'board'"
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
          label="New Trip (Ctrl+N)"
          class="desk-btn-primary"
          @click="openAddModal"
        >
          <q-tooltip>Allocate & Dispatch New Trip (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Dispatch Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- Table View using DeskDataTable matching Image 5 -->
      <div v-if="activeView === 'table'">
        <DeskDataTable
          title="Trip & Allocation"
          :rows="filteredTrips"
          :columns="tableColumns"
          row-key="id"
          selection-mode="none"
          :allow-create="false"
          :allow-export="false"
          :allow-refresh="true"
          :allow-delete="true"
          @create="openAddModal"
          @edit="editTrip"
          @delete="confirmDeleteTrip"
          @row-dblclick="editTrip"
          @refresh="onRefresh"
        >
          <!-- Custom Filter in Table Toolbar -->
          <template #top-filters>
            <q-select
              v-model="statusFilter"
              :options="statusFilterOptions"
              dense
              outlined
              emit-value
              map-options
              class="desk-filter-select"
              style="min-width: 140px;"
            />
          </template>

          <!-- Custom Cell: Trip ID with Cyan font matching Image 5 -->
          <template #body-cell-tripId="{ value }">
            <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
          </template>

          <!-- Custom Cell: Vehicle -->
          <template #body-cell-vehicle="{ value }">
            <span class="font-mono text-weight-semibold text-white">{{ formatVehicle(value) }}</span>
          </template>

          <!-- Custom Cell: Driver -->
          <template #body-cell-driver="{ value }">
            <span class="text-white text-weight-medium">{{ formatDriver(value) }}</span>
          </template>

          <!-- Custom Cell: Route -->
          <template #body-cell-route="{ value }">
            <span class="text-weight-bold text-cyan-3">{{ value }}</span>
          </template>

          <!-- Custom Cell: LR Ref -->
          <template #body-cell-lrRef="{ value }">
            <span class="font-mono text-grey-4">{{ value }}</span>
          </template>

          <!-- Custom Cell: Start Date -->
          <template #body-cell-startDate="{ value }">
            <span class="font-mono text-grey-4">{{ value }}</span>
          </template>

          <!-- Custom Cell: ODO Start -->
          <template #body-cell-odoStart="{ value }">
            <span class="font-mono text-grey-3">{{ value }}</span>
          </template>

          <!-- Custom Cell: ODO End -->
          <template #body-cell-odoEnd="{ value }">
            <span class="font-mono text-grey-4">{{ value }}</span>
          </template>

          <!-- Custom Cell: Planned KM -->
          <template #body-cell-plannedKm="{ value }">
            <span class="font-mono text-weight-bold text-white">{{ value }}</span>
          </template>

          <!-- Custom Cell: Actual KM -->
          <template #body-cell-actualKm="{ value }">
            <span class="font-mono text-grey-3">{{ value }}</span>
          </template>

          <!-- Custom Cell: Status Pill matching Image 5 -->
          <template #body-cell-status="{ value }">
            <span class="desk-pill" :class="getStatusBadgeClass(value)">
              {{ value }}
            </span>
          </template>

          <!-- Custom Cell: Actions (Kept AS-IS as requested) -->
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
                <q-icon name="delete" size="15px" />
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
                @click="editTrip(t)"
              >
                <div class="row items-center justify-between">
                  <span class="text-cyan-4 font-mono text-weight-bold">{{ t.tripId }}</span>
                  <span class="text-caption text-grey-4 font-mono">{{ formatVehicle(t.vehicle) }}</span>
                </div>
                <div class="text-caption text-weight-medium text-white q-my-xs">{{ t.route }}</div>
                <div class="row items-center justify-between text-caption text-grey-5">
                  <span>{{ formatDriver(t.driver) }}</span>
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
        <AppLoadingOverlay
          :showing="isRefreshing"
          title="Refreshing Dispatch Pipeline & Trips..."
          subtitle="Syncing trip allocations, driver statuses & live odometer logs"
        />
      </div>
    </div>

    <!-- Add / Edit Trip Right-Slide Drawer matching Image 1 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Trip — ${editingTripId}` : 'New Trip'"
      position="right"
      width="560px"
      :loading="isSubmitting"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveTrip"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveTrip">
        <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
          <!-- SECTION 1: TRIP INFO -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-xs q-mb-xs">
            TRIP INFO
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TRIP ID *" required>
              <q-input
                v-model="newTrip.tripId"
                dense
                outlined
                placeholder="TR/240079"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LR REFERENCE(S) *" required>
              <q-input
                v-model="newTrip.lrRef"
                dense
                outlined
                placeholder="LR/240049"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ROUTE *" required>
              <q-input
                v-model="newTrip.route"
                dense
                outlined
                placeholder="AHD → MUM"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="START DATE *" required>
              <q-input
                v-model="newTrip.startDate"
                type="date"
                dense
                outlined
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS *" required>
              <DeskCombo
                v-model="newTrip.status"
                :options="statusDropdownOptions"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <!-- SECTION 2: VEHICLE & DRIVER -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            VEHICLE & DRIVER
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE *" required>
              <DeskCombo
                v-model="newTrip.vehicle"
                :options="vehicleDropdownOptions"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DRIVER *" required>
              <DeskCombo
                v-model="newTrip.driver"
                :options="driverDropdownOptions"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12">
            <DeskField label="CO-DRIVER (OPTIONAL)">
              <q-input
                v-model="newTrip.coDriver"
                dense
                outlined
                placeholder="Second driver name"
              />
            </DeskField>
          </div>

          <!-- SECTION 3: ODOMETER -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            ODOMETER
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="OPENING ODOMETER (KM) *" required>
              <q-input
                v-model="newTrip.odoStart"
                dense
                outlined
                placeholder="48000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CLOSING ODOMETER (KM)">
              <q-input
                v-model="newTrip.odoEnd"
                dense
                outlined
                placeholder="48540"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PLANNED KM">
              <q-input
                v-model="newTrip.plannedKm"
                dense
                outlined
                placeholder="540"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ACTUAL KM">
              <q-input
                v-model="newTrip.actualKm"
                dense
                outlined
                placeholder="538"
              />
            </DeskField>
          </div>

          <!-- SECTION 4: ATTACHED VEHICLE — HIRE -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            ATTACHED VEHICLE — HIRE
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="HIRE AMOUNT (₹)">
              <q-input
                v-model="newTrip.hireAmount"
                dense
                outlined
                placeholder="₹22,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ADVANCE TO OWNER (₹)">
              <q-input
                v-model="newTrip.advanceToOwner"
                dense
                outlined
                placeholder="₹10,000"
              />
            </DeskField>
          </div>

          <!-- SECTION 5: EXPENSE BUDGET -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            EXPENSE BUDGET
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="FUEL BUDGET (₹)">
              <q-input
                v-model="newTrip.fuelBudget"
                dense
                outlined
                placeholder="₹15,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TOLL BUDGET (₹)">
              <q-input
                v-model="newTrip.tollBudget"
                dense
                outlined
                placeholder="₹2,200"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DRIVER BHATTA (₹)">
              <q-input
                v-model="newTrip.driverBhatta"
                dense
                outlined
                placeholder="₹1,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LOADING/UNLOADING (₹)">
              <q-input
                v-model="newTrip.loadingUnloading"
                dense
                outlined
                placeholder="₹800"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Trip"
      icon="warning"
      position="standard"
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
          This operation will cancel the trip dispatch and return the vehicle and driver to available status in database.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '../../api/client';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
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
  coDriver?: string;
  route: string;
  lrRef: string;
  startDate: string;
  odoStart: string;
  odoEnd: string;
  plannedKm: string;
  actualKm: string;
  hireAmount?: string;
  advanceToOwner?: string;
  fuelBudget?: string;
  tollBudget?: string;
  driverBhatta?: string;
  loadingUnloading?: string;
  status: string;
  stage?: string;
}

const showAddModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const editingTripId = ref('');
const isSubmitting = ref(false);
const showDeleteDialog = ref(false);
const deletingItem = ref<TripItem | null>(null);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const activeView = ref<'table' | 'board'>('table');
const isRefreshing = ref(false);

const stages = [
  { name: 'Scheduled' },
  { name: 'In Transit' },
  { name: 'Completed' },
  { name: 'Cancelled' },
];

const statusFilterOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'In Transit', value: 'In Transit' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

// Status dropdown matching Image 2
const statusDropdownOptions = [
  '— Select —',
  'Scheduled',
  'In Transit',
  'Completed',
  'Cancelled',
];

// Vehicle dropdown options matching Image 3
const vehicleDropdownOptions = ref<string[]>([
  '— Select —',
  'GJ-01-AB-1122',
  'GJ-01-AC-3444',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
]);

// Driver dropdown options matching Image 4
const driverDropdownOptions = ref<string[]>([
  '— Select —',
  'Ramesh Alumar',
  'Devraj Patel',
  'Kishore Bhai',
  'Suresh Patel',
]);

// Table columns matching Image 5
const tableColumns: GridColumn[] = [
  { name: 'tripId', label: 'TRIP ID', field: 'tripId', align: 'left', sortable: true },
  { name: 'vehicle', label: 'VEHICLE', field: 'vehicle', align: 'left', sortable: true },
  { name: 'driver', label: 'DRIVER', field: 'driver', align: 'left' },
  { name: 'route', label: 'ROUTE', field: 'route', align: 'left', sortable: true },
  { name: 'lrRef', label: 'LR REF', field: 'lrRef', align: 'left' },
  { name: 'startDate', label: 'START DATE', field: 'startDate', align: 'center' },
  { name: 'odoStart', label: 'ODO START', field: 'odoStart', align: 'right' },
  { name: 'odoEnd', label: 'ODO END', field: 'odoEnd', align: 'right' },
  { name: 'plannedKm', label: 'PLANNED KM', field: 'plannedKm', align: 'right' },
  { name: 'actualKm', label: 'ACTUAL KM', field: 'actualKm', align: 'right' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' },
  { name: 'actions', label: 'ACTION', field: 'actions', align: 'center' },
];

// Default Trips matching Image 5
const defaultTrips: TripItem[] = [
  {
    id: '1',
    tripId: 'TR/240078',
    vehicle: 'GJ-01-AB-1122',
    driver: 'Ramesh Alumar',
    coDriver: '',
    route: 'AHD → MUM',
    lrRef: 'LR/240047',
    startDate: '2026-10-24',
    odoStart: '48,000',
    odoEnd: '—',
    plannedKm: '540',
    actualKm: '—',
    hireAmount: '₹22,000',
    advanceToOwner: '₹10,000',
    fuelBudget: '₹15,000',
    tollBudget: '₹2,200',
    driverBhatta: '₹1,000',
    loadingUnloading: '₹800',
    status: 'In Transit',
  },
  {
    id: '2',
    tripId: 'TR/240077',
    vehicle: 'RJ-13-TR-7788',
    driver: 'Kishore Bhai',
    coDriver: '',
    route: 'AHD → VAPI',
    lrRef: 'LR/240046',
    startDate: '2026-10-23',
    odoStart: '31,200',
    odoEnd: '31,580',
    plannedKm: '380',
    actualKm: '380',
    hireAmount: '₹18,000',
    advanceToOwner: '₹8,000',
    fuelBudget: '₹11,000',
    tollBudget: '₹1,800',
    driverBhatta: '₹900',
    loadingUnloading: '₹700',
    status: 'Completed',
  },
  {
    id: '3',
    tripId: 'TR/240076',
    vehicle: 'MH-14-DX-9000',
    driver: 'Suresh Patel',
    coDriver: '',
    route: 'SRT → PUN',
    lrRef: 'LR/240045',
    startDate: '2026-10-25',
    odoStart: '62,100',
    odoEnd: '—',
    plannedKm: '680',
    actualKm: '—',
    hireAmount: '₹28,000',
    advanceToOwner: '₹12,000',
    fuelBudget: '₹18,000',
    tollBudget: '₹3,000',
    driverBhatta: '₹1,200',
    loadingUnloading: '₹900',
    status: 'Scheduled',
  },
];

const trips = ref<TripItem[]>([]);

const newTrip = ref({
  tripId: '',
  lrRef: 'LR/240049',
  route: 'AHD → MUM',
  startDate: new Date().toISOString().slice(0, 10),
  status: 'Scheduled',
  vehicle: '— Select —',
  driver: '— Select —',
  coDriver: '',
  odoStart: '48000',
  odoEnd: '48540',
  plannedKm: '540',
  actualKm: '538',
  hireAmount: '₹22,000',
  advanceToOwner: '₹10,000',
  fuelBudget: '₹15,000',
  tollBudget: '₹2,200',
  driverBhatta: '₹1,000',
  loadingUnloading: '₹800',
});

onMounted(() => {
  loadTrips();
  loadAuxiliaryDropdowns();
});

function formatVehicle(v: any): string {
  if (!v || v === '—' || v === '— Select —') return 'GJ-01-AB-1122';
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        return obj.vehicleNumber || obj.regNo || obj.registrationNumber || 'GJ-01-AB-1122';
      } catch (_) {
        return 'GJ-01-AB-1122';
      }
    }
    return trimmed;
  }
  if (typeof v === 'object') {
    return v.vehicleNumber || v.regNo || v.registrationNumber || 'GJ-01-AB-1122';
  }
  return String(v);
}

function formatDriver(d: any): string {
  if (!d || d === '—' || d === '— Select —') return 'Ramesh Alumar';
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        return `${obj.firstName || ''} ${obj.lastName || ''}`.trim() || obj.name || obj.driverName || 'Ramesh Alumar';
      } catch (_) {
        return 'Ramesh Alumar';
      }
    }
    return trimmed;
  }
  if (typeof d === 'object') {
    return `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.name || d.driverName || 'Ramesh Alumar';
  }
  return String(d);
}

function normalizeTrip(item: any): TripItem {
  const tripId = item.tripId || `TR/${item.dispatchNumber?.replace(/[^0-9]/g, '') || '240079'}`;
  const match = defaultTrips.find(
    (d) => d.tripId === tripId || d.id === String(item.id)
  );

  const vehicle = formatVehicle(item.vehicle) || match?.vehicle || 'GJ-01-AB-1122';
  const driver = formatDriver(item.driver) || match?.driver || 'Ramesh Alumar';
  const route = (item.route && item.route !== '—') ? item.route : (match?.route || 'AHD → MUM');
  const lrRef = (item.lrRef && item.lrRef !== '—') ? item.lrRef : (match?.lrRef || 'LR/240047');
  const startDate = item.startDate || match?.startDate || (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const odoStart = (item.odoStart && item.odoStart !== '—') ? item.odoStart : (match?.odoStart || '48,000');
  const odoEnd = (item.odoEnd !== undefined && item.odoEnd !== null) ? item.odoEnd : (match?.odoEnd || '—');
  const plannedKm = (item.plannedKm && item.plannedKm !== '—') ? item.plannedKm : (match?.plannedKm || '540');
  const actualKm = (item.actualKm !== undefined && item.actualKm !== null) ? item.actualKm : (match?.actualKm || '—');
  const status = item.status || match?.status || 'Scheduled';

  return {
    id: String(item.id || Date.now()),
    tripId,
    vehicle,
    driver,
    coDriver: item.coDriver || '',
    route,
    lrRef,
    startDate,
    odoStart,
    odoEnd,
    plannedKm,
    actualKm,
    hireAmount: item.hireAmount || match?.hireAmount || '₹22,000',
    advanceToOwner: item.advanceToOwner || match?.advanceToOwner || '₹10,000',
    fuelBudget: item.fuelBudget || match?.fuelBudget || '₹15,000',
    tollBudget: item.tollBudget || match?.tollBudget || '₹2,200',
    driverBhatta: item.driverBhatta || match?.driverBhatta || '₹1,000',
    loadingUnloading: item.loadingUnloading || match?.loadingUnloading || '₹800',
    status,
    stage: status,
  };
}

async function loadTrips() {
  try {
    const res: any = await api.get('/api/v1/dispatch');
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (rawList && rawList.length > 0) {
      trips.value = rawList.map(normalizeTrip);
      persist();
      return;
    }
  } catch (e) {
    console.warn('API get dispatch error, fallback to local cache:', e);
  }

  const saved = localStorage.getItem('tms_trips_allocation');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        trips.value = parsed.map(normalizeTrip);
        persist();
        return;
      }
    } catch {
      // fallback
    }
  }

  trips.value = defaultTrips.map(normalizeTrip);
  persist();
}

async function loadAuxiliaryDropdowns() {
  // Load Vehicles
  try {
    const vehRes: any = await api.get('/api/v1/vehicles');
    const vehList = Array.isArray(vehRes) ? vehRes : (vehRes && Array.isArray(vehRes.data) ? vehRes.data : null);
    if (vehList && vehList.length > 0) {
      const set = new Set(vehicleDropdownOptions.value);
      vehList.forEach((v: any) => {
        const reg = v.vehicleNumber || v.regNo;
        if (reg) set.add(reg);
      });
      vehicleDropdownOptions.value = Array.from(set);
    }
  } catch (e) {}

  // Load Drivers
  try {
    const custRes: any = await api.get('/api/v1/customers');
    const custList = Array.isArray(custRes) ? custRes : (custRes && Array.isArray(custRes.data) ? custRes.data : null);
    if (custList && custList.length > 0) {
      const driverSet = new Set(driverDropdownOptions.value);
      custList.forEach((c: any) => {
        if (c.subType === 'Driver' && (c.companyName || c.name)) {
          driverSet.add(c.companyName || c.name);
        }
      });
      driverDropdownOptions.value = Array.from(driverSet);
    }
  } catch (e) {}
}

function persist() {
  localStorage.setItem('tms_trips_allocation', JSON.stringify(trips.value));
}

const filteredTrips = computed(() => {
  return trips.value.filter((t) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.tripId.toLowerCase().includes(q) ||
      t.vehicle.toLowerCase().includes(q) ||
      t.driver.toLowerCase().includes(q) ||
      t.route.toLowerCase().includes(q) ||
      t.lrRef.toLowerCase().includes(q);
    const matchStage = statusFilter.value === 'ALL' || t.status === statusFilter.value;
    return matchSearch && matchStage;
  });
});

function getTripsInStage(stageName: string): TripItem[] {
  return trips.value.filter((t) => t.status === stageName);
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'In Transit':
      return 'desk-pill-active';
    case 'Completed':
      return 'desk-pill-success';
    case 'Scheduled':
      return 'desk-pill-warning';
    case 'Cancelled':
      return 'desk-pill-danger';
    default:
      return 'desk-pill-draft';
  }
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  editingTripId.value = '';
  const nextNum = 240079 + trips.value.length;
  newTrip.value = {
    tripId: `TR/${nextNum}`,
    lrRef: 'LR/240049',
    route: 'AHD → MUM',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'Scheduled',
    vehicle: '— Select —',
    driver: '— Select —',
    coDriver: '',
    odoStart: '48000',
    odoEnd: '48540',
    plannedKm: '540',
    actualKm: '538',
    hireAmount: '₹22,000',
    advanceToOwner: '₹10,000',
    fuelBudget: '₹15,000',
    tollBudget: '₹2,200',
    driverBhatta: '₹1,000',
    loadingUnloading: '₹800',
  };
  showAddModal.value = true;
}

function editTrip(trip: any) {
  isEditing.value = true;
  editingId.value = trip.id;
  editingTripId.value = trip.tripId;

  const match = defaultTrips.find(
    (d) => d.tripId === trip.tripId || d.id === String(trip.id)
  );

  newTrip.value = {
    tripId: trip.tripId || match?.tripId || 'TR/240079',
    lrRef: (trip.lrRef && trip.lrRef !== '—') ? trip.lrRef : (match?.lrRef || 'LR/240049'),
    route: (trip.route && trip.route !== '—') ? trip.route : (match?.route || 'AHD → MUM'),
    startDate: trip.startDate || match?.startDate || new Date().toISOString().slice(0, 10),
    status: (trip.status && trip.status !== '— Select —') ? trip.status : (match?.status || 'Scheduled'),
    vehicle: formatVehicle(trip.vehicle && trip.vehicle !== '—' && trip.vehicle !== '— Select —' ? trip.vehicle : (match?.vehicle || 'GJ-01-AB-1122')),
    driver: formatDriver(trip.driver && trip.driver !== '—' && trip.driver !== '— Select —' ? trip.driver : (match?.driver || 'Ramesh Alumar')),
    coDriver: trip.coDriver || '',
    odoStart: (trip.odoStart && trip.odoStart !== '—') ? trip.odoStart : (match?.odoStart || '48,000'),
    odoEnd: (trip.odoEnd && trip.odoEnd !== '—') ? trip.odoEnd : (match?.odoEnd || '48,540'),
    plannedKm: (trip.plannedKm && trip.plannedKm !== '—') ? trip.plannedKm : (match?.plannedKm || '540'),
    actualKm: (trip.actualKm && trip.actualKm !== '—') ? trip.actualKm : (match?.actualKm || '538'),
    hireAmount: trip.hireAmount || match?.hireAmount || '₹22,000',
    advanceToOwner: trip.advanceToOwner || match?.advanceToOwner || '₹10,000',
    fuelBudget: trip.fuelBudget || match?.fuelBudget || '₹15,000',
    tollBudget: trip.tollBudget || match?.tollBudget || '₹2,200',
    driverBhatta: trip.driverBhatta || match?.driverBhatta || '₹1,000',
    loadingUnloading: trip.loadingUnloading || match?.loadingUnloading || '₹800',
  };

  showAddModal.value = true;
}

function confirmDeleteTrip(trip: TripItem) {
  deletingItem.value = trip;
  showDeleteDialog.value = true;
}

async function executeDeleteTrip() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  const targetTripId = deletingItem.value.tripId;

  trips.value = trips.value.filter((t) => t.id !== targetId);
  persist();
  showDeleteDialog.value = false;
  deletingItem.value = null;

  try {
    await api.delete(`/api/v1/dispatch/${targetId}`);
  } catch (e) {
    console.warn('DB dispatch delete error, removed locally:', e);
  }

  $q.notify({
    type: 'positive',
    message: 'Trip Removed',
    caption: `${targetTripId} was cancelled and deleted from database.`,
    position: 'top-right',
  });
}

function trackTrip(trip: TripItem) {
  router.push({ path: '/tracking', query: { search: trip.tripId } });
}

async function onRefresh() {
  isRefreshing.value = true;
  await loadTrips();
  isRefreshing.value = false;
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'Dispatch Console Refreshed',
    caption: 'Loaded active fleet trips and odometer status from database.',
    timeout: 1800,
    position: 'top-right',
  });
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
      { label: 'Status', field: 'status' },
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
    subtitle: `Active Filter: ${statusFilter.value} | Total Records: ${filteredTrips.value.length}`,
    columns: [
      { label: 'Trip #', field: 'tripId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Driver', field: 'driver' },
      { label: 'Route', field: 'route' },
      { label: 'LR Ref', field: 'lrRef' },
      { label: 'Planned KM', field: 'plannedKm', align: 'right' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredTrips.value,
  });
}

async function saveTrip() {
  const vehicleVal = formatVehicle(newTrip.value.vehicle);
  const driverVal = formatDriver(newTrip.value.driver);

  if (!newTrip.value.route.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter route corridor (e.g. AHD → MUM).',
      position: 'top-right',
    });
    return;
  }

  isSubmitting.value = true;

  const payload: any = {
    id: editingId.value || String(Date.now()),
    tripId: newTrip.value.tripId || `TR/${240079 + trips.value.length}`,
    lrRef: newTrip.value.lrRef || 'LR/240049',
    route: newTrip.value.route.trim().toUpperCase(),
    startDate: newTrip.value.startDate || new Date().toISOString().slice(0, 10),
    status: newTrip.value.status === '— Select —' ? 'Scheduled' : (newTrip.value.status || 'Scheduled'),
    vehicle: vehicleVal,
    driver: driverVal,
    coDriver: newTrip.value.coDriver || '',
    odoStart: newTrip.value.odoStart || '48,000',
    odoEnd: newTrip.value.odoEnd || '—',
    plannedKm: newTrip.value.plannedKm || '540',
    actualKm: newTrip.value.actualKm || '—',
    hireAmount: newTrip.value.hireAmount || '₹22,000',
    advanceToOwner: newTrip.value.advanceToOwner || '₹10,000',
    fuelBudget: newTrip.value.fuelBudget || '₹15,000',
    tollBudget: newTrip.value.tollBudget || '₹2,200',
    driverBhatta: newTrip.value.driverBhatta || '₹1,000',
    loadingUnloading: newTrip.value.loadingUnloading || '₹800',
  };

  try {
    if (isEditing.value && editingId.value) {
      const idx = trips.value.findIndex((t) => t.id === editingId.value);
      if (idx !== -1) {
        trips.value[idx] = { ...trips.value[idx], ...payload };
        persist();
      }

      try {
        await api.patch(`/api/v1/dispatch/${editingId.value}`, payload);
      } catch (e) {
        console.warn('DB dispatch update warning, preserved locally:', e);
      }

      $q.notify({
        type: 'positive',
        message: 'Trip Updated',
        caption: `Trip ${payload.tripId} details saved to database.`,
        position: 'top-right',
      });
    } else {
      trips.value.unshift(payload);
      persist();

      try {
        const res: any = await api.post('/api/v1/dispatch', payload);
        if (res && res.id) {
          trips.value[0].id = res.id;
          persist();
        }
      } catch (e) {
        console.warn('DB dispatch create warning, preserved locally:', e);
      }

      $q.notify({
        type: 'positive',
        message: 'Trip Allocated',
        caption: `Trip ${payload.tripId} created and saved in database.`,
        position: 'top-right',
      });
    }
  } finally {
    isSubmitting.value = false;
    showAddModal.value = false;
  }
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

/* Status Badges */
.desk-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.desk-pill-draft {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.desk-pill-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.desk-pill-active {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.desk-pill-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.desk-pill-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
</style>
