<template>
  <div class="maintenance-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="build" color="cyan" size="24px" />
          <span>Maintenance / Job Cards</span>
        </div>
        <div class="text-caption text-grey-5">
          Workshop repair orders, scheduled PM cycles, mechanical work orders &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for job card
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportMaintenancePdf"
        >
          <q-tooltip>Download Maintenance Register (PDF)</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportMaintenanceCsv"
        >
          <q-tooltip>Export Job Cards to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Job Card"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Generate New Workshop Job Card (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">ACTIVE JOB CARDS</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ activeCount }}</div>
        <div class="text-xs text-slate-400 font-mono">Vehicles currently in workshop</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL REPAIR EXPENSE</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedTotalCost }}</div>
        <div class="text-xs text-slate-400 font-mono">Workshop repairs & parts</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">AVG DOWNTIME</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">2.1 Days</div>
        <div class="text-xs text-amber-300 font-mono">Workshop turnaround time</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">COMPLETED REPAIRS</div>
        <div class="text-3xl font-extrabold font-mono text-emerald-400 my-1">{{ completedCount }}</div>
        <div class="text-xs text-emerald-300 font-mono">Road-tested & certified</div>
        <div class="accent-bar bg-emerald-400"></div>
      </div>
    </div>

    <!-- Search and Custom Dropdown Filters Bar -->
    <div class="cyber-card p-3 mb-4">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search vehicle / job card / complaint... (Alt+F)"
            class="desk-search-input"
            style="min-width: 260px;"
          >
            <template #prepend>
              <q-icon name="search" size="18px" color="cyan" />
            </template>
            <template #append v-if="searchQuery">
              <q-icon
                name="cancel"
                size="18px"
                class="cursor-pointer text-slate-400 hover:text-white"
                @click.stop.prevent="searchQuery = ''"
                @mousedown.stop.prevent="searchQuery = ''"
              />
            </template>
          </q-input>

          <q-select
            v-model="statusFilter"
            :options="filterStatusOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            popup-content-class="desk-select-menu"
            style="min-width: 140px;"
          />

          <q-select
            v-model="workTypeFilter"
            :options="filterWorkTypeOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            popup-content-class="desk-select-menu"
            style="min-width: 180px;"
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
            <q-tooltip>Refresh Job Cards</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Job Cards Table -->
    <div class="cyber-card table-wrap relative-position">
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Workshop Records..."
        subtitle="Updating maintenance job cards from database"
      />
      <table class="cyber-table">
        <thead>
          <tr>
            <th>JOB CARD</th>
            <th>VEHICLE</th>
            <th>COMPLAINT</th>
            <th>WORK TYPE</th>
            <th>SERVICE CENTRE</th>
            <th class="text-right">COST</th>
            <th>DOWNTIME</th>
            <th>DATE</th>
            <th class="text-center">STATUS</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in filteredJobCards" :key="card.id || card.jobCardId">
            <td class="font-mono font-bold text-cyan-400">{{ card.jobCardId || card.jobCard }}</td>
            <td class="font-mono text-white font-semibold">{{ card.vehicle }}</td>
            <td class="text-slate-300 max-w-[200px] truncate" :title="card.complaint">{{ card.complaint }}</td>
            <td>
              <span class="subtype-pill" :class="getWorkTypePillClass(card.workType)">
                {{ card.workType }}
              </span>
            </td>
            <td class="text-slate-200">{{ card.serviceCentre }}</td>
            <td class="font-mono text-right font-bold text-white">{{ formatCostDisplay(card.totalCost || card.cost) }}</td>
            <td class="font-mono text-slate-400">{{ card.expectedDowntime || card.downtime || '—' }}</td>
            <td class="font-mono text-slate-400">{{ card.date }}</td>
            <td class="text-center font-mono">
              <span
                class="desk-pill"
                :class="card.status === 'Completed' ? 'desk-pill-success' : card.status === 'In Progress' ? 'desk-pill-active' : 'desk-pill-warning'"
              >
                {{ card.status }}
              </span>
            </td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="openDetails(card)">View</button>
                <button
                  class="btn-table-icon"
                  @click="printSingleJobCard(card)"
                  title="Print Official Job Card"
                >
                  <q-icon name="print" size="14px" />
                </button>
                <button
                  class="btn-table-icon"
                  @click="editJobCard(card)"
                  title="Edit Job Card"
                >
                  <q-icon name="edit" size="14px" />
                </button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeleteCard(card)"
                  title="Delete Job Card"
                >
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredJobCards.length === 0">
            <td colspan="10" class="text-center py-12">
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

    <!-- Create / Edit Job Card Right Drawer matching Images 1 & 5 -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? 'Edit Job Card' : 'New Job Card'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveJobCard"
      @cancel="showModal = false"
    >
      <DeskForm @submit="saveJobCard">
        <div class="row q-col-gutter-md">
          <!-- SECTION 1: JOB DETAILS -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
              JOB DETAILS
            </div>
          </div>

          <!-- Row 1: JOB CARD ID & DATE -->
          <div class="col-12 col-md-6">
            <DeskField label="JOB CARD ID" required>
              <q-input
                v-model="cardForm.jobCardId"
                dense
                outlined
                placeholder="JC/240056"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DATE" required>
              <q-input
                v-model="cardForm.date"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <!-- Row 2: VEHICLE & SERVICE CENTRE -->
          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE" required>
              <q-select
                v-model="cardForm.vehicle"
                :options="vehicleOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="SERVICE CENTRE" required>
              <q-select
                v-model="cardForm.serviceCentre"
                :options="serviceCentreOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 3: WORK TYPE & STATUS -->
          <div class="col-12 col-md-6">
            <DeskField label="WORK TYPE" required>
              <q-select
                v-model="cardForm.workType"
                :options="workTypeOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS" required>
              <q-select
                v-model="cardForm.status"
                :options="['Open', 'In Progress', 'Completed', 'Cancelled']"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 4: COMPLAINT / SYMPTOMS -->
          <div class="col-12">
            <DeskField label="COMPLAINT / SYMPTOMS" required>
              <q-input
                v-model="cardForm.complaint"
                type="textarea"
                rows="3"
                dense
                outlined
                placeholder="Describe the problem or scheduled service reason"
              />
            </DeskField>
          </div>

          <!-- SECTION 2: COST & DOWNTIME -->
          <div class="col-12 q-mt-sm">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
              COST & DOWNTIME
            </div>
          </div>

          <!-- Row 1: PARTS USED & LABOUR COST -->
          <div class="col-12 col-md-6">
            <DeskField label="PARTS USED">
              <q-input
                v-model="cardForm.partsUsed"
                dense
                outlined
                placeholder="Gasket set, coolant..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LABOUR COST (₹)">
              <q-input
                v-model="cardForm.labourCostFormatted"
                dense
                outlined
                placeholder="₹8,000"
              />
            </DeskField>
          </div>

          <!-- Row 2: TOTAL COST & EXPECTED DOWNTIME -->
          <div class="col-12 col-md-6">
            <DeskField label="TOTAL COST (₹)" required>
              <q-input
                v-model="cardForm.totalCostFormatted"
                dense
                outlined
                placeholder="₹45,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="EXPECTED DOWNTIME">
              <q-input
                v-model="cardForm.expectedDowntime"
                dense
                outlined
                placeholder="5 days / 4 hours"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- View Job Card Details Desk Dialog -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Workshop Job Card — ${selectedCard?.jobCardId || selectedCard?.jobCard}`"
      width="600px"
      confirm-label="Print Job Card"
      cancel-label="Close"
      @confirm="printSingleJobCard(selectedCard)"
      @cancel="showDetailsModal = false"
    >
      <div v-if="selectedCard" class="q-py-xs">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="text-caption text-grey-5">Vehicle Registration</div>
            <div class="text-h6 text-weight-bold text-white font-mono">{{ selectedCard.vehicle }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Work Type Category</div>
            <div class="text-body1 text-cyan-3 text-weight-medium">{{ selectedCard.workType }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Authorized Workshop</div>
            <div class="text-body2 text-white font-bold">{{ selectedCard.serviceCentre }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Approved Repair Cost</div>
            <div class="text-h6 text-weight-bold text-white font-mono">{{ formatCostDisplay(selectedCard.totalCost || selectedCard.cost) }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Job Card Date</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedCard.date }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Turnaround Downtime</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedCard.expectedDowntime || selectedCard.downtime }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-5 q-mb-xs">Reported Complaint / Defect Observation</div>
            <div class="q-pa-sm rounded-borders bg-[#090f1d] text-grey-2 text-body2 border border-slate-700">
              "{{ selectedCard.complaint }}"
            </div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-5 q-mb-xs">Current Maintenance Status</div>
            <span
              class="desk-pill"
              :class="selectedCard.status === 'Completed' ? 'desk-pill-success' : selectedCard.status === 'In Progress' ? 'desk-pill-active' : 'desk-pill-warning'"
            >
              {{ selectedCard.status }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Job Card"
      icon="warning"
      width="480px"
      confirm-label="Delete Job Card"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteCard"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Job Card
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingCard?.jobCardId || deletingCard?.jobCard }}</span>
          for Vehicle <strong class="text-white">{{ deletingCard?.vehicle }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the maintenance record and related workshop costs.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import {
  DeskDialog,
  DeskForm,
  DeskField,
} from '../../framework';

export interface JobCard {
  id?: string;
  jobCardId: string;
  jobCard?: string;
  vehicle: string;
  serviceCentre: string;
  workType: string;
  status: string;
  complaint: string;
  partsUsed?: string;
  labourCost?: number | string;
  totalCost?: number | string;
  cost?: string | number;
  expectedDowntime?: string;
  downtime?: string;
  date: string;
}

const notify = useAppNotify();

const showModal = ref(false);
const isEditing = ref(false);
const editingCard = ref<JobCard | null>(null);

const showDetailsModal = ref(false);
const selectedCard = ref<JobCard | null>(null);

const showDeleteDialog = ref(false);
const deletingCard = ref<JobCard | null>(null);

function openDetails(card: JobCard) {
  selectedCard.value = card;
  showDetailsModal.value = true;
}

function printSingleJobCard(card: JobCard | null) {
  if (!card) return;
  window.print();
}

const searchQuery = ref('');
const statusFilter = ref('ALL');
const workTypeFilter = ref('ALL');

// Dropdown options matching Images 2, 3, 4
const vehicleOptions = ref<string[]>([
  '— Select —',
  'GJ-01-AB-1122',
  'GJ-01-AC-3444',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
  'MH-12-AA-5500',
]);

const serviceCentreOptions = [
  '— Select —',
  'Shree Motors',
  'RK Auto',
  'SB Workshop',
  'City Auto Care',
];

const workTypeOptions = [
  '— Select —',
  'Engine Overhaul',
  'Tyre Replacement',
  'Brake Service',
  'Oil Change',
  'AC Repair',
  'Body Work',
  'Electrical Repair',
  'General Service',
  'Preventive Service',
];

const filterStatusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Open', value: 'Open' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const filterWorkTypeOptions = [
  { label: 'All Work Types', value: 'ALL' },
  { label: 'Engine Overhaul', value: 'Engine Overhaul' },
  { label: 'Tyre Replacement', value: 'Tyre Replacement' },
  { label: 'Brake Service', value: 'Brake Service' },
  { label: 'Oil Change', value: 'Oil Change' },
  { label: 'AC Repair', value: 'AC Repair' },
  { label: 'Body Work', value: 'Body Work' },
  { label: 'Electrical Repair', value: 'Electrical Repair' },
  { label: 'General Service', value: 'General Service' },
  { label: 'Preventive Service', value: 'Preventive Service' },
];

const defaultJobCards: JobCard[] = [
  {
    id: 'JC/240055',
    jobCardId: 'JC/240055',
    jobCard: 'JC/240055',
    vehicle: 'GJ-01-AC-3444',
    complaint: 'Engine overheating, white smoke',
    workType: 'Engine Overhaul',
    serviceCentre: 'Shree Motors',
    partsUsed: 'Gasket set, coolant',
    labourCost: 8000,
    totalCost: 45000,
    cost: '₹45,000',
    expectedDowntime: '5 days',
    downtime: '5 days',
    date: '2026-10-20',
    status: 'In Progress',
  },
  {
    id: 'JC/240054',
    jobCardId: 'JC/240054',
    jobCard: 'JC/240054',
    vehicle: 'MH-14-DX-9000',
    complaint: 'Front axle brake liner wear & air leak',
    workType: 'Brake Service',
    serviceCentre: 'RK Auto',
    partsUsed: 'Brake pads, air valves',
    labourCost: 4500,
    totalCost: 18500,
    cost: '₹18,500',
    expectedDowntime: '1 day',
    downtime: '1 day',
    date: '2026-10-18',
    status: 'Open',
  },
  {
    id: 'JC/240053',
    jobCardId: 'JC/240053',
    jobCard: 'JC/240053',
    vehicle: 'GJ-05-BT-2211',
    complaint: 'Axle 2 dual tyre puncture & realignment',
    workType: 'Tyre Replacement',
    serviceCentre: 'SB Workshop',
    partsUsed: 'Tubeless valves',
    labourCost: 1200,
    totalCost: 3200,
    cost: '₹3,200',
    expectedDowntime: '4 hours',
    downtime: '4 hours',
    date: '2026-10-16',
    status: 'Completed',
  },
  {
    id: 'JC/240052',
    jobCardId: 'JC/240052',
    jobCard: 'JC/240052',
    vehicle: 'RJ-13-TR-7788',
    complaint: 'Periodic maintenance 40,000 KM & oil filter replacement',
    workType: 'Oil Change',
    serviceCentre: 'City Auto Care',
    partsUsed: 'Engine oil 15W40, filters',
    labourCost: 2500,
    totalCost: 14200,
    cost: '₹14,200',
    expectedDowntime: '6 hours',
    downtime: '6 hours',
    date: '2026-10-15',
    status: 'Completed',
  },
];

const jobCards = ref<JobCard[]>([]);

const cardForm = ref({
  id: '',
  jobCardId: 'JC/240056',
  date: new Date().toISOString().slice(0, 10),
  vehicle: '— Select —',
  serviceCentre: '— Select —',
  workType: '— Select —',
  status: 'Open',
  complaint: '',
  partsUsed: '',
  labourCostFormatted: '₹8,000',
  totalCostFormatted: '₹45,000',
  expectedDowntime: '5 days / 4 hours',
});

const isRefreshing = ref(false);

onMounted(async () => {
  await loadJobCards();
  fetchDynamicVehicles();
});

async function loadJobCards() {
  isRefreshing.value = true;
  try {
    const res = await api.get('/api/v1/job-cards');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      jobCards.value = res.data;
    } else {
      jobCards.value = [...defaultJobCards];
    }
  } catch (err) {
    console.warn('Could not load job cards from API, fallback to localStorage:', err);
    const saved = localStorage.getItem('tms_job_cards');
    if (saved) {
      try {
        jobCards.value = JSON.parse(saved);
      } catch {
        jobCards.value = defaultJobCards;
      }
    } else {
      jobCards.value = defaultJobCards;
    }
  } finally {
    isRefreshing.value = false;
  }
}

async function fetchDynamicVehicles() {
  try {
    const res = await api.get('/api/v1/vehicles');
    if (res.data && Array.isArray(res.data)) {
      const vList = res.data
        .map((v: any) => v.registrationNumber || v.vehicleNumber || v.regNo || v.plateNumber)
        .filter(Boolean);
      for (const reg of vList) {
        if (!vehicleOptions.value.includes(reg)) {
          vehicleOptions.value.push(reg);
        }
      }
    }
  } catch {
    // Keep defaults
  }
}

function persistLocal() {
  localStorage.setItem('tms_job_cards', JSON.stringify(jobCards.value));
}

function formatCostDisplay(val: any): string {
  if (!val) return '₹0';
  if (typeof val === 'string' && val.startsWith('₹')) return val;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

const activeCount = computed(() => {
  return jobCards.value.filter((c) => c.status !== 'Completed' && c.status !== 'Cancelled').length;
});

const completedCount = computed(() => {
  return jobCards.value.filter((c) => c.status === 'Completed').length;
});

const formattedTotalCost = computed(() => {
  const sum = jobCards.value.reduce((acc, curr) => {
    const num = parseCurrency(String(curr.totalCost || curr.cost || 0));
    return acc + num;
  }, 0);
  return sum.toLocaleString('en-IN');
});

const filteredJobCards = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return jobCards.value.filter((c) => {
    const jcId = (c.jobCardId || c.jobCard || '').toLowerCase();
    const veh = (c.vehicle || '').toLowerCase();
    const comp = (c.complaint || '').toLowerCase();
    const sc = (c.serviceCentre || '').toLowerCase();
    const matchSearch = !q || jcId.includes(q) || veh.includes(q) || comp.includes(q) || sc.includes(q);
    const matchStatus = statusFilter.value === 'ALL' || c.status === statusFilter.value;
    const matchType = workTypeFilter.value === 'ALL' || c.workType === workTypeFilter.value;
    return matchSearch && matchStatus && matchType;
  });
});

function getWorkTypePillClass(type: string) {
  switch (type) {
    case 'Engine Overhaul':
      return 'sub-service-centre';
    case 'Tyre Replacement':
      return 'sub-customer';
    case 'Brake Service':
      return 'sub-fuel-station';
    case 'Oil Change':
      return 'sub-driver';
    default:
      return 'sub-customer';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingCard.value = null;
  const seq = 240056 + jobCards.value.length;
  cardForm.value = {
    id: `JC/${seq}`,
    jobCardId: `JC/${seq}`,
    date: new Date().toISOString().slice(0, 10),
    vehicle: '— Select —',
    serviceCentre: '— Select —',
    workType: '— Select —',
    status: 'Open',
    complaint: '',
    partsUsed: '',
    labourCostFormatted: '₹8,000',
    totalCostFormatted: '₹45,000',
    expectedDowntime: '5 days / 4 hours',
  };
  showModal.value = true;
}

function editJobCard(card: JobCard) {
  isEditing.value = true;
  editingCard.value = card;

  const total = parseCurrency(String(card.totalCost || card.cost || 45000));
  const labour = parseCurrency(String(card.labourCost || 8000));

  cardForm.value = {
    id: card.id || card.jobCardId || card.jobCard || 'JC/240055',
    jobCardId: card.jobCardId || card.jobCard || 'JC/240055',
    date: card.date || new Date().toISOString().slice(0, 10),
    vehicle: card.vehicle || 'GJ-01-AC-3444',
    serviceCentre: card.serviceCentre || 'Shree Motors',
    workType: card.workType || 'Engine Overhaul',
    status: card.status || 'In Progress',
    complaint: card.complaint || 'Engine overheating, white smoke',
    partsUsed: card.partsUsed || 'Gasket set, coolant',
    labourCostFormatted: `₹${labour.toLocaleString('en-IN')}`,
    totalCostFormatted: `₹${total.toLocaleString('en-IN')}`,
    expectedDowntime: card.expectedDowntime || card.downtime || '5 days',
  };
  showModal.value = true;
}

async function saveJobCard() {
  if (
    !cardForm.value.jobCardId ||
    cardForm.value.vehicle === '— Select —' ||
    cardForm.value.serviceCentre === '— Select —' ||
    cardForm.value.workType === '— Select —'
  ) {
    notify.warning('Please select Vehicle, Service Centre, and Work Type.');
    return;
  }

  const labourNum = parseCurrency(cardForm.value.labourCostFormatted);
  const totalNum = parseCurrency(cardForm.value.totalCostFormatted);

  const payload: any = {
    id: cardForm.value.jobCardId,
    jobCardId: cardForm.value.jobCardId,
    jobCard: cardForm.value.jobCardId,
    date: cardForm.value.date,
    vehicle: cardForm.value.vehicle,
    serviceCentre: cardForm.value.serviceCentre,
    workType: cardForm.value.workType,
    status: cardForm.value.status,
    complaint: cardForm.value.complaint || 'General Service',
    partsUsed: cardForm.value.partsUsed,
    labourCost: labourNum,
    totalCost: totalNum,
    cost: `₹${totalNum.toLocaleString('en-IN')}`,
    expectedDowntime: cardForm.value.expectedDowntime,
    downtime: cardForm.value.expectedDowntime,
  };

  try {
    if (isEditing.value && editingCard.value) {
      const editId = editingCard.value.id || editingCard.value.jobCardId || editingCard.value.jobCard;
      await api.patch(`/api/v1/job-cards/${editId}`, payload);
      const idx = jobCards.value.findIndex(
        (c) => (c.id || c.jobCardId || c.jobCard) === editId,
      );
      if (idx !== -1) {
        jobCards.value[idx] = { ...jobCards.value[idx], ...payload };
      }
      notify.success(`Job Card ${payload.jobCardId} updated successfully.`);
    } else {
      await api.post('/api/v1/job-cards', payload);
      jobCards.value.unshift(payload);
      notify.success(`Job Card ${payload.jobCardId} saved to database.`);
    }
    persistLocal();
  } catch (err: any) {
    console.warn('API error, falling back to local:', err);
    if (isEditing.value && editingCard.value) {
      const editId = editingCard.value.id || editingCard.value.jobCardId || editingCard.value.jobCard;
      const idx = jobCards.value.findIndex(
        (c) => (c.id || c.jobCardId || c.jobCard) === editId,
      );
      if (idx !== -1) {
        jobCards.value[idx] = { ...jobCards.value[idx], ...payload };
      }
      notify.success(`Job Card ${payload.jobCardId} updated locally.`);
    } else {
      jobCards.value.unshift(payload);
      notify.success(`Job Card ${payload.jobCardId} created locally.`);
    }
    persistLocal();
  }

  showModal.value = false;
}

function confirmDeleteCard(card: JobCard) {
  deletingCard.value = card;
  showDeleteDialog.value = true;
}

async function executeDeleteCard() {
  if (!deletingCard.value) return;
  const targetId = deletingCard.value.id || deletingCard.value.jobCardId || deletingCard.value.jobCard;

  try {
    await api.delete(`/api/v1/job-cards/${targetId}`);
  } catch (err) {
    console.warn('Could not delete on API, deleting locally:', err);
  }

  jobCards.value = jobCards.value.filter(
    (c) => (c.id || c.jobCardId || c.jobCard) !== targetId,
  );
  persistLocal();
  notify.success(`Job Card ${targetId} deleted.`);
  showDeleteDialog.value = false;
}

async function onRefresh() {
  await loadJobCards();
  notify.success('Job Cards Refreshed from database.');
}

function exportMaintenanceCsv() {
  exportToCsv(
    'workshop_job_cards',
    [
      { label: 'Job Card', field: 'jobCardId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Complaint', field: 'complaint' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Service Centre', field: 'serviceCentre' },
      { label: 'Total Cost', field: 'totalCost' },
      { label: 'Downtime', field: 'expectedDowntime' },
      { label: 'Date', field: 'date' },
      { label: 'Status', field: 'status' },
    ],
    filteredJobCards.value,
  );
  notify.success(`${filteredJobCards.value.length} job cards exported to CSV.`);
}

function exportMaintenancePdf() {
  exportToPdf({
    title: 'Workshop Maintenance & Job Cards Register',
    subtitle: `Total Active Records: ${filteredJobCards.value.length}`,
    columns: [
      { label: 'Job Card', field: 'jobCardId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Service Centre', field: 'serviceCentre' },
      { label: 'Cost', field: 'totalCost', align: 'right' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredJobCards.value,
  });
}
</script>

<style scoped>
.maintenance-page {
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

/* Cyber Card & Table matching Enterprise Dark */
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
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
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

.btn-table-action {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid rgba(0, 242, 254, 0.4);
  background: rgba(0, 242, 254, 0.08);
  color: #00f2fe;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-table-action:hover {
  background: rgba(0, 242, 254, 0.2);
  border-color: #00f2fe;
}
</style>
