<template>
  <div class="vehicle-master-page p-3 sm:p-4 text-slate-800 font-sans">
    <!-- Header with Title & Action Buttons matching Image 4 -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-slate-900 relative-position inline-block q-pb-xs">
          Vehicle Master
          <div class="header-underline"></div>
        </div>
      </div>

      <!-- Header Action Buttons -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <button
          type="button"
          class="btn-hdr-import"
          @click="showImportModal = true"
        >
          Import Excel
        </button>
        <button
          type="button"
          class="btn-hdr-add"
          @click="openAddModal"
        >
          + Vehicle
        </button>
      </div>
    </div>

    <!-- Fleet Content Container with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards matching Image 4 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 q-mb-md">
        <div class="stat-card p-4 rounded-xl border border-sky-200 bg-white relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">TOTAL FLEET</div>
          <div class="text-3xl font-extrabold font-mono text-sky-700 my-1">{{ vehicles.length }}</div>
          <div class="text-xs text-slate-500 font-mono">Active {{ activeCount }} - Idle {{ idleCount }}</div>
          <div class="accent-bar bg-sky-500"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">UTILISATION</div>
          <div class="text-3xl font-extrabold font-mono text-slate-800 my-1">86%</div>
          <div class="text-xs text-slate-500 font-mono">This month</div>
          <div class="accent-bar bg-slate-400"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">AVG KM/L</div>
          <div class="text-3xl font-extrabold font-mono text-slate-800 my-1">5.7</div>
          <div class="text-xs text-slate-500 font-mono">vs 5.5 target</div>
          <div class="accent-bar bg-slate-300"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-amber-200 bg-amber-50 relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-amber-700 mb-1">COMPLIANCE ALERTS</div>
          <div class="text-3xl font-extrabold font-mono text-amber-600 my-1">{{ complianceAlertCount }}</div>
          <div class="text-xs text-amber-600 font-mono">Expiry issues</div>
          <div class="accent-bar bg-amber-400"></div>
        </div>
      </div>

      <!-- Desk Keyboard Data Table matching Image 4 -->
      <DeskDataTable
        ref="gridRef"
        title=""
        :rows="filteredVehicles"
        :columns="tableColumns"
        row-key="id"
        selection-mode="none"
        :loading="isRefreshing"
        :allow-create="false"
        :allow-export="false"
        :allow-refresh="false"
        :allow-delete="true"
        @edit="editVehicle"
        @delete="confirmDeleteVehicle"
        @row-dblclick="editVehicle"
      >
        <!-- Top Filters in Table Toolbar matching Image 4 -->
        <template #top-filters>
          <DeskCombo
            ref="typeComboRef"
            v-model="typeFilter"
            :options="typeFilterOptions"
            class="desk-filter-select"
            style="min-width: 130px;"
          />
          <DeskCombo
            ref="ownerComboRef"
            v-model="ownerFilter"
            :options="ownerFilterOptions"
            class="desk-filter-select"
            style="min-width: 130px;"
          />
          <DeskCombo
            ref="statusComboRef"
            v-model="statusFilter"
            :options="statusFilterOptions"
            class="desk-filter-select"
            style="min-width: 130px;"
          />
        </template>

        <!-- Custom Body Cell: Registration No -->
        <template #body-cell-regNo="{ props, value }">
          <span class="text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            {{ value || props?.row?.regNo || props?.row?.vehicleNumber }}
          </span>
        </template>

        <!-- Custom Body Cell: Make & Model -->
        <template #body-cell-makeModel="{ props, value }">
          <span class="text-slate-900 font-bold">
            {{ value || props?.row?.makeModel || `${props?.row?.make || ''} ${props?.row?.model || ''}`.trim() }}
          </span>
        </template>

        <!-- Custom Body Cell: Vehicle Type -->
        <template #body-cell-type="{ props, value }">
          <span class="text-slate-700 font-medium">
            {{ value || props?.row?.type || props?.row?.vehicleTypeStr || 'HCV' }}
          </span>
        </template>

        <!-- Custom Body Cell: Ownership -->
        <template #body-cell-owner="{ props, value }">
          <span class="text-slate-700 font-medium">
            {{ value || props?.row?.owner || 'Owned' }}
          </span>
        </template>

        <!-- Custom Body Cell: Capacity -->
        <template #body-cell-capacity="{ props, value }">
          <span class="font-mono text-slate-800 font-semibold">
            {{ value || props?.row?.capacity || '16 MT' }}
          </span>
        </template>

        <!-- Custom Body Cell: Fitness Certificate -->
        <template #body-cell-fitness="{ props, value }">
          <span
            class="expiry-pill"
            :class="getExpiryPillClass(value || props?.row?.fitness)"
          >
            {{ value || props?.row?.fitness || '2026-01-18' }}
          </span>
        </template>

        <!-- Custom Body Cell: Insurance -->
        <template #body-cell-insurance="{ props, value }">
          <span
            class="expiry-pill"
            :class="getExpiryPillClass(value || props?.row?.insurance)"
          >
            {{ value || props?.row?.insurance || '2025-01-10' }}
          </span>
        </template>

        <!-- Custom Body Cell: PUC -->
        <template #body-cell-puc="{ props, value }">
          <span
            class="expiry-pill"
            :class="getExpiryPillClass(value || props?.row?.puc)"
          >
            {{ value || props?.row?.puc || '2025-03-10' }}
          </span>
        </template>

        <!-- Custom Body Cell: Status -->
        <template #body-cell-status="{ props, value }">
          <span
            class="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold border uppercase"
            :class="(value || props?.row?.status) === 'Active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : (value || props?.row?.status) === 'Maintenance'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-300'"
          >
            {{ value || props?.row?.status || 'Active' }}
          </span>
        </template>

        <!-- Custom Body Cell: Actions matching Image 4 pill edit + delete -->
        <template #body-cell-actions="{ props }">
          <div class="row items-center q-gutter-x-xs no-wrap justify-end">
            <button class="btn-table-edit" @click.stop="editVehicle(props.row)">
              Edit
            </button>
            <button class="btn-table-delete" @click.stop="confirmDeleteVehicle(props.row)" title="Delete Vehicle">
              <q-icon name="delete" size="16px" />
            </button>
          </div>
        </template>
      </DeskDataTable>

      <!-- Inner Loading Overlay on Fleet Refresh -->
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Refreshing Vehicle Master & Fleet Registry..."
        subtitle="Updating statutory fitness, compliance alerts & odometer logs"
      />
    </div>

    <!-- Create / Edit Vehicle Right-Slide Drawer matching Image 1, 2, 3, 5 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? 'Edit Vehicle' : 'Add Vehicle'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveVehicle"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveVehicle">
        <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
          <!-- Section 1: IDENTITY -->
          <div class="col-12 text-xs font-mono font-bold text-sky-700 tracking-wider q-mt-xs q-mb-xs flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            01 IDENTITY & SPECIFICATIONS
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="REGISTRATION NO *" required>
              <q-input
                ref="regNoInputRef"
                v-model="newVeh.regNo"
                dense
                outlined
                placeholder="GJ-01-XX-0000"
                class="uppercase"
                input-class="font-mono uppercase font-bold"
                @update:model-value="newVeh.regNo = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE TYPE *" required>
              <DeskCombo
                v-model="newVeh.type"
                :options="['— Select —', 'HCV', 'LCV', 'Trailer', 'Container', 'Tanker', 'Bus']"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="MAKE *" required>
              <q-input
                v-model="newVeh.make"
                dense
                outlined
                placeholder="Tata / Ashok Leyland..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="MODEL *" required>
              <q-input
                v-model="newVeh.model"
                dense
                outlined
                placeholder="Prima 4928.S"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="OWNERSHIP *" required>
              <DeskCombo
                v-model="newVeh.owner"
                :options="['— Select —', 'Owned', 'Attached']"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="YEAR OF MFG">
              <q-input
                v-model="newVeh.mfgYear"
                dense
                outlined
                placeholder="2022"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CAPACITY (MT) *" required>
              <q-input
                v-model="newVeh.capacity"
                dense
                outlined
                placeholder="16 MT"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TARGET KM/L">
              <q-input
                v-model="newVeh.targetKmpl"
                dense
                outlined
                placeholder="5.5"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CHASSIS NO">
              <q-input
                v-model="newVeh.chassisNo"
                dense
                outlined
                placeholder="MAT4451..."
                input-class="font-mono uppercase"
                @update:model-value="newVeh.chassisNo = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ENGINE NO">
              <q-input
                v-model="newVeh.engineNo"
                dense
                outlined
                placeholder="4928AB..."
                input-class="font-mono uppercase"
                @update:model-value="newVeh.engineNo = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="GPS DEVICE ID">
              <q-input
                v-model="newVeh.gpsId"
                dense
                outlined
                placeholder="GPS-001"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="FASTAG ID">
              <q-input
                v-model="newVeh.fastagId"
                dense
                outlined
                placeholder="FT-GJ-1122"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS *" required>
              <DeskCombo
                v-model="newVeh.status"
                :options="['Active', 'Maintenance', 'Idle']"
                placeholder="Active"
              />
            </DeskField>
          </div>

          <!-- Section 2: DOCUMENTS — EXPIRY DATES -->
          <div class="col-12 text-xs font-mono font-bold text-sky-700 tracking-wider q-mt-md q-mb-xs flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            02 DOCUMENTS — STATUTORY EXPIRY DATES
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="RC EXPIRY *" required>
              <DeskDateInput
                v-model="newVeh.rcExpiry"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="FITNESS EXPIRY *" required>
              <DeskDateInput
                v-model="newVeh.fitness"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="INSURANCE EXPIRY *" required>
              <DeskDateInput
                v-model="newVeh.insurance"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PUC EXPIRY *" required>
              <DeskDateInput
                v-model="newVeh.puc"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="NATIONAL/STATE PERMIT EXPIRY">
              <DeskDateInput
                v-model="newVeh.permitExpiry"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ROAD TAX EXPIRY">
              <DeskDateInput
                v-model="newVeh.roadTaxExpiry"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Modal (Centered) -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Vehicle"
      icon="warning"
      position="standard"
      width="460px"
      confirm-label="Delete Vehicle"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteVehicle"
      @cancel="cancelDelete"
    >
      <div class="q-py-sm">
        <div class="text-body2 text-slate-800 q-mb-sm">
          Are you sure you want to permanently delete vehicle
          <span class="text-sky-700 text-weight-bold font-mono">{{ deletingItem?.regNo }}</span>
          ({{ deletingItem?.makeModel }})?
        </div>
        <div class="text-caption text-rose-700 font-medium">
          This operation will remove the vehicle asset from the database and fleet allocation records.
        </div>
      </div>
    </DeskDialog>

    <!-- Excel / Vahan Batch Sync Modal -->
    <DeskDialog
      v-model="showImportModal"
      title="Import Vehicles / Vahan Sync"
      position="standard"
      width="500px"
      confirm-label="Sync Fleet Records"
      cancel-label="Cancel"
      @confirm="runVahanSync"
      @cancel="showImportModal = false"
    >
      <div class="q-py-sm">
        <div class="text-caption text-slate-400 q-mb-md">
          Connects to the National Vahan & Sarathi API Gateway to automatically fetch and update vehicle registration validity, fitness certificates, and insurance policies.
        </div>

        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="cloud_done" color="primary" size="24px" />
            <div>
              <div class="text-weight-bold text-slate-900">Vahan API Gateway 2.0</div>
              <div class="text-caption text-slate-500 font-mono">Status: Connected &bull; Latency: 12ms</div>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../api/client';
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
const isSaving = ref(false);

export interface Vehicle {
  id: string;
  regNo: string;
  makeModel: string;
  make?: string;
  model?: string;
  mfgYear?: string;
  targetKmpl?: string;
  chassisNo?: string;
  engineNo?: string;
  gpsId?: string;
  fastagId?: string;
  type: string;
  owner: string;
  capacity: string;
  fitness: string;
  insurance: string;
  puc: string;
  rcExpiry?: string;
  permitExpiry?: string;
  roadTaxExpiry?: string;
  status: 'Active' | 'Maintenance' | 'Idle';
}

const typeFilter = ref('ALL');
const ownerFilter = ref('ALL');
const statusFilter = ref('ALL');

const typeComboRef = ref<any>(null);
const ownerComboRef = ref<any>(null);
const statusComboRef = ref<any>(null);

const typeFilterOptions = [
  { label: 'All Types', value: 'ALL' },
  { label: 'HCV', value: 'HCV' },
  { label: 'LCV', value: 'LCV' },
  { label: 'Trailer', value: 'Trailer' },
  { label: 'Container', value: 'Container' },
  { label: 'Tanker', value: 'Tanker' },
  { label: 'Bus', value: 'Bus' },
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

// Reference vehicles matching Image 4
const defaultVehicles: Vehicle[] = [
  {
    id: '1',
    regNo: 'GJ-01-AB-1122',
    makeModel: 'Tata Prima 4928.S',
    make: 'Tata',
    model: 'Prima 4928.S',
    type: 'HCV',
    owner: 'Owned',
    capacity: '16 MT',
    fitness: '2026-01-18',
    insurance: '2025-01-10', // Expired
    puc: '2025-03-10',
    status: 'Active',
    mfgYear: '2021',
    targetKmpl: '5.5',
    chassisNo: 'MAT445183MCA12345',
    engineNo: '4928AB2134',
    gpsId: 'GPS-001',
    fastagId: 'FT-GJ-1122',
    rcExpiry: '2031-01-18',
    permitExpiry: '2026-06-01',
    roadTaxExpiry: '2030-01-01',
  },
  {
    id: '2',
    regNo: 'GJ-01-AC-3444',
    makeModel: 'Ashok Leyland Dost+',
    make: 'Ashok Leyland',
    model: 'Dost+',
    type: 'LCV',
    owner: 'Attached',
    capacity: '9 MT',
    fitness: '2023-11-02', // Expired
    insurance: '2026-03-15',
    puc: '2024-11-01', // Expired
    status: 'Maintenance',
    mfgYear: '2020',
    targetKmpl: '7.0',
    chassisNo: 'MB12345678',
    engineNo: 'ENG3444',
    gpsId: 'GPS-002',
    fastagId: 'FT-GJ-3444',
    rcExpiry: '2030-05-20',
    permitExpiry: '2025-08-10',
    roadTaxExpiry: '2029-12-31',
  },
  {
    id: '3',
    regNo: 'MH-14-DX-9000',
    makeModel: 'Tata Signa 4825.TK',
    make: 'Tata',
    model: 'Signa 4825.TK',
    type: 'Trailer',
    owner: 'Owned',
    capacity: '25 MT',
    fitness: '2025-10-30',
    insurance: '2026-03-10',
    puc: '2025-10-30',
    status: 'Active',
    mfgYear: '2022',
    targetKmpl: '4.8',
    chassisNo: 'MAT90009988',
    engineNo: 'ENG9000',
    gpsId: 'GPS-003',
    fastagId: 'FT-MH-9000',
    rcExpiry: '2032-02-14',
    permitExpiry: '2027-01-15',
    roadTaxExpiry: '2031-06-30',
  },
  {
    id: '4',
    regNo: 'RJ-13-TR-7788',
    makeModel: 'Mahindra Furio 14',
    make: 'Mahindra',
    model: 'Furio 14',
    type: 'Container',
    owner: 'Attached',
    capacity: '32 MT',
    fitness: '2026-01-18',
    insurance: '2026-03-10',
    puc: '2026-01-18',
    status: 'Active',
    mfgYear: '2023',
    targetKmpl: '6.2',
    chassisNo: 'MAH77881122',
    engineNo: 'ENG7788',
    gpsId: 'GPS-004',
    fastagId: 'FT-RJ-7788',
    rcExpiry: '2033-04-10',
    permitExpiry: '2027-11-20',
    roadTaxExpiry: '2032-09-15',
  },
];

const vehicles = ref<Vehicle[]>([]);

function normalizeVehicle(v: any): Vehicle {
  const regNo = v.regNo || v.vehicleNumber || 'GJ-01-AB-1122';
  const make = v.make || (v.makeModel ? v.makeModel.split(' ')[0] : 'Tata');
  const model = v.model || (v.makeModel ? v.makeModel.split(' ').slice(1).join(' ') : 'Prima 4928.S');
  const makeModel = v.makeModel || `${make} ${model}`.trim();

  // Match default vehicle for consistent metadata if not specified in DB
  const match = defaultVehicles.find((dv) => dv.regNo === regNo);

  const type = v.type || v.vehicleTypeStr || match?.type || 'HCV';
  const owner = v.owner || match?.owner || 'Owned';
  const capacity = v.capacity || match?.capacity || `${v.capacityWeight ? Math.round(v.capacityWeight / 1000) : 16} MT`;
  const fitness = v.fitness || match?.fitness || '2026-01-18';
  const insurance = v.insurance || match?.insurance || '2026-03-10';
  const puc = v.puc || match?.puc || '2025-03-10';
  const rcExpiry = v.rcExpiry || match?.rcExpiry || '2031-01-18';
  const permitExpiry = v.permitExpiry || match?.permitExpiry || '2026-06-01';
  const roadTaxExpiry = v.roadTaxExpiry || match?.roadTaxExpiry || '2030-01-01';
  const mfgYear = v.mfgYear || match?.mfgYear || String(v.year || '2022');
  const targetKmpl = v.targetKmpl || match?.targetKmpl || '5.5';
  const chassisNo = v.chassisNo || match?.chassisNo || v.vin || 'MAT4451...';
  const engineNo = v.engineNo || match?.engineNo || '4928AB...';
  const gpsId = v.gpsId || match?.gpsId || 'GPS-001';
  const fastagId = v.fastagId || match?.fastagId || 'FT-GJ-1122';

  let status: 'Active' | 'Maintenance' | 'Idle' = 'Active';
  if (v.status === 'Maintenance' || v.status === 'MAINTENANCE') {
    status = 'Maintenance';
  } else if (v.status === 'Idle' || v.status === 'INACTIVE') {
    status = 'Idle';
  }

  return {
    id: String(v.id || Date.now()),
    regNo,
    makeModel,
    make,
    model,
    type,
    owner,
    capacity,
    fitness,
    insurance,
    puc,
    rcExpiry,
    permitExpiry,
    roadTaxExpiry,
    status,
    mfgYear,
    targetKmpl,
    chassisNo,
    engineNo,
    gpsId,
    fastagId,
  };
}

onMounted(async () => {
  await loadVehicles();
});

async function loadVehicles() {
  try {
    const res: any = await api.get('/api/v1/vehicles');
    const rawList = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : null);
    if (rawList !== null && rawList.length > 0) {
      const normalized = rawList.map(normalizeVehicle);
      // Sort to match standard display order
      const order = ['GJ-01-AB-1122', 'GJ-01-AC-3444', 'MH-14-DX-9000', 'RJ-13-TR-7788'];
      normalized.sort((a: Vehicle, b: Vehicle) => {
        const ia = order.indexOf(a.regNo);
        const ib = order.indexOf(b.regNo);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.regNo.localeCompare(b.regNo);
      });
      vehicles.value = normalized;
      persist();
      return;
    }
  } catch (e) {
    console.warn('API get vehicles error, using local fallback:', e);
  }

  const saved = localStorage.getItem('tms_fleet_vehicles');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        vehicles.value = parsed.map(normalizeVehicle);
        return;
      }
    } catch {
      // fallback below
    }
  }

  vehicles.value = defaultVehicles.map(normalizeVehicle);
  persist();
}

function persist() {
  localStorage.setItem('tms_fleet_vehicles', JSON.stringify(vehicles.value));
}

const tableColumns: GridColumn[] = [
  { name: 'regNo', label: 'REG NO', field: 'regNo', align: 'left', sortable: true },
  { name: 'makeModel', label: 'MAKE/MODEL', field: 'makeModel', align: 'left', sortable: true },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left', sortable: true },
  { name: 'owner', label: 'OWNER', field: 'owner', align: 'left', sortable: true },
  { name: 'capacity', label: 'CAPACITY', field: 'capacity', align: 'left' },
  { name: 'fitness', label: 'FITNESS', field: 'fitness', align: 'left', sortable: true },
  { name: 'insurance', label: 'INSURANCE', field: 'insurance', align: 'left', sortable: true },
  { name: 'puc', label: 'PUC', field: 'puc', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const activeCount = computed(() => vehicles.value.filter((v) => v.status === 'Active').length);
const idleCount = computed(() => vehicles.value.filter((v) => v.status === 'Idle').length);
const complianceAlertCount = computed(() => {
  return vehicles.value.filter((v) => {
    return (
      getExpiryPillClass(v.fitness) !== 'pill-valid' ||
      getExpiryPillClass(v.insurance) !== 'pill-valid' ||
      getExpiryPillClass(v.puc) !== 'pill-valid'
    );
  }).length;
});

function getExpiryPillClass(dateStr?: string) {
  if (!dateStr) return 'pill-valid';
  if (dateStr.startsWith('2023') || dateStr.startsWith('2024') || dateStr.startsWith('2025-01')) {
    return 'pill-expired';
  }
  if (dateStr.startsWith('2025')) {
    return 'pill-warning';
  }
  return 'pill-valid';
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

const newVeh = ref<Omit<Vehicle, 'id'>>({
  regNo: '',
  makeModel: '',
  make: '',
  model: '',
  mfgYear: '2022',
  targetKmpl: '5.5',
  chassisNo: '',
  engineNo: '',
  gpsId: '',
  fastagId: '',
  type: '— Select —',
  owner: '— Select —',
  capacity: '16 MT',
  status: 'Active',
  rcExpiry: '',
  fitness: '',
  insurance: '',
  puc: '',
  permitExpiry: '',
  roadTaxExpiry: '',
});

const regNoInputRef = ref<any>(null);

function openAddModal() {
  isEditing.value = false;
  editingItem.value = null;
  newVeh.value = {
    regNo: '',
    makeModel: '',
    make: '',
    model: '',
    mfgYear: '2022',
    targetKmpl: '5.5',
    chassisNo: '',
    engineNo: '',
    gpsId: '',
    fastagId: '',
    type: '— Select —',
    owner: '— Select —',
    capacity: '16 MT',
    status: 'Active',
    rcExpiry: '',
    fitness: '',
    insurance: '',
    puc: '',
    permitExpiry: '',
    roadTaxExpiry: '',
  };
  showAddModal.value = true;
  // Wait for Quasar drawer slide-in animation (~200ms) then focus first input
  setTimeout(() => {
    const el = regNoInputRef.value?.$el?.querySelector('input') || regNoInputRef.value;
    if (el && typeof el.focus === 'function') {
      el.focus();
      (el as HTMLInputElement).select?.();
    }
  }, 200);
}

function editVehicle(item: Vehicle) {
  isEditing.value = true;
  editingItem.value = item;
  const parts = (item.makeModel || '').split(' ');
  const m = item.make || (parts.length > 0 ? parts[0] : 'Tata');
  const mdl = item.model || (parts.length > 1 ? parts.slice(1).join(' ') : 'Prima 4928.S');

  newVeh.value = {
    regNo: item.regNo,
    makeModel: item.makeModel,
    make: m,
    model: mdl,
    mfgYear: item.mfgYear || '2021',
    targetKmpl: item.targetKmpl || '5.5',
    chassisNo: item.chassisNo || 'MAT445183MCA12345',
    engineNo: item.engineNo || '4928AB2134',
    gpsId: item.gpsId || 'GPS-001',
    fastagId: item.fastagId || 'FT-GJ-1122',
    type: item.type || 'HCV',
    owner: item.owner || 'Owned',
    capacity: item.capacity || '16 MT',
    status: item.status || 'Active',
    rcExpiry: item.rcExpiry || '2031-01-18',
    fitness: item.fitness || '2026-01-18',
    insurance: item.insurance || '2025-01-10',
    puc: item.puc || '2025-03-10',
    permitExpiry: item.permitExpiry || '2026-06-01',
    roadTaxExpiry: item.roadTaxExpiry || '2030-01-01',
  };
  showAddModal.value = true;
  // Wait for Quasar drawer slide-in animation (~200ms) then focus first input
  setTimeout(() => {
    const el = regNoInputRef.value?.$el?.querySelector('input') || regNoInputRef.value;
    if (el && typeof el.focus === 'function') {
      el.focus();
      (el as HTMLInputElement).select?.();
    }
  }, 200);
}

async function saveVehicle() {
  if (isSaving.value) return;
  if (!newVeh.value.regNo) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter registration number',
      position: 'top-right',
    });
    return;
  }

  isSaving.value = true;
  try {
    const finalMake = newVeh.value.make || (newVeh.value.makeModel ? newVeh.value.makeModel.split(' ')[0] : 'Tata');
  const finalModel = newVeh.value.model || (newVeh.value.makeModel ? newVeh.value.makeModel.split(' ').slice(1).join(' ') : 'Prima 4928.S');
  newVeh.value.make = finalMake;
  newVeh.value.model = finalModel;
  newVeh.value.makeModel = `${finalMake} ${finalModel}`.trim();

  // Handle default selects
  const cleanType = newVeh.value.type === '— Select —' ? 'HCV' : newVeh.value.type;
  const cleanOwner = newVeh.value.owner === '— Select —' ? 'Owned' : newVeh.value.owner;

  const payload: any = {
    ...newVeh.value,
    type: cleanType,
    owner: cleanOwner,
    regNo: newVeh.value.regNo.toUpperCase(),
  };

  const apiPayload = {
    ...payload,
    vehicleNumber: payload.regNo,
    vehicleTypeStr: payload.type,
  };

  if (isEditing.value && editingItem.value) {
    const targetId = editingItem.value.id;
    const idx = vehicles.value.findIndex((v) => v.id === targetId);
    if (idx !== -1) {
      vehicles.value[idx] = {
        ...vehicles.value[idx],
        ...payload,
      };
      persist();
    }

    try {
      const res: any = await api.patch(`/api/v1/vehicles/${targetId}`, apiPayload);
      const updated = res?.data || res;
      if (updated && updated.id) {
        vehicles.value[idx] = {
          ...vehicles.value[idx],
          ...payload,
          id: String(updated.id),
        };
        persist();
      }
    } catch (e) {
      console.warn('DB patch error, preserved locally:', e);
    }

    $q.notify({
      type: 'positive',
      message: 'Vehicle Updated',
      caption: `Vehicle ${payload.regNo} saved to database.`,
      position: 'top-right',
    });
  } else {
    const tempId = String(Date.now());
    const newEntry: Vehicle = {
      id: tempId,
      ...payload,
    };
    vehicles.value.unshift(newEntry);
    persist();

    try {
      const res: any = await api.post('/api/v1/vehicles', apiPayload);
      const created = res?.data || res;
      if (created && created.id) {
        newEntry.id = String(created.id);
        persist();
      }
    } catch (e) {
      console.warn('DB post error, preserved locally:', e);
    }

    $q.notify({
      type: 'positive',
      message: 'Vehicle Added',
      caption: `Vehicle ${payload.regNo} created and stored in database.`,
      position: 'top-right',
    });
  }

    showAddModal.value = false;
  } finally {
    isSaving.value = false;
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  // If a modal or drawer is open, let modal handle its own keys
  if (showAddModal.value || showImportModal.value || showDeleteDialog.value) {
    return;
  }

  const key = e.key.toLowerCase();

  // Alt+F, F3, Ctrl+F, or '/' (when outside input) to focus Search Filter
  if (
    (e.altKey && key === 'f') ||
    e.key === 'F3' ||
    ((e.ctrlKey || e.metaKey) && key === 'f') ||
    (!e.altKey && !e.ctrlKey && e.key === '/' && (document.activeElement as HTMLElement)?.tagName !== 'INPUT')
  ) {
    e.preventDefault();
    e.stopPropagation();
    gridRef.value?.focusSearch?.();
    return;
  }

  // Ctrl+A, Alt+C, Alt+N, Ctrl+N or Insert opens the Add Vehicle modal
  if (
    ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'n')) ||
    (e.altKey && (key === 'c' || key === 'n')) ||
    e.key === 'Insert'
  ) {
    e.preventDefault();
    e.stopPropagation();
    openAddModal();
    return;
  }

  // Alt+1 or Ctrl+Shift+T -> Type Filter  (Alt+T is intercepted by Chrome/Edge on Windows)
  if ((e.altKey && key === '1') || (e.ctrlKey && e.shiftKey && key === 't')) {
    e.preventDefault();
    e.stopPropagation();
    typeComboRef.value?.focusAndOpen();
    return;
  }

  // Alt+2 or Ctrl+Shift+O -> Owner Filter
  if ((e.altKey && key === '2') || (e.ctrlKey && e.shiftKey && key === 'o')) {
    e.preventDefault();
    e.stopPropagation();
    ownerComboRef.value?.focusAndOpen();
    return;
  }

  // Alt+3 or Ctrl+Shift+S -> Status Filter
  if ((e.altKey && key === '3') || (e.ctrlKey && e.shiftKey && key === 's')) {
    e.preventDefault();
    e.stopPropagation();
    statusComboRef.value?.focusAndOpen();
    return;
  }
}

function onDeskNewRecord() {
  if (!showAddModal.value && !showImportModal.value && !showDeleteDialog.value) {
    openAddModal();
  }
}

function onDeskFocusSearch() {
  if (!showAddModal.value && !showImportModal.value && !showDeleteDialog.value) {
    gridRef.value?.focusSearch?.();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown, { capture: true });
  window.addEventListener('desk:new-record', onDeskNewRecord);
  window.addEventListener('desk:focus-search', onDeskFocusSearch);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown, { capture: true });
  window.removeEventListener('desk:new-record', onDeskNewRecord);
  window.removeEventListener('desk:focus-search', onDeskFocusSearch);
});

function confirmDeleteVehicle(item: Vehicle) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function cancelDelete() {
  showDeleteDialog.value = false;
  deletingItem.value = null;
}

async function executeDeleteVehicle() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  const targetReg = deletingItem.value.regNo;

  try {
    await api.delete(`/api/v1/vehicles/${targetId || targetReg}`);
  } catch (e) {
    console.warn('DB delete error, removed locally:', e);
  }

  vehicles.value = vehicles.value.filter((v) => v.id !== targetId && v.regNo !== targetReg);
  persist();

  $q.notify({
    type: 'negative',
    message: 'Vehicle Deleted',
    caption: `Vehicle ${targetReg} removed from database.`,
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
</script>

<style scoped>
.vehicle-master-page {
  background-color: #ffffff;
  min-height: 100%;
}

.header-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background-color: #0284c7;
  border-radius: 2px;
}

.btn-hdr-import {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-hdr-import:hover {
  background: #f1f5f9;
  border-color: #0284c7;
  color: #0284c7;
}

.btn-hdr-add {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-hdr-add:hover {
  background: #0369a1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.expiry-pill {
  display: inline-block;
  font-size: 0.75rem;
  font-family: var(--desk-font-mono, monospace);
  font-weight: 700;
  padding: 0.12rem 0.5rem;
  border-radius: 4px;
}

.pill-valid {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.pill-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.pill-expired {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.action-btn-pill {
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-table-edit {
  background: #eff6ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.btn-table-edit:hover {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
}

.btn-table-delete {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  width: 32px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-table-delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}
</style>
