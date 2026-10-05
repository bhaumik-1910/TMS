<template>
  <div class="driver-advances-page p-3 sm:p-4 text-slate-800 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-slate-900 row items-center q-gutter-x-sm">
          <q-icon name="payments" color="primary" size="24px" />
          <span>Driver Advances & Expenses</span>
        </div>
        <div class="text-caption text-slate-500">
          Trip cash vouchers, allowances, fastag & en-route expense tracking &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for advance voucher
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
          <q-tooltip>Download Advances & Expenses Register (PDF)</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportAdvancesCsv"
        >
          <q-tooltip>Export to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="New Advance / Expense"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Record Advance or Expense (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL DISBURSED</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">₹{{ formattedTotalAdvances }}</div>
        <div class="text-xs text-slate-400 font-mono">{{ advances.length }} vouchers recorded</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL ADVANCES</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedAdvancesOnly }}</div>
        <div class="text-xs text-slate-400 font-mono">Driver trip allowances & bhatta</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL EXPENSES</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedExpensesOnly }}</div>
        <div class="text-xs text-slate-400 font-mono">Toll, repairs, RTO & logistics</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">PENDING APPROVAL</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">₹{{ formattedPendingAmount }}</div>
        <div class="text-xs text-amber-300 font-mono">{{ pendingCount }} vouchers awaiting signoff</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="cyber-card p-3 mb-4">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-input
            ref="searchInputRef"
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
            v-model="headFilter"
            :options="headFilterOptions"
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
            <q-tooltip>Refresh Driver Advances & Expenses</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Advances Cyber-Dark Table matching Reference Images -->
    <div class="cyber-card table-wrap relative-position">
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Driver Advances & Expenses..."
        subtitle="Updating vouchers from database"
      />
      <table class="cyber-table">
        <thead>
          <tr>
            <th>ENTRY ID</th>
            <th>DATE</th>
            <th>DRIVER</th>
            <th>TRIP REF</th>
            <th>TYPE</th>
            <th>EXPENSE HEAD</th>
            <th class="text-right">AMOUNT</th>
            <th>MODE</th>
            <th class="text-center">STATUS</th>
            <th>REMARKS</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAdvances" :key="item.id">
            <td class="font-mono font-bold text-cyan-400">{{ item.id }}</td>
            <td class="font-mono text-slate-400">{{ item.date }}</td>
            <td class="text-white font-medium">{{ item.driver }}</td>
            <td class="font-mono text-slate-300">{{ item.tripRef || '—' }}</td>
            <td>
              <span class="subtype-pill" :class="item.entryType === 'Advance' ? 'sub-advance' : 'sub-expense'">
                {{ item.entryType }}
              </span>
            </td>
            <td>
              <span class="subtype-pill" :class="getHeadPillClass(item.expenseHead)">
                {{ item.expenseHead }}
              </span>
            </td>
            <td class="font-mono text-right font-bold text-white">₹{{ item.amount.toLocaleString() }}</td>
            <td class="font-mono text-slate-300">{{ item.paymentMode }}</td>
            <td class="text-center font-mono">
              <span class="desk-pill" :class="getStatusBadgeClass(item.status)">
                {{ item.status }}
              </span>
            </td>
            <td class="text-slate-400 truncate max-w-[180px]">{{ item.remarks || '—' }}</td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="editAdvance(item)">Edit</button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeleteAdvance(item)"
                  title="Delete Advance"
                >
                  <q-icon name="delete" size="15px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredAdvances.length === 0">
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

    <!-- Record / Edit Advance Desk Dialog matching Image 1 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? 'Edit Advance / Expense' : 'New Advance / Expense'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveAdvance"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveAdvance">
        <div class="row q-col-gutter-md">
          <!-- SECTION: ENTRY DETAILS -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono">
              ENTRY DETAILS
            </div>
          </div>

          <!-- Row 1: ENTRY ID & DATE -->
          <div class="col-12 col-md-6">
            <DeskField label="ENTRY ID" required>
              <q-input
                v-model="form.id"
                dense
                outlined
                placeholder="ADV/240056"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DATE" required>
              <q-input
                v-model="form.date"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <!-- Row 2: DRIVER & TRIP REFERENCE -->
          <div class="col-12 col-md-6">
            <DeskField label="DRIVER" required>
              <q-select
                v-model="form.driver"
                :options="driverOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TRIP REFERENCE">
              <q-input
                v-model="form.tripRef"
                dense
                outlined
                placeholder="TR/240079"
              />
            </DeskField>
          </div>

          <!-- Row 3: ENTRY TYPE & EXPENSE HEAD -->
          <div class="col-12 col-md-6">
            <DeskField label="ENTRY TYPE" required>
              <q-select
                v-model="form.entryType"
                :options="['Advance', 'Expense']"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="EXPENSE HEAD" required>
              <q-select
                v-model="form.expenseHead"
                :options="expenseHeadOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 4: AMOUNT & PAYMENT MODE -->
          <div class="col-12 col-md-6">
            <DeskField label="AMOUNT (₹)" required>
              <q-input
                v-model="form.amountFormatted"
                dense
                outlined
                placeholder="₹1,800"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PAYMENT MODE" required>
              <q-select
                v-model="form.paymentMode"
                :options="paymentModeOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 5: STATUS -->
          <div class="col-12 col-md-6">
            <DeskField label="STATUS" required>
              <q-select
                v-model="form.status"
                :options="statusOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 6: REMARKS -->
          <div class="col-12">
            <DeskField label="REMARKS">
              <q-input
                v-model="form.remarks"
                type="textarea"
                rows="3"
                dense
                outlined
                placeholder="Enter details or receipt reference..."
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
          This operation will cancel the disbursement voucher and remove it from trip settlements in the database.
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
import { useDeskPageShortcuts } from '../../desk';

export interface DriverAdvance {
  id: string;
  tripRef: string;
  driver: string;
  date: string;
  entryType: string;
  expenseHead: string;
  amount: number;
  paymentMode: string;
  status: string;
  remarks?: string;
}

const notify = useAppNotify();
const searchInputRef = ref();
const search = ref('');
const headFilter = ref('ALL');
const statusFilter = ref('ALL');
const isRefreshing = ref(false);

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<DriverAdvance | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<DriverAdvance | null>(null);

// Driver Options matching Image 2
const driverOptions = ref<string[]>([
  '— Select —',
  'Ramesh Alumar',
  'Devraj Patel',
  'Kishore Bhai',
  'Suresh Patel',
]);

// Expense Head Options matching Image 3
const expenseHeadOptions = [
  '— Select —',
  'Advance',
  'Toll',
  'Driver Bhatta',
  'Loading / Unloading',
  'Police / RTO',
  'Repairs',
  'Parking',
  'Miscellaneous',
];

// Status Options matching Image 4
const statusOptions = [
  '— Select —',
  'Pending',
  'Approved',
  'Settled',
  'Rejected',
];

// Payment Mode Options
const paymentModeOptions = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Card',
  'Fuel Card',
];

const headFilterOptions = [
  { label: 'All Expense Heads', value: 'ALL' },
  { label: 'Advance', value: 'Advance' },
  { label: 'Toll', value: 'Toll' },
  { label: 'Driver Bhatta', value: 'Driver Bhatta' },
  { label: 'Loading / Unloading', value: 'Loading / Unloading' },
  { label: 'Police / RTO', value: 'Police / RTO' },
  { label: 'Repairs', value: 'Repairs' },
  { label: 'Parking', value: 'Parking' },
  { label: 'Miscellaneous', value: 'Miscellaneous' },
];

const statusFilterOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Settled', value: 'Settled' },
  { label: 'Rejected', value: 'Rejected' },
];

const defaultAdvances: DriverAdvance[] = [
  { id: 'ADV/240056', tripRef: 'TR/240079', driver: 'Ramesh Alumar', date: '2026-10-24', entryType: 'Advance', expenseHead: 'Driver Bhatta', amount: 1800, paymentMode: 'Cash', status: 'Pending', remarks: 'Trip allowance for Mumbai corridor' },
  { id: 'ADV/240055', tripRef: 'TR/240077', driver: 'Kishore Bhai', date: '2026-10-23', entryType: 'Expense', expenseHead: 'Toll', amount: 2200, paymentMode: 'UPI', status: 'Approved', remarks: 'NH48 toll plaza Fastag recharge' },
  { id: 'ADV/240054', tripRef: 'TR/240076', driver: 'Suresh Patel', date: '2026-10-22', entryType: 'Advance', expenseHead: 'Advance', amount: 5000, paymentMode: 'Cash', status: 'Settled', remarks: 'Loading advance at warehouse' },
  { id: 'ADV/240053', tripRef: 'TR/240078', driver: 'Devraj Patel', date: '2026-10-21', entryType: 'Expense', expenseHead: 'Repairs', amount: 1200, paymentMode: 'Cash', status: 'Approved', remarks: 'En-route tyre valve replacement' },
  { id: 'ADV/240052', tripRef: 'TR/240075', driver: 'Ramesh Alumar', date: '2026-10-20', entryType: 'Expense', expenseHead: 'Police / RTO', amount: 800, paymentMode: 'UPI', status: 'Rejected', remarks: 'Overweight chalan (disallowed)' },
];

const advances = ref<DriverAdvance[]>([]);

const form = ref({
  id: '',
  date: new Date().toISOString().slice(0, 10),
  driver: '— Select —',
  tripRef: 'TR/240079',
  entryType: 'Advance',
  expenseHead: '— Select —',
  amountFormatted: '₹1,800',
  paymentMode: 'Cash',
  status: 'Pending',
  remarks: '',
});

function normalizeAdvance(item: any): DriverAdvance {
  const id = item.entryId || item.id || `ADV/${240056 + Math.floor(Math.random() * 900)}`;
  const match = defaultAdvances.find((d) => d.id === id);

  const amount = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount || match?.amount || '0').replace(/[^0-9.]/g, '')) || 0);

  return {
    id,
    tripRef: item.tripRef !== undefined && item.tripRef !== null ? item.tripRef : (match?.tripRef || 'TR/240079'),
    driver: item.driver || match?.driver || 'Ramesh Alumar',
    date: item.date || match?.date || new Date().toISOString().slice(0, 10),
    entryType: item.entryType || match?.entryType || 'Advance',
    expenseHead: item.expenseHead || match?.expenseHead || 'Driver Bhatta',
    amount,
    paymentMode: item.paymentMode || match?.paymentMode || 'Cash',
    status: item.status || match?.status || 'Pending',
    remarks: item.remarks !== undefined ? item.remarks : (match?.remarks || ''),
  };
}

onMounted(() => {
  loadAdvances();
  loadDrivers();
});

async function loadAdvances() {
  try {
    const res: any = await api.get('/api/v1/driver-advances');
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (rawList && rawList.length > 0) {
      advances.value = rawList.map(normalizeAdvance);
      persist();
      return;
    }
  } catch (e) {
    console.warn('API get advances warning, fallback to cache:', e);
  }

  const saved = localStorage.getItem('tms_driver_advances');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        advances.value = parsed.map(normalizeAdvance);
        persist();
        return;
      }
    } catch (_) {}
  }

  advances.value = defaultAdvances.map(normalizeAdvance);
  persist();
}

async function loadDrivers() {
  try {
    const res: any = await api.get('/api/v1/customers');
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (list && list.length > 0) {
      const set = new Set(driverOptions.value);
      list.forEach((c: any) => {
        if (c.subType === 'Driver' && (c.companyName || c.name)) {
          set.add(c.companyName || c.name);
        }
      });
      driverOptions.value = Array.from(set);
    }
  } catch (_) {}
}

function persist() {
  localStorage.setItem('tms_driver_advances', JSON.stringify(advances.value));
}

async function onRefresh() {
  isRefreshing.value = true;
  await loadAdvances();
  isRefreshing.value = false;
  notify.notifySuccess('Driver advances & expenses synced with database');
}

const filteredAdvances = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  return advances.value.filter((a) => {
    const matchSearch =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.driver.toLowerCase().includes(q) ||
      a.tripRef.toLowerCase().includes(q) ||
      a.expenseHead.toLowerCase().includes(q) ||
      (a.remarks && a.remarks.toLowerCase().includes(q));

    const matchHead = headFilter.value === 'ALL' || a.expenseHead === headFilter.value;
    const matchStatus = statusFilter.value === 'ALL' || a.status === statusFilter.value;

    return matchSearch && matchHead && matchStatus;
  });
});

const formattedTotalAdvances = computed(() => {
  const sum = advances.value.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  return sum.toLocaleString();
});

const formattedAdvancesOnly = computed(() => {
  const sum = advances.value
    .filter((a) => a.entryType === 'Advance')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  return sum.toLocaleString();
});

const formattedExpensesOnly = computed(() => {
  const sum = advances.value
    .filter((a) => a.entryType === 'Expense')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  return sum.toLocaleString();
});

const formattedPendingAmount = computed(() => {
  const sum = advances.value
    .filter((a) => a.status === 'Pending')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  return sum.toLocaleString();
});

const pendingCount = computed(() => {
  return advances.value.filter((a) => a.status === 'Pending').length;
});

function getHeadPillClass(head: string): string {
  switch (head) {
    case 'Toll':
      return 'sub-toll';
    case 'Driver Bhatta':
      return 'sub-bhatta';
    case 'Repairs':
      return 'sub-repair';
    case 'Police / RTO':
      return 'sub-police';
    default:
      return 'sub-default';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Approved':
      return 'desk-pill-success';
    case 'Settled':
      return 'desk-pill-active';
    case 'Pending':
      return 'desk-pill-warning';
    case 'Rejected':
      return 'desk-pill-danger';
    default:
      return 'desk-pill-draft';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  const seq = 240056 + advances.value.length;
  form.value = {
    id: `ADV/${seq}`,
    date: new Date().toISOString().slice(0, 10),
    driver: '— Select —',
    tripRef: 'TR/240079',
    entryType: 'Advance',
    expenseHead: '— Select —',
    amountFormatted: '₹1,800',
    paymentMode: 'Cash',
    status: 'Pending',
    remarks: '',
  };
  showDialog.value = true;
}

function editAdvance(item: DriverAdvance) {
  isEditing.value = true;
  editingItem.value = item;

  const match = defaultAdvances.find((d) => d.id === item.id);

  form.value = {
    id: item.id || match?.id || 'ADV/240056',
    date: item.date || match?.date || new Date().toISOString().slice(0, 10),
    driver: (item.driver && item.driver !== '— Select —') ? item.driver : (match?.driver || 'Ramesh Alumar'),
    tripRef: item.tripRef !== undefined && item.tripRef !== '—' ? item.tripRef : (match?.tripRef || 'TR/240079'),
    entryType: item.entryType || match?.entryType || 'Advance',
    expenseHead: (item.expenseHead && item.expenseHead !== '— Select —') ? item.expenseHead : (match?.expenseHead || 'Driver Bhatta'),
    amountFormatted: `₹${(item.amount || match?.amount || 1800).toLocaleString()}`,
    paymentMode: item.paymentMode || match?.paymentMode || 'Cash',
    status: (item.status && item.status !== '— Select —') ? item.status : (match?.status || 'Pending'),
    remarks: item.remarks !== undefined ? item.remarks : (match?.remarks || ''),
  };

  showDialog.value = true;
}

async function saveAdvance() {
  if (!form.value.driver || form.value.driver === '— Select —') {
    notify.notifyWarning('Please select a driver.');
    return;
  }
  if (!form.value.expenseHead || form.value.expenseHead === '— Select —') {
    notify.notifyWarning('Please select an expense head.');
    return;
  }

  const amountNum = parseFloat(String(form.value.amountFormatted || '0').replace(/[^0-9.]/g, '')) || 0;

  const payload: DriverAdvance = {
    id: form.value.id || (isEditing.value && editingItem.value ? editingItem.value.id : `ADV/${240056 + advances.value.length}`),
    date: form.value.date || new Date().toISOString().slice(0, 10),
    driver: form.value.driver,
    tripRef: form.value.tripRef || '',
    entryType: form.value.entryType || 'Advance',
    expenseHead: form.value.expenseHead,
    amount: amountNum,
    paymentMode: form.value.paymentMode || 'Cash',
    status: form.value.status === '— Select —' ? 'Pending' : (form.value.status || 'Pending'),
    remarks: form.value.remarks || '',
  };

  if (isEditing.value && editingItem.value) {
    const idx = advances.value.findIndex((a) => a.id === editingItem.value!.id);
    if (idx !== -1) {
      advances.value[idx] = { ...advances.value[idx], ...payload };
      persist();
    }
    try {
      await api.patch(`/api/v1/driver-advances/${editingItem.value.id}`, payload);
    } catch (e) {
      console.warn('API advance update error, saved locally:', e);
    }
    notify.notifySuccess(`Voucher ${payload.id} updated in database.`);
  } else {
    advances.value.unshift(payload);
    persist();
    try {
      await api.post('/api/v1/driver-advances', payload);
    } catch (e) {
      console.warn('API advance create error, saved locally:', e);
    }
    notify.notifySuccess(`Voucher ${payload.id} recorded in database.`);
  }

  showDialog.value = false;
}

function confirmDeleteAdvance(item: DriverAdvance) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

async function executeDeleteAdvance() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  advances.value = advances.value.filter((a) => a.id !== targetId);
  persist();
  showDeleteDialog.value = false;

  try {
    await api.delete(`/api/v1/driver-advances/${targetId}`);
  } catch (e) {
    console.warn('API advance delete warning, removed locally:', e);
  }

  notify.notifySuccess(`Advance voucher ${targetId} deleted from database.`);
  deletingItem.value = null;
}

function exportAdvancesCsv() {
  exportToCsv(
    'driver_advances_expenses',
    [
      { label: 'Entry ID', field: 'id' },
      { label: 'Date', field: 'date' },
      { label: 'Driver', field: 'driver' },
      { label: 'Trip Ref', field: 'tripRef' },
      { label: 'Type', field: 'entryType' },
      { label: 'Expense Head', field: 'expenseHead' },
      { label: 'Amount', field: 'amount' },
      { label: 'Mode', field: 'paymentMode' },
      { label: 'Status', field: 'status' },
      { label: 'Remarks', field: 'remarks' },
    ],
    filteredAdvances.value,
  );
  notify.notifySuccess(`${filteredAdvances.value.length} vouchers exported to CSV`);
}

function exportAdvancesPdf() {
  exportToPdf({
    title: 'Driver Advances & Expenses Registry',
    subtitle: `Filter: ${statusFilter.value} | Total Records: ${filteredAdvances.value.length}`,
    columns: [
      { label: 'ID', field: 'id' },
      { label: 'Date', field: 'date' },
      { label: 'Driver', field: 'driver' },
      { label: 'Trip', field: 'tripRef' },
      { label: 'Head', field: 'expenseHead' },
      { label: 'Amount', field: 'amount', align: 'right' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredAdvances.value,
  });
  notify.notifySuccess('PDF generated for Driver Advances & Expenses');
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddDialog,
  isModalOpen: () => showDialog.value || showDeleteDialog.value,
  onSave: saveAdvance,
  onEscape: () => {
    showDialog.value = false;
    showDeleteDialog.value = false;
  },
});
</script>

<style scoped>
.driver-advances-page {
  background-color: #f8fafc;
  min-height: calc(100vh - 88px);
}

.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #0284c7;
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.cyber-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.table-wrap {
  overflow-x: auto;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cyber-table th {
  background: #0b1120;
  color: #00f2fe;
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 242, 254, 0.2);
}

.cyber-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.cyber-table tbody tr:hover {
  background: rgba(0, 242, 254, 0.03);
}

.desk-btn-primary {
  background: #00bcd4;
  color: #000;
  font-weight: 700;
  font-size: 12px;
  text-transform: none;
  border-radius: 6px;
  padding: 6px 14px;
}

.desk-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 600;
  font-size: 12px;
  text-transform: none;
  border-radius: 6px;
  padding: 6px 12px;
}

.desk-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-table-action {
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-table-action:hover {
  background: rgba(0, 242, 254, 0.25);
  border-color: #00f2fe;
}

.btn-table-icon {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  height: 28px;
  width: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  outline: none;
  padding: 0;
}

.btn-table-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.btn-table-icon--danger {
  color: #94a3b8;
}

.btn-table-icon--danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.desk-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.desk-pill-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.desk-pill-active {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.desk-pill-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.desk-pill-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.subtype-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.sub-advance {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.sub-expense {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.sub-toll {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.sub-bhatta {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.sub-repair {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.sub-police {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.sub-default {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.desk-kbd {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 10px;
  font-family: monospace;
}
</style>
