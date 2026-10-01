<template>
  <div class="driver-advances-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="payments" color="cyan" size="24px" />
          <span>Driver Advances & Trip Disbursements</span>
        </div>
        <div class="text-caption text-grey-5">
          Trip cash vouchers, diesel top-up authorizations, toll allowances &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for advance voucher
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportAdvancesPdf"
        >
          <q-tooltip>Download Advances Register (PDF)</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportAdvancesCsv"
        >
          <q-tooltip>Export Advances to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Record Advance"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Record New Advance Voucher (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL ADVANCES</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">₹{{ formattedTotalAdvances }}</div>
        <div class="text-xs text-slate-400 font-mono">{{ advances.length }} trips funded</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">DIESEL TOP-UP</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedDieselTopup }}</div>
        <div class="text-xs text-slate-400 font-mono">En-route fueling advances</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOLL & FASTAG</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedTollAdvances }}</div>
        <div class="text-xs text-slate-400 font-mono">National highway corridors</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">UNSETTLED ADVANCES</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">₹{{ formattedUnsettledAdvances }}</div>
        <div class="text-xs text-amber-300 font-mono">{{ unsettledCount }} vouchers pending settlement</div>
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
            placeholder="Search advance ID / driver / trip ref... (Alt+F)"
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
            v-model="purposeFilter"
            :options="purposeFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 170px;"
          />

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
            <q-tooltip>Refresh Driver Advances</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Advances Cyber-Dark Table matching Reference Image 1 & 2 -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing advance records...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>ADVANCE ID</th>
            <th>TRIP REF</th>
            <th>DRIVER</th>
            <th>DATE</th>
            <th class="text-right">AMOUNT</th>
            <th>PURPOSE</th>
            <th>MODE</th>
            <th>APPROVED BY</th>
            <th class="text-center">STATUS</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAdvances" :key="item.id">
            <td class="font-mono font-bold text-cyan-400">{{ item.id }}</td>
            <td class="font-mono text-white font-semibold">{{ item.tripRef }}</td>
            <td class="text-white font-medium">{{ item.driver }}</td>
            <td class="font-mono text-slate-400">{{ item.date }}</td>
            <td class="font-mono text-right font-bold text-white">₹{{ item.amount.toLocaleString() }}</td>
            <td>
              <span class="subtype-pill" :class="getPurposePillClass(item.purpose)">
                {{ item.purpose }}
              </span>
            </td>
            <td class="font-mono text-slate-300">{{ item.mode }}</td>
            <td class="text-slate-400">{{ item.approvedBy }}</td>
            <td class="text-center font-mono">
              <span
                class="desk-pill"
                :class="item.status === 'Approved' ? 'desk-pill-success' : item.status === 'Settled' ? 'desk-pill-active' : 'desk-pill-warning'"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="editAdvance(item)">Edit</button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeleteAdvance(item)"
                  title="Delete Advance"
                >
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredAdvances.length === 0">
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

    <!-- Record / Edit Advance Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? `Edit Driver Advance Voucher — ${editingItem?.id}` : 'Record New Driver Advance Voucher'"
      width="580px"
      :confirm-label="isEditing ? 'Update Voucher' : 'Save Advance Voucher'"
      cancel-label="Cancel"
      @confirm="saveAdvance"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveAdvance">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Assign Driver" required shortcut="1">
              <DeskCombo
                v-model="form.driver"
                :options="driverOptions"
                placeholder="Select driver..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Associated Trip Reference" required shortcut="2">
              <DeskCombo
                v-model="form.tripRef"
                :options="tripOptions"
                placeholder="Select trip reference..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Advance Amount (₹)" required shortcut="3">
              <DeskNumberInput
                v-model="form.amount"
                placeholder="e.g. 15000"
                :step="500"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Disbursement Purpose" required shortcut="4">
              <DeskCombo
                v-model="form.purpose"
                :options="purposeOptions"
                placeholder="Select expense head..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Payment / Disbursement Mode" required shortcut="5">
              <DeskCombo
                v-model="form.mode"
                :options="['UPI / Bank', 'Cash Voucher', 'Company Card', 'Fastag Wallet']"
                placeholder="Select payment mode..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Approving Officer" required shortcut="6">
              <DeskCombo
                v-model="form.approvedBy"
                :options="['Ravi Mehta (Ops Mgr)', 'Priya Nair (Finance)', 'Ankit Shah (Director)']"
                placeholder="Select approver..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Voucher Status" required shortcut="7">
              <DeskCombo
                v-model="form.status"
                :options="['Approved', 'Pending Settlement', 'Settled']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Disbursement Date" required shortcut="8">
              <DeskDateInput
                v-model="form.date"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Confirm Delete Advance Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Advance Voucher"
      icon="warning"
      width="480px"
      confirm-label="Delete Voucher"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteAdvance"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Advance Voucher
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.id }}</span>
          for Driver <strong class="text-white">{{ deletingItem?.driver }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will cancel the disbursement voucher and remove it from trip settlements.
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

export interface DriverAdvance {
  id: string;
  tripRef: string;
  driver: string;
  date: string;
  amount: number;
  purpose: string;
  mode: string;
  approvedBy: string;
  status: string;
}

const notify = useAppNotify();
const search = ref('');
const purposeFilter = ref('ALL');
const statusFilter = ref('ALL');

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<DriverAdvance | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<DriverAdvance | null>(null);

const driverOptions = [
  'Devraj Patel (DRV-004)',
  'Suresh Bhai (DRV-003)',
  'Kishore Bhai (DRV-002)',
  'Ramesh Alumar (DRV-001)',
];

const tripOptions = [
  'TR/240078',
  'TR/240077',
  'TR/240076',
  'TR/240075',
  'TR/240074',
];

const purposeOptions = [
  'Diesel Top-up',
  'Toll & Fastag',
  'Driver Allowance',
  'En-route Tyre Repair',
  'Emergency Maintenance',
  'Police / RTO Chalan',
];

const purposeFilterOptions = [
  { label: 'All Purposes', value: 'ALL' },
  { label: 'Diesel Top-up', value: 'Diesel Top-up' },
  { label: 'Toll & Fastag', value: 'Toll & Fastag' },
  { label: 'Driver Allowance', value: 'Driver Allowance' },
  { label: 'En-route Tyre Repair', value: 'En-route Tyre Repair' },
];

const statusFilterOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending Settlement', value: 'Pending Settlement' },
  { label: 'Settled', value: 'Settled' },
];

const defaultAdvances: DriverAdvance[] = [
  { id: 'ADV/240012', tripRef: 'TR/240078', driver: 'Devraj Patel', date: '2026-10-22', amount: 15000, purpose: 'Diesel Top-up', mode: 'UPI / Bank', approvedBy: 'Ravi Mehta', status: 'Approved' },
  { id: 'ADV/240011', tripRef: 'TR/240077', driver: 'Suresh Bhai', date: '2026-10-21', amount: 10000, purpose: 'Toll & Fastag', mode: 'Cash Voucher', approvedBy: 'Ravi Mehta', status: 'Approved' },
  { id: 'ADV/240010', tripRef: 'TR/240076', driver: 'Kishore Bhai', date: '2026-10-20', amount: 8000, purpose: 'Driver Allowance', mode: 'Bank Transfer', approvedBy: 'Priya Nair', status: 'Approved' },
  { id: 'ADV/240009', tripRef: 'TR/240075', driver: 'Ramesh Alumar', date: '2026-10-19', amount: 20000, purpose: 'En-route Tyre Repair', mode: 'Company Card', approvedBy: 'Ankit Shah', status: 'Approved' },
  { id: 'ADV/240008', tripRef: 'TR/240074', driver: 'Devraj Patel', date: '2026-10-18', amount: 12000, purpose: 'Diesel Top-up', mode: 'UPI / Bank', approvedBy: 'Ravi Mehta', status: 'Pending Settlement' },
];

const advances = ref<DriverAdvance[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('tms_driver_advances');
  if (saved) {
    try {
      advances.value = JSON.parse(saved);
    } catch {
      advances.value = defaultAdvances;
    }
  } else {
    advances.value = defaultAdvances;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_driver_advances', JSON.stringify(advances.value));
}

const form = ref<Omit<DriverAdvance, 'id'>>({
  tripRef: 'TR/240078',
  driver: 'Devraj Patel',
  date: new Date().toISOString().slice(0, 10),
  amount: 10000,
  purpose: 'Diesel Top-up',
  mode: 'UPI / Bank',
  approvedBy: 'Ravi Mehta (Ops Mgr)',
  status: 'Approved',
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      message: 'Driver Advances Refreshed',
      caption: 'Disbursement ledger synced.',
      position: 'top-right',
    });
  }, 600);
}

const filteredAdvances = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  return advances.value.filter((a) => {
    const matchSearch =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.tripRef.toLowerCase().includes(q) ||
      a.driver.toLowerCase().includes(q) ||
      a.purpose.toLowerCase().includes(q);
    const matchPurpose = purposeFilter.value === 'ALL' || a.purpose === purposeFilter.value;
    const matchStatus = statusFilter.value === 'ALL' || a.status === statusFilter.value;
    return matchSearch && matchPurpose && matchStatus;
  });
});

const formattedTotalAdvances = computed(() => {
  const sum = advances.value.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedDieselTopup = computed(() => {
  const sum = advances.value
    .filter((a) => a.purpose === 'Diesel Top-up')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedTollAdvances = computed(() => {
  const sum = advances.value
    .filter((a) => a.purpose === 'Toll & Fastag')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedUnsettledAdvances = computed(() => {
  const sum = advances.value
    .filter((a) => a.status === 'Pending Settlement')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  return sum.toLocaleString();
});

const unsettledCount = computed(() => {
  return advances.value.filter((a) => a.status === 'Pending Settlement').length;
});

function getPurposePillClass(purpose: string) {
  switch (purpose) {
    case 'Diesel Top-up':
      return 'sub-fuel-station';
    case 'Toll & Fastag':
      return 'sub-customer';
    case 'Driver Allowance':
      return 'sub-driver';
    case 'En-route Tyre Repair':
    case 'Emergency Maintenance':
      return 'sub-service-centre';
    default:
      return 'sub-customer';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  form.value = {
    tripRef: 'TR/240078',
    driver: 'Devraj Patel',
    date: new Date().toISOString().slice(0, 10),
    amount: 10000,
    purpose: 'Diesel Top-up',
    mode: 'UPI / Bank',
    approvedBy: 'Ravi Mehta (Ops Mgr)',
    status: 'Approved',
  };
  showDialog.value = true;
}

function editAdvance(item: DriverAdvance) {
  isEditing.value = true;
  editingItem.value = item;
  form.value = {
    tripRef: item.tripRef,
    driver: item.driver,
    date: item.date,
    amount: item.amount,
    purpose: item.purpose,
    mode: item.mode,
    approvedBy: item.approvedBy,
    status: item.status,
  };
  showDialog.value = true;
}

function saveAdvance() {
  if (!form.value.driver || !form.value.tripRef || !form.value.amount) {
    notify.warning('Please enter driver, trip reference, and amount.');
    return;
  }

  const driverName = form.value.driver.split(' ')[0] + ' ' + (form.value.driver.split(' ')[1] || '');

  if (isEditing.value && editingItem.value) {
    const idx = advances.value.findIndex((a) => a.id === editingItem.value!.id);
    if (idx !== -1) {
      advances.value[idx] = {
        ...advances.value[idx],
        ...form.value,
        driver: driverName,
      };
      persist();
      notify.success(`Advance voucher ${editingItem.value.id} updated.`);
    }
  } else {
    const seq = 240013 + advances.value.length;
    const newAdv: DriverAdvance = {
      id: `ADV/${seq}`,
      ...form.value,
      driver: driverName,
    };
    advances.value.unshift(newAdv);
    persist();
    notify.success(`Advance voucher ${newAdv.id} recorded successfully.`);
  }

  showDialog.value = false;
}

function confirmDeleteAdvance(item: DriverAdvance) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteAdvance() {
  if (!deletingItem.value) return;
  advances.value = advances.value.filter((a) => a.id !== deletingItem.value!.id);
  persist();
  notify.success(`Advance voucher ${deletingItem.value.id} deleted.`);
  showDeleteDialog.value = false;
}

function exportAdvancesCsv() {
  exportToCsv(
    'driver_advances_register',
    [
      { label: 'Advance ID', field: 'id' },
      { label: 'Trip Reference', field: 'tripRef' },
      { label: 'Driver', field: 'driver' },
      { label: 'Date', field: 'date' },
      { label: 'Amount (INR)', field: 'amount' },
      { label: 'Purpose', field: 'purpose' },
      { label: 'Disbursement Mode', field: 'mode' },
      { label: 'Approved By', field: 'approvedBy' },
      { label: 'Status', field: 'status' },
    ],
    filteredAdvances.value,
  );
  notify.success(`${filteredAdvances.value.length} advance vouchers exported to CSV.`);
}

function exportAdvancesPdf() {
  exportToPdf({
    title: 'Driver Advances & Trip Disbursements Register',
    subtitle: `Total Advances: ${filteredAdvances.value.length} records`,
    columns: [
      { label: 'Adv ID', field: 'id' },
      { label: 'Trip Ref', field: 'tripRef' },
      { label: 'Driver', field: 'driver' },
      { label: 'Date', field: 'date' },
      { label: 'Amount', field: 'amount', align: 'right' },
      { label: 'Purpose', field: 'purpose' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredAdvances.value,
  });
}
</script>

<style scoped>
.driver-advances-page {
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
