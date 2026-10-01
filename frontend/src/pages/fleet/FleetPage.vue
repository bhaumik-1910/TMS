<template>
  <div class="vehicle-master-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header with Title & Action Controls in Single Row -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div class="column q-gutter-y-xs">
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm no-wrap">
          <q-icon name="local_shipping" color="cyan" size="24px" />
          <span>Vehicle Master & Fleet Registry</span>
        </div>
        <div class="text-caption text-grey-5">
          Enterprise fleet assets, ownership, statutory fitness and compliance tracking
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row items-center q-gutter-x-sm no-wrap">
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
          <q-tooltip>Refresh Fleet Registry</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="cloud_sync"
          label="Vahan Sync"
          class="desk-btn-secondary"
          @click="showImportModal = true"
        >
          <q-tooltip>Batch sync RC books and certificates from Vahan Portal</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportVehiclesPdf"
        >
          <q-tooltip>Download Fleet Registry in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportVehiclesCsv"
        >
          <q-tooltip>Export Fleet Registry to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Vehicle (Ctrl+N)"
          class="desk-btn-primary"
          @click="openAddModal"
        >
          <q-tooltip>Add New Fleet Vehicle (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Fleet Content Container with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL FLEET</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ vehicles.length }}</div>
        <div class="text-xs text-slate-400 font-mono">Active {{ activeCount }} &bull; Idle {{ idleCount }}</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">FLEET UTILISATION</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">86%</div>
        <div class="text-xs text-slate-400 font-mono">Current billing month</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">AVG FUEL MILEAGE</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">5.7 <span class="text-sm font-normal text-grey-4">KM/L</span></div>
        <div class="text-xs text-emerald-400 font-mono">+0.2 vs target (5.5)</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">COMPLIANCE ALERTS</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ complianceAlertCount }}</div>
        <div class="text-xs text-amber-300 font-mono">Fitness / Insurance expiries</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Desk Keyboard Data Table -->
    <DeskDataTable
      ref="gridRef"
      title="Fleet Vehicles Register"
      :rows="filteredVehicles"
      :columns="tableColumns"
      row-key="id"
      selection-mode="none"
      :loading="isRefreshing"
      :allow-create="false"
      :allow-export="false"
      :allow-refresh="true"
      :allow-delete="true"
      @create="openAddModal"
      @edit="editVehicle"
      @delete="confirmDeleteVehicle"
      @row-dblclick="editVehicle"
      @refresh="onRefresh"
    >
      <!-- Top Filters in Table Toolbar matching Reference Cyber-Dark Dropdowns -->
      <template #top-filters>
        <q-select
          v-model="typeFilter"
          :options="typeFilterOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 140px;"
        />
        <q-select
          v-model="ownerFilter"
          :options="ownerFilterOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 140px;"
        />
        <q-select
          v-model="statusFilter"
          :options="statusFilterOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 140px;"
        />
      </template>

      <!-- Custom Body Cell: Registration No -->
      <template #body-cell-regNo="{ value }">
        <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Make & Model -->
      <template #body-cell-makeModel="{ value }">
        <span class="text-white text-weight-bold">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Vehicle Type -->
      <template #body-cell-type="{ value }">
        <span class="subtype-pill" :class="getTypePillClass(value)">
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Ownership -->
      <template #body-cell-owner="{ value }">
        <span :class="value === 'Owned' ? 'text-slate-200' : 'text-amber-300 font-semibold'">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Capacity -->
      <template #body-cell-capacity="{ value }">
        <span class="font-mono text-slate-300">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Fitness Certificate -->
      <template #body-cell-fitness="{ value }">
        <span
          class="expiry-pill"
          :class="isExpired(value) ? 'pill-expired' : 'pill-valid'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Insurance -->
      <template #body-cell-insurance="{ value }">
        <span
          class="expiry-pill"
          :class="isExpired(value) ? 'pill-expired' : 'pill-valid'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: PUC -->
      <template #body-cell-puc="{ value }">
        <span
          class="expiry-pill"
          :class="isExpired(value) ? 'pill-expired' : 'pill-valid'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Status -->
      <template #body-cell-status="{ value }">
        <span
          class="desk-pill"
          :class="value === 'Active' ? 'desk-pill-success' : value === 'Maintenance' ? 'desk-pill-warning' : 'desk-pill-draft'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Actions -->
      <template #body-cell-actions="{ props }">
        <div class="row items-center q-gutter-x-xs no-wrap justify-center">
          <button class="btn-table-action" @click.stop="editVehicle(props.row)">Edit</button>
          <button
            class="btn-table-icon btn-table-icon--danger"
            @click.stop="confirmDeleteVehicle(props.row)"
            title="Delete Vehicle"
          >
            <q-icon name="delete" size="14px" />
          </button>
        </div>
      </template>
    </DeskDataTable>

      <!-- Inner Loading Overlay on Fleet Refresh -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Refreshing Vehicle Master & Fleet Registry...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Updating statutory fitness, compliance alerts & odometer logs
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Create / Edit Vehicle Desk Dialog matching Image 2 (Record New Fuel Entry) -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Vehicle Master — ${editingItem?.regNo}` : 'Add Vehicle to Master'"
      width="580px"
      :confirm-label="isEditing ? 'Update Vehicle' : 'Save Vehicle'"
      cancel-label="Cancel"
      @confirm="saveVehicle"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveVehicle">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Registration No" required shortcut="1">
              <q-input
                v-model="newVeh.regNo"
                dense
                outlined
                placeholder="e.g. GJ-01-XX-9999"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Make & Model" required shortcut="2">
              <q-input
                v-model="newVeh.makeModel"
                dense
                outlined
                placeholder="e.g. Tata Prima 4928"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Type" required shortcut="3">
              <DeskCombo
                v-model="newVeh.type"
                :options="['HCV', 'LCV', 'Trailer', 'Container']"
                placeholder="Select type..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Ownership" required shortcut="4">
              <DeskCombo
                v-model="newVeh.owner"
                :options="['Owned', 'Attached']"
                placeholder="Select ownership..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Capacity (MT)" required shortcut="5">
              <q-input
                v-model="newVeh.capacity"
                dense
                outlined
                placeholder="16 MT"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Status" required shortcut="6">
              <DeskCombo
                v-model="newVeh.status"
                :options="['Active', 'Maintenance', 'Idle']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-4">
            <DeskField label="Fitness Expiry" required shortcut="7">
              <DeskDateInput
                v-model="newVeh.fitness"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-4">
            <DeskField label="Insurance Expiry" required shortcut="8">
              <DeskDateInput
                v-model="newVeh.insurance"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-4">
            <DeskField label="PUC Expiry" required shortcut="9">
              <DeskDateInput
                v-model="newVeh.puc"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Vehicle"
      icon="warning"
      width="480px"
      confirm-label="Delete Vehicle"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteVehicle"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete vehicle
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.regNo }}</span>
          ({{ deletingItem?.makeModel }})?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the vehicle asset from fleet allocation, tyre operations, and maintenance records.
        </div>
      </div>
    </DeskDialog>

    <!-- Excel / Vahan Batch Sync Modal -->
    <DeskDialog
      v-model="showImportModal"
      title="Vahan Portal Batch Sync"
      width="520px"
      confirm-label="Start Vahan Sync"
      cancel-label="Cancel"
      @confirm="runVahanSync"
      @cancel="showImportModal = false"
    >
      <div class="q-py-sm">
        <div class="text-caption text-slate-400 q-mb-md">
          Connects to the National Vahan & Sarathi API Gateway to automatically fetch and update vehicle registration validity, fitness certificates, and insurance policies.
        </div>

        <div class="p-3 bg-[#070c18] rounded-lg border border-cyan-500/30 row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="cloud_done" color="cyan" size="24px" />
            <div>
              <div class="text-weight-bold text-white">Vahan API Gateway 2.0</div>
              <div class="text-caption text-grey-5 font-mono">Status: Connected &bull; Latency: 12ms</div>
            </div>
          </div>
          <span class="desk-pill desk-pill-success">ONLINE</span>
        </div>

        <div class="text-xs text-grey-4 font-mono">
          Vehicles scheduled for sync: <strong>{{ vehicles.length }} assets</strong>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import {
  DeskDataTable,
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskDateInput,
  GridColumn,
} from '../../framework';

const $q = useQuasar();
const gridRef = ref<any>(null);

const showImportModal = ref(false);
const isSyncing = ref(false);

const showAddModal = ref(false);
const isEditing = ref(false);
const editingItem = ref<Vehicle | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<Vehicle | null>(null);

export interface Vehicle {
  id: string;
  regNo: string;
  makeModel: string;
  type: 'HCV' | 'LCV' | 'Trailer' | 'Container';
  owner: 'Owned' | 'Attached';
  capacity: string;
  fitness: string;
  insurance: string;
  puc: string;
  status: 'Active' | 'Maintenance' | 'Idle';
}

const typeFilter = ref('ALL');
const ownerFilter = ref('ALL');
const statusFilter = ref('ALL');

const typeFilterOptions = [
  { label: 'All Types', value: 'ALL' },
  { label: 'HCV', value: 'HCV' },
  { label: 'LCV', value: 'LCV' },
  { label: 'Trailer', value: 'Trailer' },
  { label: 'Container', value: 'Container' },
];

const ownerFilterOptions = [
  { label: 'All Owners', value: 'ALL' },
  { label: 'Owned', value: 'Owned' },
  { label: 'Attached', value: 'Attached' },
];

const statusFilterOptions = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: 'Active' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Idle', value: 'Idle' },
];

const defaultVehicles: Vehicle[] = [
  {
    id: '1',
    regNo: 'GJ-01-AB-1122',
    makeModel: 'Tata Prima 4928.S',
    type: 'HCV',
    owner: 'Owned',
    capacity: '16 MT',
    fitness: '2026-01-18',
    insurance: '2025-01-10', // Expired
    puc: '2025-03-10',
    status: 'Active',
  },
  {
    id: '2',
    regNo: 'GJ-01-AC-3444',
    makeModel: 'Ashok Leyland Dost+',
    type: 'LCV',
    owner: 'Attached',
    capacity: '9 MT',
    fitness: '2023-11-02', // Expired
    insurance: '2026-03-15',
    puc: '2024-11-01',
    status: 'Maintenance',
  },
  {
    id: '3',
    regNo: 'MH-14-DX-9000',
    makeModel: 'Tata Signa 4825.TK',
    type: 'Trailer',
    owner: 'Owned',
    capacity: '25 MT',
    fitness: '2025-10-30',
    insurance: '2026-03-10',
    puc: '2025-10-30',
    status: 'Active',
  },
  {
    id: '4',
    regNo: 'RJ-13-TR-7788',
    makeModel: 'Mahindra Furio 14',
    type: 'Container',
    owner: 'Attached',
    capacity: '32 MT',
    fitness: '2026-01-18',
    insurance: '2026-03-10',
    puc: '2026-01-18',
    status: 'Active',
  },
];

const vehicles = ref<Vehicle[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('tms_fleet_vehicles');
  if (saved) {
    try {
      vehicles.value = JSON.parse(saved);
    } catch {
      vehicles.value = defaultVehicles;
    }
  } else {
    vehicles.value = defaultVehicles;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_fleet_vehicles', JSON.stringify(vehicles.value));
}

const tableColumns: GridColumn[] = [
  { name: 'regNo', label: 'REG NO', field: 'regNo', align: 'left', sortable: true },
  { name: 'makeModel', label: 'MAKE / MODEL', field: 'makeModel', align: 'left', sortable: true },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left', sortable: true },
  { name: 'owner', label: 'OWNERSHIP', field: 'owner', align: 'left', sortable: true },
  { name: 'capacity', label: 'CAPACITY', field: 'capacity', align: 'left' },
  { name: 'fitness', label: 'FITNESS', field: 'fitness', align: 'left', sortable: true },
  { name: 'insurance', label: 'INSURANCE', field: 'insurance', align: 'left', sortable: true },
  { name: 'puc', label: 'PUC', field: 'puc', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'center' },
];

const newVeh = ref<Omit<Vehicle, 'id'>>({
  regNo: '',
  makeModel: '',
  type: 'HCV',
  owner: 'Owned',
  capacity: '16 MT',
  fitness: '2027-01-01',
  insurance: '2027-01-01',
  puc: '2027-01-01',
  status: 'Active',
});

const activeCount = computed(() => vehicles.value.filter((v) => v.status === 'Active').length);
const idleCount = computed(() => vehicles.value.filter((v) => v.status === 'Idle').length);
const complianceAlertCount = computed(() => {
  return vehicles.value.filter((v) => isExpired(v.fitness) || isExpired(v.insurance) || isExpired(v.puc)).length;
});

function isExpired(dateStr: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function getTypePillClass(type: string) {
  switch (type) {
    case 'HCV':
      return 'sub-customer';
    case 'LCV':
      return 'sub-fuel-station';
    case 'Trailer':
      return 'sub-driver';
    case 'Container':
      return 'sub-service-centre';
    default:
      return 'sub-customer';
  }
}

const filteredVehicles = computed(() => {
  return vehicles.value.filter((v) => {
    const matchType = typeFilter.value === 'ALL' || v.type === typeFilter.value;
    const matchOwner = ownerFilter.value === 'ALL' || v.owner === ownerFilter.value;
    const matchStatus = statusFilter.value === 'ALL' || v.status === statusFilter.value;
    return matchType && matchOwner && matchStatus;
  });
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Fleet Master Refreshed',
      caption: 'Vehicle records and compliance status synced.',
      timeout: 1800,
      position: 'top-right',
    });
  }, 650);
}

function openAddModal() {
  isEditing.value = false;
  editingItem.value = null;
  newVeh.value = {
    regNo: `GJ-01-TR-${Math.floor(1000 + Math.random() * 9000)}`,
    makeModel: 'Tata Prima 4928.S',
    type: 'HCV',
    owner: 'Owned',
    capacity: '16 MT',
    fitness: '2027-01-01',
    insurance: '2027-01-01',
    puc: '2027-01-01',
    status: 'Active',
  };
  showAddModal.value = true;
}

function editVehicle(item: Vehicle) {
  isEditing.value = true;
  editingItem.value = item;
  newVeh.value = {
    regNo: item.regNo,
    makeModel: item.makeModel,
    type: item.type,
    owner: item.owner,
    capacity: item.capacity,
    fitness: item.fitness,
    insurance: item.insurance,
    puc: item.puc,
    status: item.status,
  };
  showAddModal.value = true;
}

function saveVehicle() {
  if (!newVeh.value.regNo || !newVeh.value.makeModel) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter vehicle registration number and make/model.',
      position: 'top-right',
    });
    return;
  }

  if (isEditing.value && editingItem.value) {
    const idx = vehicles.value.findIndex((v) => v.id === editingItem.value!.id);
    if (idx !== -1) {
      vehicles.value[idx] = {
        ...vehicles.value[idx],
        ...newVeh.value,
        regNo: newVeh.value.regNo.toUpperCase(),
      };
      persist();
      $q.notify({
        type: 'positive',
        message: 'Vehicle Updated',
        caption: `Vehicle ${editingItem.value.regNo} updated successfully.`,
        position: 'top-right',
      });
    }
  } else {
    const newEntry: Vehicle = {
      id: String(Date.now()),
      ...newVeh.value,
      regNo: newVeh.value.regNo.toUpperCase(),
    };
    vehicles.value.unshift(newEntry);
    persist();
    $q.notify({
      type: 'positive',
      message: 'Vehicle Added',
      caption: `New vehicle ${newEntry.regNo} added to fleet master.`,
      position: 'top-right',
    });
  }

  showAddModal.value = false;
}

function confirmDeleteVehicle(item: Vehicle) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteVehicle() {
  if (!deletingItem.value) return;
  vehicles.value = vehicles.value.filter((v) => v.id !== deletingItem.value!.id);
  persist();
  $q.notify({
    type: 'negative',
    message: 'Vehicle Deleted',
    caption: `Vehicle ${deletingItem.value.regNo} removed from master.`,
    position: 'top-right',
  });
  showDeleteDialog.value = false;
  deletingItem.value = null;
}

function runVahanSync() {
  isSyncing.value = true;
  setTimeout(() => {
    isSyncing.value = false;
    showImportModal.value = false;
    $q.notify({
      type: 'positive',
      message: 'Vahan Portal Batch Sync Complete',
      caption: 'RC Books, Fitness and Insurance certificates updated.',
      position: 'top-right',
    });
  }, 1000);
}

function exportVehiclesCsv() {
  exportToCsv(
    'fleet_vehicles_master',
    [
      { label: 'Registration No', field: 'regNo' },
      { label: 'Make & Model', field: 'makeModel' },
      { label: 'Type', field: 'type' },
      { label: 'Ownership', field: 'owner' },
      { label: 'Capacity', field: 'capacity' },
      { label: 'Fitness Expiry', field: 'fitness' },
      { label: 'Insurance Expiry', field: 'insurance' },
      { label: 'PUC Expiry', field: 'puc' },
      { label: 'Status', field: 'status' },
    ],
    filteredVehicles.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Fleet Master Exported',
    caption: `${filteredVehicles.value.length} vehicles exported to CSV.`,
    position: 'top-right',
  });
}

function exportVehiclesPdf() {
  exportToPdf({
    title: 'Fleet Vehicles Registry Master',
    subtitle: `Total Fleet: ${filteredVehicles.value.length} assets`,
    columns: [
      { label: 'Reg No', field: 'regNo' },
      { label: 'Make/Model', field: 'makeModel' },
      { label: 'Type', field: 'type' },
      { label: 'Ownership', field: 'owner' },
      { label: 'Capacity', field: 'capacity' },
      { label: 'Fitness', field: 'fitness' },
      { label: 'Insurance', field: 'insurance' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredVehicles.value,
  });
}
</script>

<style scoped>
.vehicle-master-page {
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

.expiry-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-family: var(--desk-font-mono, monospace);
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
}

.pill-valid {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.pill-expired {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
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
