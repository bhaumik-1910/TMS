<template>
  <div class="tyre-operations-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="tire_repair" color="cyan" size="24px" />
          <span>Tyre Operations & Axle Life Tracking</span>
        </div>
        <div class="text-caption text-grey-5">
          Serial-level tyre inventory, axle rotation (FL, FR, Rear), retreading cycles &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> to add tyre
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
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
          <q-tooltip>Refresh Tyre Inventory</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportTyresPdf"
        >
          <q-tooltip>Download Tyre Registry in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportTyresCsv"
        >
          <q-tooltip>Export Tyre Inventory to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Add Tyre"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Register New Fleet Tyre (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Segmented Tab Toggle -->
    <div class="row items-center q-mb-md">
      <div class="view-mode-toggle">
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          <q-icon name="format_list_bulleted" size="15px" />
          <span>Tyre Registry ({{ tyres.length }})</span>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'events' }"
          @click="activeTab = 'events'"
        >
          <q-icon name="history" size="15px" />
          <span>Fit / Rotation / Wear Events ({{ events.length }})</span>
        </button>
      </div>
    </div>

    <!-- Tyre Content Container with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL TYRE INVENTORY</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ tyres.length }}</div>
        <div class="text-xs text-slate-400 font-mono">Radial & tubeless units</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">FITTED ON WHEELS</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">{{ fittedCount }}</div>
        <div class="text-xs text-cyan-300 font-mono">Commercial active fleet</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">IN STOCK / SPARE</div>
        <div class="text-3xl font-extrabold font-mono text-emerald-400 my-1">{{ stockCount }}</div>
        <div class="text-xs text-emerald-300 font-mono">Ready for replacement</div>
        <div class="accent-bar bg-emerald-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">RETREAD DUE</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ retreadDueCount }}</div>
        <div class="text-xs text-amber-300 font-mono">Tread depth &le; 4.0 mm</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="cyber-card p-3 mb-4">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Search serial / brand / vehicle / size... (Alt+F)"
            class="desk-search-input"
            style="min-width: 260px;"
          >
            <template #prepend>
              <q-icon name="search" size="18px" color="cyan" />
            </template>
            <template #append v-if="search">
              <q-icon
                name="cancel"
                size="18px"
                class="cursor-pointer text-slate-400 hover:text-white"
                @click.stop.prevent="search = ''"
                @mousedown.stop.prevent="search = ''"
              />
            </template>
          </q-input>

          <q-select
            v-model="brandFilter"
            :options="brandFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 150px;"
          />

          <q-select
            v-model="statusFilter"
            :options="statusFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 150px;"
          />
        </div>

        <div class="row items-center q-gutter-x-xs no-wrap">
          <q-btn
            flat
            dense
            icon="refresh"
            class="desk-grid-refresh-btn"
            :loading="isRefreshing"
            @click="onRefresh"
          >
            <q-tooltip>Refresh Tyre Register</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- TAB 1: Tyre Registry Cyber-Dark Table matching Image 1 & 2 -->
    <div v-if="activeTab === 'register'" class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing tyre records...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>SERIAL NO</th>
            <th>BRAND</th>
            <th>SIZE</th>
            <th>TYPE</th>
            <th>SUPPLIER</th>
            <th class="text-right">COST</th>
            <th>VEHICLE</th>
            <th class="text-center">AXLE POSITION</th>
            <th>FIT DATE</th>
            <th class="text-right">FIT ODOM</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTyres" :key="item.serial">
            <td class="font-mono font-bold text-cyan-400">{{ item.serial }}</td>
            <td class="font-bold text-white">{{ item.brand }}</td>
            <td class="font-mono text-slate-300">{{ item.size }}</td>
            <td class="text-slate-400">{{ item.type }}</td>
            <td class="text-slate-300">{{ item.supplier }}</td>
            <td class="font-mono text-right text-slate-200">₹{{ item.cost.toLocaleString() }}</td>
            <td class="font-mono text-white font-semibold">{{ item.vehicle }}</td>
            <td class="text-center">
              <span class="subtype-pill" :class="item.vehicle.includes('Stock') ? 'sub-driver' : 'sub-customer'">
                {{ item.position }}
              </span>
            </td>
            <td class="font-mono text-slate-400">{{ item.fitDate }}</td>
            <td class="font-mono text-right text-slate-400">{{ item.fitOdom.toLocaleString() }} km</td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="editTyre(item)">Edit</button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeleteTyre(item)"
                  title="Delete Tyre"
                >
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredTyres.length === 0">
            <td colspan="11" class="text-center py-12">
              <div class="column items-center justify-center text-center q-pa-xl">
                <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); margin: 0 auto;">
                  <q-icon name="search_off" size="28px" class="text-slate-400" />
                </div>
                <div class="text-subtitle1 text-weight-bold text-slate-200">No matching records found</div>
                <div class="text-caption text-slate-500 q-mt-xs">Try adjusting your search terms or clearing active filters.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TAB 2: Fit / Rotation / Wear Events Table -->
    <div v-else class="cyber-card table-wrap">
      <table class="cyber-table">
        <thead>
          <tr>
            <th>EVENT ID</th>
            <th>DATE</th>
            <th>TYRE SERIAL</th>
            <th>EVENT TYPE</th>
            <th>VEHICLE</th>
            <th>POSITION</th>
            <th class="text-right">ODOMETER</th>
            <th>TREAD DEPTH</th>
            <th>TECHNICIAN</th>
            <th>REMARKS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ev in events" :key="ev.id">
            <td class="font-mono font-bold text-cyan-400">{{ ev.id }}</td>
            <td class="font-mono text-slate-400">{{ ev.date }}</td>
            <td class="font-mono text-white font-semibold">{{ ev.serial }}</td>
            <td>
              <span class="subtype-pill" :class="ev.type === 'New Fitment' ? 'sub-fuel-station' : ev.type === 'Retread' ? 'sub-driver' : 'sub-customer'">
                {{ ev.type }}
              </span>
            </td>
            <td class="font-mono text-white">{{ ev.vehicle }}</td>
            <td class="font-mono text-cyan-3">{{ ev.position }}</td>
            <td class="font-mono text-right text-slate-300">{{ ev.odometer.toLocaleString() }} km</td>
            <td class="font-mono text-amber-300 font-bold">{{ ev.treadDepth }} mm</td>
            <td class="text-slate-300">{{ ev.technician }}</td>
            <td class="text-slate-400">{{ ev.remarks }}</td>
          </tr>
        </tbody>
      </table>
    </div>

      <!-- Inner Loading Overlay on Tyre Refresh -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Refreshing Tyre Inventory & Axle Health...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Updating tread depth, retread schedules & serial status
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Record / Edit Tyre Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? `Edit Tyre Record — ${editingItem?.serial}` : 'Register New Fleet Tyre'"
      width="580px"
      :confirm-label="isEditing ? 'Update Tyre' : 'Save Tyre'"
      cancel-label="Cancel"
      @confirm="saveTyre"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveTyre">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Tyre Serial Number" required shortcut="1">
              <q-input
                v-model="form.serial"
                dense
                outlined
                placeholder="e.g. TYR-MRF-89105"
                :readonly="isEditing"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Tyre Brand & Model" required shortcut="2">
              <DeskCombo
                v-model="form.brand"
                :options="['MRF Steel Muscle', 'Apollo EnduRace', 'JK Tyre JetXtra', 'CEAT Winmile', 'Bridgestone M751']"
                placeholder="Select or enter brand..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Tyre Size" required shortcut="3">
              <DeskCombo
                v-model="form.size"
                :options="['295/80 R22.5', '10.00 R20', '11.00 R20', '215/75 R17.5']"
                placeholder="Select tyre size..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Tyre Construction" required shortcut="4">
              <DeskCombo
                v-model="form.type"
                :options="['Radial Tubeless', 'Radial Nylon', 'Bias Ply', 'All-Steel Radial']"
                placeholder="Select type..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Supplier / Vendor" required shortcut="5">
              <DeskCombo
                v-model="form.supplier"
                :options="['Shree Tyre Corp', 'Gujarat Rubber Works', 'Apollo Tyres Depot', 'National Retreaders']"
                placeholder="Select supplier..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Purchase Cost (₹)" required shortcut="6">
              <DeskNumberInput
                v-model="form.cost"
                placeholder="e.g. 24500"
                :step="500"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Assigned Vehicle" required shortcut="7">
              <DeskCombo
                v-model="form.vehicle"
                :options="vehicleOptions"
                placeholder="Select vehicle..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Axle Position" required shortcut="8">
              <DeskCombo
                v-model="form.position"
                :options="positionOptions"
                placeholder="Select axle position..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Fitment Date" required shortcut="9">
              <DeskDateInput
                v-model="form.fitDate"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Fitment Odometer (KM)">
              <DeskNumberInput
                v-model="form.fitOdom"
                placeholder="e.g. 42000"
                :step="1000"
                :min="0"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Confirm Delete Tyre Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Tyre Record"
      icon="warning"
      width="480px"
      confirm-label="Delete Tyre"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteTyre"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Tyre Unit
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.serial }}</span>
          ({{ deletingItem?.brand }})?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the tyre from vehicle axle configurations and wear history.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskNumberInput,
  DeskDateInput,
} from '../../framework';

export interface TyreItem {
  serial: string;
  brand: string;
  size: string;
  type: string;
  supplier: string;
  cost: number;
  vehicle: string;
  position: string;
  fitDate: string;
  fitOdom: number;
  treadDepth?: number;
}

export interface TyreEvent {
  id: string;
  date: string;
  serial: string;
  type: string;
  vehicle: string;
  position: string;
  odometer: number;
  treadDepth: number;
  technician: string;
  remarks: string;
}

const notify = useAppNotify();
const activeTab = ref<'register' | 'events'>('register');
const search = ref('');
const brandFilter = ref('ALL');
const statusFilter = ref('ALL');

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<TyreItem | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<TyreItem | null>(null);

const vehicleOptions = [
  'GJ-01-AB-1122',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
  'Stock / In Warehouse',
];

const positionOptions = [
  'FL (Front Left)',
  'FR (Front Right)',
  'R1-O (Rear Outer)',
  'R1-I (Rear Inner)',
  'R2-O (Axle 2 Outer)',
  'R2-I (Axle 2 Inner)',
  'Stepney / Spare',
];

const brandFilterOptions = [
  { label: 'All Brands', value: 'ALL' },
  { label: 'MRF', value: 'MRF' },
  { label: 'Apollo', value: 'Apollo' },
  { label: 'JK Tyre', value: 'JK Tyre' },
  { label: 'CEAT', value: 'CEAT' },
];

const statusFilterOptions = [
  { label: 'All Placements', value: 'ALL' },
  { label: 'Fitted on Vehicle', value: 'FITTED' },
  { label: 'Warehouse Stock / Spare', value: 'STOCK' },
];

const defaultTyres: TyreItem[] = [
  { serial: 'TYR-MRF-89101', brand: 'MRF Steel Muscle', size: '295/80 R22.5', type: 'Radial Tubeless', supplier: 'Shree Tyre Corp', cost: 24500, vehicle: 'GJ-01-AB-1122', position: 'FL (Front Left)', fitDate: '2026-05-14', fitOdom: 42000, treadDepth: 8.5 },
  { serial: 'TYR-MRF-89102', brand: 'MRF Steel Muscle', size: '295/80 R22.5', type: 'Radial Tubeless', supplier: 'Shree Tyre Corp', cost: 24500, vehicle: 'GJ-01-AB-1122', position: 'FR (Front Right)', fitDate: '2026-05-14', fitOdom: 42000, treadDepth: 8.2 },
  { serial: 'TYR-APL-77401', brand: 'Apollo EnduRace', size: '10.00 R20', type: 'Radial Nylon', supplier: 'Gujarat Rubber Works', cost: 21800, vehicle: 'MH-14-DX-9000', position: 'R1-O (Rear Outer)', fitDate: '2026-06-18', fitOdom: 78500, treadDepth: 6.0 },
  { serial: 'TYR-JKT-66504', brand: 'JK Tyre JetXtra', size: '10.00 R20', type: 'Radial', supplier: 'National Retreaders', cost: 18200, vehicle: 'RJ-13-TR-7788', position: 'R2-I (Rear Inner)', fitDate: '2026-08-02', fitOdom: 104200, treadDepth: 3.8 },
  { serial: 'TYR-APL-77402', brand: 'Apollo EnduRace', size: '10.00 R20', type: 'Radial Nylon', supplier: 'Apollo Tyres Depot', cost: 21800, vehicle: 'Stock / In Warehouse', position: 'Stepney / Spare', fitDate: '2026-09-10', fitOdom: 0, treadDepth: 14.5 },
];

const defaultEvents: TyreEvent[] = [
  { id: 'EVT/2401', date: '2026-10-22', serial: 'TYR-JKT-66504', type: 'Retread Due', vehicle: 'RJ-13-TR-7788', position: 'R2-I', odometer: 104200, treadDepth: 3.8, technician: 'Mukesh Sharma', remarks: 'Tread worn below safety limit. Sent for cold retread.' },
  { id: 'EVT/2400', date: '2026-09-10', serial: 'TYR-APL-77402', type: 'Received in Stock', vehicle: 'Stock / In Warehouse', position: 'Spare', odometer: 0, treadDepth: 14.5, technician: 'Rajesh Bhai', remarks: 'New tyre received from Apollo Tyres Depot.' },
  { id: 'EVT/2399', date: '2026-06-18', serial: 'TYR-APL-77401', type: 'New Fitment', vehicle: 'MH-14-DX-9000', position: 'R1-O', odometer: 78500, treadDepth: 14.0, technician: 'Mukesh Sharma', remarks: 'Replaced punctured tyre on rear axle.' },
];

const tyres = ref<TyreItem[]>([]);
const events = ref<TyreEvent[]>(defaultEvents);

onMounted(() => {
  const saved = localStorage.getItem('tms_tyre_operations');
  if (saved) {
    try {
      tyres.value = JSON.parse(saved);
    } catch {
      tyres.value = defaultTyres;
    }
  } else {
    tyres.value = defaultTyres;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_tyre_operations', JSON.stringify(tyres.value));
}

const form = ref<TyreItem>({
  serial: 'TYR-MRF-89105',
  brand: 'MRF Steel Muscle',
  size: '295/80 R22.5',
  type: 'Radial Tubeless',
  supplier: 'Shree Tyre Corp',
  cost: 24500,
  vehicle: 'GJ-01-AB-1122',
  position: 'FL (Front Left)',
  fitDate: new Date().toISOString().slice(0, 10),
  fitOdom: 48000,
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Tyre Register Refreshed',
      caption: 'Tyre assets and axle life synced.',
      timeout: 1800,
      position: 'top-right',
    });
  }, 650);
}

const filteredTyres = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  return tyres.value.filter((t) => {
    const matchSearch =
      !q ||
      t.serial.toLowerCase().includes(q) ||
      t.brand.toLowerCase().includes(q) ||
      t.vehicle.toLowerCase().includes(q) ||
      t.size.toLowerCase().includes(q);
    const matchBrand = brandFilter.value === 'ALL' || t.brand.toLowerCase().includes(brandFilter.value.toLowerCase());
    const matchStatus =
      statusFilter.value === 'ALL' ||
      (statusFilter.value === 'STOCK' && t.vehicle.includes('Stock')) ||
      (statusFilter.value === 'FITTED' && !t.vehicle.includes('Stock'));
    return matchSearch && matchBrand && matchStatus;
  });
});

const fittedCount = computed(() => {
  return tyres.value.filter((t) => !t.vehicle.includes('Stock')).length;
});

const stockCount = computed(() => {
  return tyres.value.filter((t) => t.vehicle.includes('Stock')).length;
});

const retreadDueCount = computed(() => {
  return tyres.value.filter((t) => (t.treadDepth || 10) <= 4.0).length;
});

function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  const seq = 89105 + tyres.value.length;
  form.value = {
    serial: `TYR-MRF-${seq}`,
    brand: 'MRF Steel Muscle',
    size: '295/80 R22.5',
    type: 'Radial Tubeless',
    supplier: 'Shree Tyre Corp',
    cost: 24500,
    vehicle: 'GJ-01-AB-1122',
    position: 'FL (Front Left)',
    fitDate: new Date().toISOString().slice(0, 10),
    fitOdom: 45000,
    treadDepth: 14.0,
  };
  showDialog.value = true;
}

function editTyre(item: TyreItem) {
  isEditing.value = true;
  editingItem.value = item;
  form.value = { ...item };
  showDialog.value = true;
}

function saveTyre() {
  if (!form.value.serial || !form.value.brand || !form.value.cost) {
    notify.warning('Please enter serial number, brand, and cost.');
    return;
  }

  if (isEditing.value && editingItem.value) {
    const idx = tyres.value.findIndex((t) => t.serial === editingItem.value!.serial);
    if (idx !== -1) {
      tyres.value[idx] = { ...form.value };
      persist();
      notify.success(`Tyre ${editingItem.value.serial} updated.`);
    }
  } else {
    tyres.value.unshift({ ...form.value });
    persist();
    notify.success(`Tyre ${form.value.serial} registered successfully.`);
  }

  showDialog.value = false;
}

function confirmDeleteTyre(item: TyreItem) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteTyre() {
  if (!deletingItem.value) return;
  tyres.value = tyres.value.filter((t) => t.serial !== deletingItem.value!.serial);
  persist();
  notify.success(`Tyre ${deletingItem.value.serial} deleted.`);
  showDeleteDialog.value = false;
}

function exportTyresCsv() {
  exportToCsv(
    'tyre_inventory_registry',
    [
      { label: 'Serial No', field: 'serial' },
      { label: 'Brand', field: 'brand' },
      { label: 'Size', field: 'size' },
      { label: 'Type', field: 'type' },
      { label: 'Supplier', field: 'supplier' },
      { label: 'Cost', field: 'cost' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Position', field: 'position' },
      { label: 'Fit Date', field: 'fitDate' },
      { label: 'Fit Odometer', field: 'fitOdom' },
    ],
    filteredTyres.value,
  );
  notify.success(`${filteredTyres.value.length} tyre records exported to CSV.`);
}

function exportTyresPdf() {
  exportToPdf({
    title: 'Fleet Tyre Inventory & Axle Operations',
    subtitle: `Total Tyre Units: ${filteredTyres.value.length}`,
    columns: [
      { label: 'Serial', field: 'serial' },
      { label: 'Brand', field: 'brand' },
      { label: 'Size', field: 'size' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Position', field: 'position' },
      { label: 'Cost', field: 'cost', align: 'right' },
      { label: 'Fit Date', field: 'fitDate' },
    ],
    rows: filteredTyres.value,
  });
}
</script>

<style scoped>
.tyre-operations-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #00f2fe;
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
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

/* Custom Segmented View Toggle */
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

/* Cyber Card & Table matching Reference Image 1 & 2 */
.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
}

.cyber-table th {
  background: rgba(255, 255, 255, 0.02);
  color: #00f2fe;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-left: none !important;
  border-right: none !important;
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-left: none !important;
  border-right: none !important;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.cyber-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
}

.subtype-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.sub-customer {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.sub-fuel-station {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.sub-driver {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
}

.sub-service-centre {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}
</style>
