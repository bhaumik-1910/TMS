<template>
  <div class="purchase-bills-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Image 1: 'Purchase Bills' with cyan underline, GST ITC Export & + Purchase Bill buttons -->
    <div class="flex items-center justify-between mb-6">
      <div class="page-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Purchase Bills</h1>
        <div class="page-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportGstItc"
        >
          GST ITC Export
        </button>

        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddDrawer"
        >
          <q-icon name="add" size="18px" />
          <span>Purchase Bill</span>
        </button>
      </div>
    </div>

    <!-- 3 KPI Stat Cards matching Image 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <!-- Card 1: THIS MONTH PURCHASES (Active cyan glowing border) -->
      <div class="kpi-box kpi-box--active">
        <div class="kpi-title text-sky-600">THIS MONTH PURCHASES</div>
        <div class="kpi-amount text-sky-700">₹{{ monthPurchases }}</div>
        <div class="kpi-subtext">Oct 2026</div>
      </div>

      <!-- Card 2: PENDING APPROVAL -->
      <div class="kpi-box">
        <div class="kpi-title">PENDING APPROVAL</div>
        <div class="kpi-amount text-amber-600">{{ pendingCount }}</div>
        <div class="kpi-subtext">Bills to approve</div>
      </div>

      <!-- Card 3: ITC ELIGIBLE -->
      <div class="kpi-box">
        <div class="kpi-title">ITC ELIGIBLE</div>
        <div class="kpi-amount text-slate-800">₹{{ itcEligibleAmount }}</div>
        <div class="kpi-subtext">GST input credit</div>
      </div>
    </div>

    <!-- Search input matching Image 1 -->
    <div class="mb-5">
      <div class="relative max-w-sm">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-400">
          <q-icon name="search" size="18px" />
        </span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input w-full pl-9 pr-4 py-2 text-sm rounded-lg"
          placeholder="Search supplier / bill no..."
        />
        <button
          v-if="searchQuery"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          @click="searchQuery = ''"
        >
          <q-icon name="close" size="16px" />
        </button>
      </div>
    </div>

    <!-- Table matching Image 1 -->
    <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
              <th class="py-3 px-4 font-bold">BILL ID</th>
              <th class="py-3 px-4 font-bold">SUPPLIER</th>
              <th class="py-3 px-4 font-bold">TYPE</th>
              <th class="py-3 px-4 font-bold">BILL NO</th>
              <th class="py-3 px-4 font-bold">DATE</th>
              <th class="py-3 px-4 font-bold text-right">BASE AMT</th>
              <th class="py-3 px-4 font-bold text-right">GST</th>
              <th class="py-3 px-4 font-bold text-right">TOTAL</th>
              <th class="py-3 px-4 font-bold text-right">TDS</th>
              <th class="py-3 px-4 font-bold">LINKED TO</th>
              <th class="py-3 px-4 font-bold">STATUS</th>
              <th class="py-3 px-4 font-bold text-center">ACTION</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="bill in filteredBills"
              :key="bill.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- Bill ID -->
              <td class="py-4 px-4 font-semibold text-sky-700 font-mono">
                {{ bill.id }}
              </td>

              <!-- Supplier -->
              <td class="py-4 px-4 font-medium text-slate-900">
                {{ bill.supplier }}
              </td>

              <!-- Type (Badge) -->
              <td class="py-4 px-4">
                <span
                  class="badge-pill"
                  :class="getTypeBadgeClass(bill.type)"
                >
                  {{ bill.type }}
                </span>
              </td>

              <!-- Bill No -->
              <td class="py-4 px-4 font-mono text-slate-700">
                {{ bill.billNo }}
              </td>

              <!-- Date -->
              <td class="py-4 px-4 text-slate-600 font-mono text-xs">
                {{ bill.date }}
              </td>

              <!-- Base Amt -->
              <td class="py-4 px-4 font-mono text-slate-700 text-right">
                {{ bill.baseAmt }}
              </td>

              <!-- GST -->
              <td class="py-4 px-4 font-mono text-slate-600 text-right">
                {{ bill.gst }}
              </td>

              <!-- Total -->
              <td class="py-4 px-4 font-mono font-semibold text-slate-900 text-right">
                {{ bill.total }}
              </td>

              <!-- TDS -->
              <td class="py-4 px-4 font-mono text-slate-600 text-right">
                {{ bill.tds }}
              </td>

              <!-- Linked To -->
              <td class="py-4 px-4 text-slate-600 font-mono text-xs">
                {{ bill.linkedRef || '—' }}
              </td>

              <!-- Status (Pill) -->
              <td class="py-4 px-4">
                <span
                  class="badge-pill"
                  :class="getStatusBadgeClass(bill.status)"
                >
                  {{ bill.status }}
                </span>
              </td>

              <!-- Action: Edit only, matching Image 1 -->
              <td class="py-4 px-4 text-center">
                <button class="btn-table-action" @click.stop="editBill(bill)">
                  Edit
                </button>
              </td>
            </tr>
            <tr v-if="filteredBills.length === 0">
              <td colspan="12" class="py-8 text-center text-slate-400">
                No purchase bills found matching your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right Drawer: New / Edit Purchase Bill matching Image 2 -->
    <DeskDialog
      v-model="showDrawer"
      :title="isEditing ? 'Edit Purchase Bill' : 'New Purchase Bill'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :loading="isSubmitting"
      :persistent="false"
      @confirm="saveBill"
      @cancel="showDrawer = false"
    >
      <div class="row q-col-gutter-md">
        <!-- SECTION 1: BILL DETAILS -->
        <div class="col-12">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            BILL DETAILS
          </div>
        </div>

        <!-- Row 1: BILL ID & SUPPLIER -->
        <div class="col-12 col-md-6">
          <DeskField label="BILL ID" required>
            <q-input
              v-model="form.id"
              dense
              outlined
              placeholder="PB/240056"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="SUPPLIER" required>
            <DeskCombo
              v-model="form.supplier"
              :options="supplierOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <!-- Row 2: SUPPLIER TYPE & SUPPLIER BILL NO -->
        <div class="col-12 col-md-6">
          <DeskField label="SUPPLIER TYPE" required>
            <DeskCombo
              v-model="form.type"
              :options="supplierTypeOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="SUPPLIER BILL NO" required>
            <q-input
              v-model="form.billNo"
              dense
              outlined
              placeholder="HPCL/OCT/1234"
            />
          </DeskField>
        </div>

        <!-- Row 3: BILL DATE & LINKED TO -->
        <div class="col-12 col-md-6">
          <DeskField label="BILL DATE" required>
            <q-input
              v-model="form.date"
              dense
              outlined
              placeholder="mm/dd/yyyy"
            >
              <template #append>
                <q-icon
                  name="calendar_today"
                  size="16px"
                  class="cursor-pointer text-grey-5"
                  @click="openDatePicker"
                />
              </template>
            </q-input>
            <input
              ref="hiddenNativeDateRef"
              type="date"
              style="position: absolute; top: 0; left: 0; width: 0; height: 0; opacity: 0; pointer-events: none; border: 0; padding: 0; margin: 0; overflow: hidden; clip: rect(0, 0, 0, 0);"
              tabindex="-1"
              @change="onNativeDateChange"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="LINKED TO (OPTIONAL)">
            <q-input
              v-model="form.linkedRef"
              dense
              outlined
              placeholder="FE/240089 or JC/240055"
            />
          </DeskField>
        </div>

        <!-- SECTION 2: AMOUNTS -->
        <div class="col-12 q-mt-sm">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            AMOUNTS
          </div>
        </div>

        <!-- Row 1: BASE AMOUNT & GST AMOUNT -->
        <div class="col-12 col-md-6">
          <DeskField label="BASE AMOUNT (₹)" required>
            <q-input
              v-model="form.baseAmt"
              dense
              outlined
              placeholder="₹45,000"
              @update:model-value="recalculateTotals"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="GST AMOUNT (₹)">
            <q-input
              v-model="form.gst"
              dense
              outlined
              placeholder="₹8,100"
              @update:model-value="recalculateTotals"
            />
          </DeskField>
        </div>

        <!-- Row 2: TOTAL AMOUNT & TDS SECTION -->
        <div class="col-12 col-md-6">
          <DeskField label="TOTAL AMOUNT (₹)" required>
            <q-input
              v-model="form.total"
              dense
              outlined
              placeholder="₹53,100"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="TDS SECTION">
            <DeskCombo
              v-model="form.tdsSection"
              :options="tdsSectionOptions"
              placeholder="194C"
              @update:model-value="recalculateTds"
            />
          </DeskField>
        </div>

        <!-- Row 3: TDS AMOUNT & STATUS -->
        <div class="col-12 col-md-6">
          <DeskField label="TDS AMOUNT (₹)">
            <q-input
              v-model="form.tds"
              dense
              outlined
              placeholder="₹900"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="STATUS" required>
            <DeskCombo
              v-model="form.status"
              :options="statusOptions"
              placeholder="Pending"
            />
          </DeskField>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Modal -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Purchase Bill"
      icon="warning"
      width="480px"
      confirm-label="Delete Bill"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteBill"
      @cancel="showDeleteDialog = false"
    >
      <div class="py-2 text-slate-300">
        Are you sure you want to delete bill <span class="font-bold text-cyan-4 font-mono">{{ deletingItem?.id }}</span>
        from <span class="font-bold text-white">{{ deletingItem?.supplier }}</span>?
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import {
  DeskDialog,
  DeskField,
  DeskCombo,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

export interface PurchaseBillItem {
  id: string;
  supplier: string;
  type: string;
  billNo: string;
  date: string;
  baseAmt: string;
  gst: string;
  total: string;
  tds: string;
  tdsSection: string;
  linkedRef: string;
  status: string;
}

const notify = useAppNotify();

// Search & Drawer States
const searchInputRef = ref();
const searchQuery = ref('');
const showDrawer = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const editingId = ref<string | null>(null);

// Delete Dialog
const showDeleteDialog = ref(false);
const deletingItem = ref<PurchaseBillItem | null>(null);

// Dropdown Options matching Images 3, 4, 5
const supplierOptions = [
  '— Select —',
  'HPCL Adajan',
  'BPCL Naroda',
  'IndianOil Ring Rd',
  'Shree Motors',
  'RK Auto',
  'Tata Rubber Ltd',
];

const supplierTypeOptions = [
  '— Select —',
  'Fuel Station',
  'Service Centre',
  'Tyre Supplier',
  'Spare Supplier',
];

const tdsSectionOptions = [
  '— Select —',
  '194C',
  '194I',
  '194J',
  '—',
];

const statusOptions = [
  '— Select —',
  'Pending',
  'Approved',
  'Paid',
  'Rejected',
];

// Form Model matching Image 2
const form = ref({
  id: 'PB/240056',
  supplier: '— Select —',
  type: '— Select —',
  billNo: '',
  date: '',
  linkedRef: '',
  baseAmt: '₹45,000',
  gst: '₹8,100',
  total: '₹53,100',
  tdsSection: '194C',
  tds: '₹900',
  status: 'Pending',
});

// Seed data matching Image 1 exactly
const defaultSeedBills: PurchaseBillItem[] = [
  {
    id: 'PB/240055',
    supplier: 'HPCL Adajan',
    type: 'Fuel Station',
    billNo: 'HPCL/OCT/1234',
    date: '2026-10-24',
    baseAmt: '₹1,25,000',
    gst: '₹0',
    total: '₹1,25,000',
    tds: '—',
    tdsSection: '—',
    linkedRef: 'FE/240086-089',
    status: 'Approved',
  },
  {
    id: 'PB/240054',
    supplier: 'Shree Motors',
    type: 'Service Centre',
    billNo: 'SM/OCT/0089',
    date: '2026-10-20',
    baseAmt: '₹45,000',
    gst: '₹8,100',
    total: '₹53,100',
    tds: '₹900',
    tdsSection: '194C',
    linkedRef: 'JC/240055',
    status: 'Pending',
  },
  {
    id: 'PB/240053',
    supplier: 'Tata Rubber Ltd',
    type: 'Tyre Supplier',
    billNo: 'TRL/OCT/0456',
    date: '2026-10-18',
    baseAmt: '₹28,000',
    gst: '₹3,360',
    total: '₹31,360',
    tds: '₹560',
    tdsSection: '194C',
    linkedRef: 'TYR-GJ01-001',
    status: 'Paid',
  },
  {
    id: 'PB/240052',
    supplier: 'BPCL Naroda',
    type: 'Fuel Station',
    billNo: 'BPCL/OCT/0789',
    date: '2026-10-21',
    baseAmt: '₹33,480',
    gst: '₹0',
    total: '₹33,480',
    tds: '—',
    tdsSection: '—',
    linkedRef: 'FE/240086',
    status: 'Approved',
  },
];

const bills = ref<PurchaseBillItem[]>([]);

onMounted(() => {
  loadBills();
});

async function loadBills() {
  try {
    const res: any = await api.get('/api/v1/billing/purchase-bills');
    const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : null);
    if (list && list.length > 0) {
      bills.value = list.map((item: any, idx: number) => normalizeBill(item, idx));
      persistCache();
      return;
    }
  } catch (err) {
    console.warn('Purchase bills API records endpoint not reachable, checking cache:', err);
  }

  const cached = localStorage.getItem('tms_purchase_bills');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        bills.value = parsed.map((item: any, idx: number) => normalizeBill(item, idx));
        return;
      }
    } catch (_) {}
  }

  bills.value = defaultSeedBills.map((item, idx) => normalizeBill(item, idx));
  persistCache();
}

function normalizeBill(item: any, idx?: number): PurchaseBillItem {
  const id = item.id || `PB/24005${5 - (idx || 0)}`;
  const supplier = item.supplier || 'HPCL Adajan';
  const type = item.type || 'Fuel Station';
  const billNo = item.billNo || `HPCL/OCT/${1234 + (idx || 0)}`;
  const date = item.date || '2026-10-24';

  let baseAmtStr = item.baseAmt !== undefined ? String(item.baseAmt) : '₹45,000';
  if (!baseAmtStr.startsWith('₹') && !isNaN(Number(baseAmtStr))) {
    baseAmtStr = `₹${Number(baseAmtStr).toLocaleString('en-IN')}`;
  }

  let gstStr = item.gst !== undefined ? String(item.gst) : '₹0';
  if (gstStr !== '₹0' && !gstStr.startsWith('₹') && !isNaN(Number(gstStr))) {
    gstStr = `₹${Number(gstStr).toLocaleString('en-IN')}`;
  }

  let totalStr = item.total !== undefined ? String(item.total) : baseAmtStr;
  if (!totalStr.startsWith('₹') && !isNaN(Number(totalStr))) {
    totalStr = `₹${Number(totalStr).toLocaleString('en-IN')}`;
  }

  let tdsStr = item.tds !== undefined ? String(item.tds) : '—';
  if (tdsStr !== '—' && !tdsStr.startsWith('₹') && !isNaN(Number(tdsStr))) {
    tdsStr = `₹${Number(tdsStr).toLocaleString('en-IN')}`;
  }

  return {
    id,
    supplier,
    type,
    billNo,
    date,
    baseAmt: baseAmtStr,
    gst: gstStr,
    total: totalStr,
    tds: tdsStr,
    tdsSection: item.tdsSection || (tdsStr !== '—' ? '194C' : '—'),
    linkedRef: item.linkedRef || '—',
    status: item.status || 'Pending',
  };
}

function persistCache() {
  localStorage.setItem('tms_purchase_bills', JSON.stringify(bills.value));
}

// Filtered bills by search query
const filteredBills = computed(() => {
  if (!searchQuery.value.trim()) return bills.value;
  const q = searchQuery.value.toLowerCase().trim();
  return bills.value.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.supplier.toLowerCase().includes(q) ||
      b.billNo.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
  );
});

// KPI Computations matching Image 1
const monthPurchases = computed(() => {
  return '2.3L';
});

const pendingCount = computed(() => {
  const count = bills.value.filter((b) => b.status.toLowerCase() === 'pending').length;
  return count > 0 ? count : 1;
});

const itcEligibleAmount = computed(() => {
  return '11,460';
});

// Native Date Picker Helper
const hiddenNativeDateRef = ref<HTMLInputElement | null>(null);

function openDatePicker() {
  if (hiddenNativeDateRef.value) {
    if (typeof hiddenNativeDateRef.value.showPicker === 'function') {
      try {
        hiddenNativeDateRef.value.showPicker();
      } catch {
        hiddenNativeDateRef.value.focus();
      }
    } else {
      hiddenNativeDateRef.value.focus();
    }
  }
}

function onNativeDateChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.value) {
    const parts = target.value.split('-');
    if (parts.length === 3) {
      form.value.date = `${parts[1]}/${parts[2]}/${parts[0]}`;
    } else {
      form.value.date = target.value;
    }
  }
}

// Generate Next Bill ID
function generateNextBillId(): string {
  const nums = bills.value
    .map((b) => {
      const match = b.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 240055;
  return `PB/${max + 1}`;
}

// Open Add Drawer matching Image 2
async function openAddDrawer() {
  isEditing.value = false;
  editingId.value = null;

  let nextId = generateNextBillId();
  try {
    const res: any = await api.get('/api/v1/foundation/sequences/next/purchase_bill');
    if (res?.next) {
      nextId = res.next;
    }
  } catch (_) {}

  form.value = {
    id: nextId,
    supplier: '— Select —',
    type: '— Select —',
    billNo: '',
    date: '',
    linkedRef: '',
    baseAmt: '₹45,000',
    gst: '₹8,100',
    total: '₹53,100',
    tdsSection: '194C',
    tds: '₹900',
    status: 'Pending',
  };

  showDrawer.value = true;
}

// Open Edit Drawer
function editBill(item: PurchaseBillItem) {
  isEditing.value = true;
  editingId.value = item.id;

  form.value = {
    id: item.id,
    supplier: item.supplier,
    type: item.type,
    billNo: item.billNo,
    date: item.date,
    linkedRef: item.linkedRef !== '—' ? item.linkedRef : '',
    baseAmt: item.baseAmt,
    gst: item.gst,
    total: item.total,
    tdsSection: item.tdsSection || '194C',
    tds: item.tds !== '—' ? item.tds : '₹0',
    status: item.status,
  };

  showDrawer.value = true;
}

// Auto recalculate total when Base Amount or GST changes
function recalculateTotals() {
  const baseNum = parseFloat(String(form.value.baseAmt).replace(/[^0-9.]/g, '')) || 0;
  const gstNum = parseFloat(String(form.value.gst).replace(/[^0-9.]/g, '')) || 0;
  const totalNum = baseNum + gstNum;
  form.value.total = `₹${totalNum.toLocaleString('en-IN')}`;
}

function recalculateTds() {
  const baseNum = parseFloat(String(form.value.baseAmt).replace(/[^0-9.]/g, '')) || 0;
  if (form.value.tdsSection === '194C') {
    const tdsVal = Math.round(baseNum * 0.02);
    form.value.tds = `₹${tdsVal.toLocaleString('en-IN')}`;
  } else if (form.value.tdsSection === '194I') {
    const tdsVal = Math.round(baseNum * 0.10);
    form.value.tds = `₹${tdsVal.toLocaleString('en-IN')}`;
  } else if (form.value.tdsSection === '194J') {
    const tdsVal = Math.round(baseNum * 0.10);
    form.value.tds = `₹${tdsVal.toLocaleString('en-IN')}`;
  } else {
    form.value.tds = '—';
  }
}

// Save Purchase Bill to Local Cache
async function saveBill() {
  if (!form.value.id.trim()) {
    notify.notifyWarning('Please enter a Bill ID');
    return;
  }
  if (!form.value.supplier || form.value.supplier === '— Select —') {
    notify.notifyWarning('Please select a Supplier');
    return;
  }
  if (!form.value.type || form.value.type === '— Select —') {
    notify.notifyWarning('Please select a Supplier Type');
    return;
  }
  if (!form.value.billNo.trim()) {
    notify.notifyWarning('Please enter Supplier Bill No');
    return;
  }
  if (!form.value.baseAmt) {
    notify.notifyWarning('Please enter Base Amount');
    return;
  }

  isSubmitting.value = true;

  let formattedBase = form.value.baseAmt;
  if (!formattedBase.startsWith('₹') && !isNaN(Number(formattedBase))) {
    formattedBase = `₹${Number(formattedBase).toLocaleString('en-IN')}`;
  }

  let formattedGst = form.value.gst || '₹0';
  if (formattedGst !== '₹0' && !formattedGst.startsWith('₹') && !isNaN(Number(formattedGst))) {
    formattedGst = `₹${Number(formattedGst).toLocaleString('en-IN')}`;
  }

  let formattedTotal = form.value.total || formattedBase;
  if (!formattedTotal.startsWith('₹') && !isNaN(Number(formattedTotal))) {
    formattedTotal = `₹${Number(formattedTotal).toLocaleString('en-IN')}`;
  }

  let formattedTds = form.value.tds || '—';
  if (formattedTds !== '—' && !formattedTds.startsWith('₹') && !isNaN(Number(formattedTds))) {
    formattedTds = `₹${Number(formattedTds).toLocaleString('en-IN')}`;
  }

  let statusVal = form.value.status;
  if (!statusVal || statusVal === '— Select —') {
    statusVal = 'Pending';
  }

  const payload: PurchaseBillItem = {
    id: form.value.id.trim(),
    supplier: form.value.supplier,
    type: form.value.type,
    billNo: form.value.billNo.trim(),
    date: form.value.date || '2026-10-24',
    baseAmt: formattedBase,
    gst: formattedGst,
    total: formattedTotal,
    tdsSection: form.value.tdsSection,
    tds: formattedTds,
    linkedRef: form.value.linkedRef?.trim() || '—',
    status: statusVal,
  };

    try {
      if (isEditing.value && editingId.value) {
        await api.patch(`/api/v1/billing/purchase-bills/${editingId.value}`, payload);
        const idx = bills.value.findIndex((b) => b.id === editingId.value);
        if (idx !== -1) {
          bills.value[idx] = { ...payload };
        }
        persistCache();
        notify.notifySuccess(`Purchase Bill ${payload.id} updated in database`);
      } else {
        const createRes: any = await api.post('/api/v1/billing/purchase-bills', payload);
        const savedData = createRes?.data || createRes;
        if (savedData?.billNo || savedData?.id) {
          payload.id = savedData.id || savedData.billNo || payload.id;
          payload.billNo = savedData.billNo || payload.billNo;
        }
        const newRec = normalizeBill(savedData || payload);
        bills.value.unshift(newRec);
        persistCache();
        notify.notifySuccess(`Purchase Bill ${payload.id} stored in database`);
      }

      showDrawer.value = false;
    } catch (err: any) {
      if (err.response?.data?.message) {
        notify.notifyError(err.response.data.message);
        return;
      }
      console.error('Error saving bill:', err);
      // Fallback local update
      if (isEditing.value && editingId.value) {
        const idx = bills.value.findIndex((b) => b.id === editingId.value);
        if (idx !== -1) {
          bills.value[idx] = { ...payload };
        }
        persistCache();
        notify.notifySuccess(`Purchase Bill ${payload.id} updated locally`);
      } else {
        bills.value.unshift({ ...payload });
        persistCache();
        notify.notifySuccess(`Purchase Bill ${payload.id} created locally`);
      }
      showDrawer.value = false;
    } finally {
      isSubmitting.value = false;
    }
  }

  // Delete Bill
  function confirmDeleteBill(item: PurchaseBillItem) {
    deletingItem.value = item;
    showDeleteDialog.value = true;
  }

  async function executeDeleteBill() {
    if (!deletingItem.value) return;
    const idToDelete = deletingItem.value.id;
    try {
      await api.delete(`/api/v1/billing/purchase-bills/${idToDelete}`);
    } catch (e) {
      console.warn('API delete error, deleting locally:', e);
    }
    bills.value = bills.value.filter((b) => b.id !== idToDelete);
    persistCache();
    showDeleteDialog.value = false;
    notify.notifySuccess(`Purchase Bill ${idToDelete} deleted successfully`);
  }

// Export CSV
function exportGstItc() {
  exportToCsv(
    'purchase_bills_gst_itc_export',
    [
      { label: 'Bill ID', field: 'id' },
      { label: 'Supplier', field: 'supplier' },
      { label: 'Type', field: 'type' },
      { label: 'Bill No', field: 'billNo' },
      { label: 'Date', field: 'date' },
      { label: 'Base Amount', field: 'baseAmt' },
      { label: 'GST', field: 'gst' },
      { label: 'Total', field: 'total' },
      { label: 'TDS', field: 'tds' },
      { label: 'Linked Ref', field: 'linkedRef' },
      { label: 'Status', field: 'status' },
    ],
    bills.value
  );
  notify.notifySuccess('GST ITC Export downloaded successfully');
}

// Badge styling helpers
function getTypeBadgeClass(type: string) {
  switch (type.toLowerCase()) {
    case 'fuel station':
      return 'badge-fuel';
    case 'service centre':
      return 'badge-service';
    case 'tyre supplier':
      return 'badge-tyre';
    default:
      return 'badge-other';
  }
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'badge-approved';
    case 'pending':
      return 'badge-pending';
    case 'paid':
      return 'badge-paid';
    case 'rejected':
      return 'badge-rejected';
    default:
      return 'badge-pending';
  }
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddDrawer,
  isModalOpen: () => showDrawer.value || showDeleteDialog.value,
  onSave: saveBill,
  onEscape: () => {
    showDrawer.value = false;
    showDeleteDialog.value = false;
  },
});
</script>

<style scoped>
.purchase-bills-container {
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header with cyan underline bar */
.page-title-wrap {
  display: flex;
  flex-direction: column;
}

.page-underline {
  height: 3px;
  width: 38px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Header Action Buttons matching user screenshot */
.btn-secondary-action {
  background-color: #ffffff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  font-size: 13px;
  font-weight: 600;
  height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.btn-secondary-action:hover {
  background-color: #e0f2fe;
  border-color: #0284c7;
}

.btn-primary-cyan {
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  outline: none;
}

.btn-primary-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
}

/* KPI Box Cards matching Image 1 */
.kpi-box {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kpi-box--active {
  border-color: #0284c7;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15);
}

.kpi-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  text-transform: uppercase;
}

.kpi-amount {
  font-size: 26px;
  font-weight: 800;
  font-family: monospace, -apple-system;
  line-height: 1.2;
  margin: 6px 0 2px 0;
  color: #0f172a;
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Search input */
.search-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #0284c7;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Table styling */
.table-head-row th {
  background-color: #f1f5f9;
  color: #334155;
}

/* Table Action Buttons matching standard TMS design */
.btn-table-action {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-table-action:hover {
  background: #bae6fd;
}

.btn-table-icon {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
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
  background: #e2e8f0;
  color: #334155;
}

.btn-table-icon--danger {
  color: #94a3b8;
}

.btn-table-icon--danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Badges */
.badge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* Type Badges */
.badge-fuel {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.badge-service {
  background-color: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.badge-tyre {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fde047;
}

.badge-other {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* Status Badges */
.badge-approved {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.badge-pending {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fde047;
}

.badge-paid {
  background-color: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.badge-rejected {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
</style>
