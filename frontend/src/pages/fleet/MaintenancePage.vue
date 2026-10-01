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
            :options="statusOptions"
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
            :options="workTypeOptions"
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

    <!-- Job Cards Table matching Reference Image 1 & 2 -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing maintenance records...</div>
      </q-inner-loading>
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
          <tr v-for="card in filteredJobCards" :key="card.id">
            <td class="font-mono font-bold text-cyan-400">{{ card.jobCard }}</td>
            <td class="font-mono text-white font-semibold">{{ card.vehicle }}</td>
            <td class="text-slate-300 max-w-[200px] truncate" :title="card.complaint">{{ card.complaint }}</td>
            <td>
              <span class="subtype-pill" :class="getWorkTypePillClass(card.workType)">
                {{ card.workType }}
              </span>
            </td>
            <td class="text-slate-200">{{ card.serviceCentre }}</td>
            <td class="font-mono text-right font-bold text-white">{{ card.cost }}</td>
            <td class="font-mono text-slate-400">{{ card.downtime }}</td>
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

    <!-- Create / Edit Job Card Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? `Edit Job Card — ${editingCard?.jobCard}` : 'Create New Workshop Job Card'"
      width="580px"
      :confirm-label="isEditing ? 'Update Job Card' : 'Generate Job Card'"
      cancel-label="Cancel"
      @confirm="saveJobCard"
      @cancel="showModal = false"
    >
      <DeskForm @submit="saveJobCard">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Vehicle Registration" required shortcut="1">
              <DeskCombo
                v-model="newCard.vehicle"
                :options="['GJ-01-AC-3444', 'MH-14-DX-9000', 'GJ-05-BT-2211', 'RJ-13-TR-7788', 'GJ-01-AB-1122']"
                placeholder="Select or enter vehicle..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Work Type Category" required shortcut="2">
              <DeskCombo
                v-model="newCard.workType"
                :options="['Engine Overhaul', 'Tyre Replacement', 'Brake Service', 'Suspension & Alignment', 'Electrical / Battery', 'Periodic PM']"
                placeholder="Select work type..."
              />
            </DeskField>
          </div>

          <div class="col-12">
            <DeskField label="Driver / Technician Complaint" required shortcut="3">
              <q-input
                v-model="newCard.complaint"
                type="textarea"
                rows="2"
                dense
                outlined
                placeholder="Describe the mechanical or electrical issue in detail..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Service Centre / Workshop" required shortcut="4">
              <DeskCombo
                v-model="newCard.serviceCentre"
                :options="['Shree Motors', 'RK Auto Garage', 'National Retreaders', 'Gujarat Fleet Works']"
                placeholder="Select workshop..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Estimated Repair Cost (₹)" required shortcut="5">
              <q-input
                v-model="newCard.cost"
                dense
                outlined
                placeholder="e.g. 25000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Estimated Downtime" shortcut="6">
              <q-input
                v-model="newCard.downtime"
                dense
                outlined
                placeholder="e.g. 2 days / 6 hours"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Maintenance Status" required shortcut="7">
              <DeskCombo
                v-model="newCard.status"
                :options="['Open', 'In Progress', 'Completed']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- View Job Card Details Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Workshop Job Card — ${selectedCard?.jobCard}`"
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
            <div class="text-h6 text-weight-bold text-white font-mono">{{ selectedCard.cost }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Job Card Date</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedCard.date }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Turnaround Downtime</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedCard.downtime }}</div>
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
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingCard?.jobCard }}</span>
          for Vehicle <strong class="text-white">{{ deletingCard?.vehicle }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will cancel the workshop work order and remove it from vehicle maintenance history.
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
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
} from '../../framework';

export interface JobCard {
  id: string;
  jobCard: string;
  vehicle: string;
  complaint: string;
  workType: string;
  serviceCentre: string;
  cost: string;
  downtime: string;
  date: string;
  status: 'In Progress' | 'Completed' | 'Open';
}

const $q = useQuasar();

const showModal = ref(false);
const isEditing = ref(false);
const editingCard = ref<JobCard | null>(null);

const showDetailsModal = ref(false);
const selectedCard = ref<JobCard | null>(null);

const showDeleteDialog = ref(false);
const deletingCard = ref<JobCard | null>(null);

const searchQuery = ref('');
const statusFilter = ref('ALL');
const workTypeFilter = ref('ALL');

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Open', value: 'Open' },
];

const workTypeOptions = [
  { label: 'All Work Types', value: 'ALL' },
  { label: 'Engine Overhaul', value: 'Engine Overhaul' },
  { label: 'Tyre Replacement', value: 'Tyre Replacement' },
  { label: 'Brake Service', value: 'Brake Service' },
  { label: 'Suspension & Alignment', value: 'Suspension & Alignment' },
  { label: 'Electrical / Battery', value: 'Electrical / Battery' },
];

const defaultJobCards: JobCard[] = [
  {
    id: '1',
    jobCard: 'JC/240055',
    vehicle: 'GJ-01-AC-3444',
    complaint: 'Engine overheating, white smoke from radiator',
    workType: 'Engine Overhaul',
    serviceCentre: 'Shree Motors',
    cost: '₹45,000',
    downtime: '5 days',
    date: '2026-10-20',
    status: 'In Progress',
  },
  {
    id: '2',
    jobCard: 'JC/240054',
    vehicle: 'MH-14-DX-9000',
    complaint: 'Tyre worn out FR position beyond legal tread limit',
    workType: 'Tyre Replacement',
    serviceCentre: 'Shree Motors',
    cost: '₹28,000',
    downtime: '4 hours',
    date: '2026-10-18',
    status: 'Completed',
  },
  {
    id: '3',
    jobCard: 'JC/240053',
    vehicle: 'GJ-05-BT-2211',
    complaint: 'Brake noise, pedal spongy and soft',
    workType: 'Brake Service',
    serviceCentre: 'RK Auto Garage',
    cost: '₹8,500',
    downtime: '1 day',
    date: '2026-10-22',
    status: 'Open',
  },
  {
    id: '4',
    jobCard: 'JC/240052',
    vehicle: 'RJ-13-TR-7788',
    complaint: 'Periodic maintenance 40,000 KM & oil filter replacement',
    workType: 'Engine Overhaul',
    serviceCentre: 'Shree Motors',
    cost: '₹14,200',
    downtime: '6 hours',
    date: '2026-10-15',
    status: 'Completed',
  },
];

const jobCards = ref<JobCard[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('tms_job_cards');
  if (saved) {
    try {
      jobCards.value = JSON.parse(saved);
    } catch {
      jobCards.value = defaultJobCards;
    }
  } else {
    jobCards.value = defaultJobCards;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_job_cards', JSON.stringify(jobCards.value));
}

const newCard = ref({
  vehicle: '',
  complaint: '',
  workType: 'Brake Service',
  serviceCentre: 'Shree Motors',
  cost: '15000',
  downtime: '1 day',
  status: 'Open' as 'In Progress' | 'Completed' | 'Open',
});

const activeCount = computed(() => {
  return jobCards.value.filter((c) => c.status !== 'Completed').length;
});

const completedCount = computed(() => {
  return jobCards.value.filter((c) => c.status === 'Completed').length;
});

const formattedTotalCost = computed(() => {
  const sum = jobCards.value.reduce((acc, curr) => {
    const num = parseInt(curr.cost.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num;
  }, 0);
  return sum.toLocaleString('en-IN');
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      message: 'Job Cards Refreshed',
      caption: 'Maintenance registry synced with workshop.',
      position: 'top-right',
    });
  }, 600);
}

const filteredJobCards = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return jobCards.value.filter((c) => {
    const matchSearch =
      !q ||
      c.jobCard.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.complaint.toLowerCase().includes(q) ||
      c.serviceCentre.toLowerCase().includes(q);
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
    default:
      return 'sub-driver';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingCard.value = null;
  newCard.value = {
    vehicle: 'GJ-01-AC-3444',
    complaint: '',
    workType: 'Brake Service',
    serviceCentre: 'Shree Motors',
    cost: '12000',
    downtime: '1 day',
    status: 'Open',
  };
  showModal.value = true;
}

function editJobCard(card: JobCard) {
  isEditing.value = true;
  editingCard.value = card;
  newCard.value = {
    vehicle: card.vehicle,
    complaint: card.complaint,
    workType: card.workType,
    serviceCentre: card.serviceCentre,
    cost: card.cost.replace(/[^0-9]/g, ''),
    downtime: card.downtime,
    status: card.status,
  };
  showModal.value = true;
}

function saveJobCard() {
  if (!newCard.value.vehicle || !newCard.value.complaint) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter vehicle registration and reported defect complaint.',
      position: 'top-right',
    });
    return;
  }

  const costFormatted = newCard.value.cost ? `₹${Number(newCard.value.cost).toLocaleString('en-IN')}` : '₹0';

  if (isEditing.value && editingCard.value) {
    const idx = jobCards.value.findIndex((c) => c.id === editingCard.value!.id);
    if (idx !== -1) {
      jobCards.value[idx] = {
        ...jobCards.value[idx],
        vehicle: newCard.value.vehicle.toUpperCase(),
        complaint: newCard.value.complaint,
        workType: newCard.value.workType,
        serviceCentre: newCard.value.serviceCentre,
        cost: costFormatted,
        downtime: newCard.value.downtime || 'Standard',
        status: newCard.value.status,
      };
      persist();
      $q.notify({
        type: 'positive',
        message: 'Job Card Updated',
        caption: `Job card ${editingCard.value.jobCard} updated successfully.`,
        position: 'top-right',
      });
    }
  } else {
    const num = 240056 + jobCards.value.length;
    const newJc: JobCard = {
      id: String(Date.now()),
      jobCard: `JC/${num}`,
      vehicle: newCard.value.vehicle.toUpperCase(),
      complaint: newCard.value.complaint,
      workType: newCard.value.workType,
      serviceCentre: newCard.value.serviceCentre,
      cost: costFormatted,
      downtime: newCard.value.downtime || 'Standard',
      date: new Date().toISOString().split('T')[0],
      status: newCard.value.status,
    };
    jobCards.value.unshift(newJc);
    persist();
    $q.notify({
      type: 'positive',
      message: 'Job Card Created',
      caption: `Job card ${newJc.jobCard} generated for vehicle ${newJc.vehicle}.`,
      position: 'top-right',
    });
  }

  showModal.value = false;
}

function openDetails(card: JobCard) {
  selectedCard.value = card;
  showDetailsModal.value = true;
}

function confirmDeleteCard(card: JobCard) {
  deletingCard.value = card;
  showDeleteDialog.value = true;
}

function executeDeleteCard() {
  if (!deletingCard.value) return;
  jobCards.value = jobCards.value.filter((c) => c.id !== deletingCard.value!.id);
  persist();
  $q.notify({
    type: 'positive',
    message: 'Job Card Deleted',
    caption: `Job card ${deletingCard.value.jobCard} deleted.`,
    position: 'top-right',
  });
  showDeleteDialog.value = false;
}

/**
 * Print single official Workshop Job Card work order document
 */
function printSingleJobCard(card: JobCard | null) {
  if (!card) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    $q.notify({
      type: 'warning',
      message: 'Popup Blocked',
      caption: 'Please allow popups in your browser to print the Job Card.',
      position: 'top-right',
    });
    return;
  }

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const complaintSafe = (card.complaint || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Job Card ${card.jobCard} - Ankpal Gati Shakti TMS</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .company-name {
      font-size: 20px;
      font-weight: 800;
      color: #0891b2;
      letter-spacing: -0.02em;
    }
    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .jc-tag {
      text-align: right;
    }
    .jc-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }
    .jc-number {
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      color: #0891b2;
      margin-top: 2px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      background: #f8fafc;
    }
    .info-card h4 {
      margin: 0 0 10px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 7px;
      font-size: 13px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }
    .complaint-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
      background: #ffffff;
    }
    .complaint-box h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
    }
    .complaint-text {
      font-size: 13px;
      line-height: 1.5;
      color: #1e293b;
      font-style: italic;
    }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .checklist-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
    }
    .checklist-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      font-size: 12px;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
      height: 40px;
    }
    .sign-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="company-name">ANKPAL GATI SHAKTI TMS</div>
      <div class="company-sub">Fleet Workshop Maintenance & Job Card Order &bull; Logistics HQ</div>
    </div>
    <div class="jc-tag">
      <div class="jc-title">WORKSHOP JOB CARD</div>
      <div class="jc-number">${card.jobCard}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Printed: ${currentDate}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="info-card">
      <h4>Vehicle & Work Scope</h4>
      <div class="info-row">
        <span class="info-label">Vehicle Registration:</span>
        <span class="info-value" style="font-family: monospace; font-size: 14px;">${card.vehicle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Work Type Category:</span>
        <span class="info-value">${card.workType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Status:</span>
        <span class="info-value" style="color: #0891b2;">${card.status}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Turnaround Downtime:</span>
        <span class="info-value">${card.downtime || 'Standard'}</span>
      </div>
    </div>

    <div class="info-card">
      <h4>Workshop & Commercials</h4>
      <div class="info-row">
        <span class="info-label">Authorized Garage:</span>
        <span class="info-value">${card.serviceCentre}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Job Card Date:</span>
        <span class="info-value">${card.date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Approved Repair Cost:</span>
        <span class="info-value" style="font-size: 15px; color: #0f172a;">${card.cost}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Authorization:</span>
        <span class="info-value">Verified (Direct PO)</span>
      </div>
    </div>
  </div>

  <div class="complaint-box">
    <h4>Reported Defect / Driver Complaint</h4>
    <div class="complaint-text">"${complaintSafe}"</div>
  </div>

  <table class="checklist-table">
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Task / Inspection Checklist</th>
        <th>Parts / Spares Replaced</th>
        <th style="width: 120px;">Technician Sign</th>
        <th style="width: 100px;">Inspection Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Pre-repair diagnostic & fault code scan</td>
        <td>—</td>
        <td></td>
        <td>PASSED [ &check; ]</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Mechanical / Electrical component overhaul</td>
        <td>OEM Certified Spares</td>
        <td></td>
        <td>COMPLETED [ &check; ]</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Road test & safety sign-off (5 KM)</td>
        <td>Consumables / Lubes</td>
        <td></td>
        <td>VERIFIED [ &check; ]</td>
      </tr>
    </tbody>
  </table>

  <div class="sign-grid">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Driver / Handover Signature</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Workshop Head / Mechanic</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Fleet Manager Approval</div>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 400);
}

function exportMaintenanceCsv() {
  exportToCsv(
    'maintenance_job_cards',
    [
      { label: 'Job Card', field: 'jobCard' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Complaint', field: 'complaint' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Service Centre', field: 'serviceCentre' },
      { label: 'Cost', field: 'cost' },
      { label: 'Downtime', field: 'downtime' },
      { label: 'Date', field: 'date' },
      { label: 'Status', field: 'status' },
    ],
    filteredJobCards.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${filteredJobCards.value.length} job cards exported to CSV.`,
    position: 'top-right',
  });
}

function exportMaintenancePdf() {
  exportToPdf({
    title: 'Fleet Maintenance Job Cards Register',
    subtitle: `Total Active Records: ${filteredJobCards.value.length}`,
    columns: [
      { label: 'Job Card', field: 'jobCard' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Workshop', field: 'serviceCentre' },
      { label: 'Cost', field: 'cost', align: 'right' },
      { label: 'Date', field: 'date' },
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
