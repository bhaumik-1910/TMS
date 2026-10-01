<template>
  <div class="purchase-bills-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="receipt_long" color="cyan" size="24px" />
          <span>Purchase Bills & Vendor Payables</span>
        </div>
        <div class="text-caption text-grey-5">
          Vendor payables: Fuel stations, workshops, tyre suppliers, and vehicle lease invoices with TDS &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for bill entry
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportBillsPdf"
        >
          <q-tooltip>Download Purchase Bills in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportBillsCsv"
        >
          <q-tooltip>Export Payables Register to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Purchase Bill"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Record New Vendor Purchase Bill (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL VENDOR PAYABLES</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">₹{{ formattedTotalPayables }}</div>
        <div class="text-xs text-slate-400 font-mono">{{ bills.length }} vendor bills recorded</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">FUEL STATION DUES</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedFuelDues }}</div>
        <div class="text-xs text-slate-400 font-mono">HPCL & BPCL credit top-ups</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">MAINTENANCE & TYRE</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedMaintenanceExpense }}</div>
        <div class="text-xs text-slate-400 font-mono">Workshop job cards & tyres</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TDS DEDUCTED (194C)</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">₹{{ formattedTdsDeducted }}</div>
        <div class="text-xs text-amber-300 font-mono">Statutory tax deduction</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Desk Keyboard Data Table -->
    <DeskDataTable
      ref="gridRef"
      title="Purchase Bills & Payables Register"
      :rows="filteredBills"
      :columns="tableColumns"
      row-key="id"
      selection-mode="none"
      :allow-create="false"
      :allow-export="false"
      :allow-refresh="true"
      :allow-delete="true"
      @create="openAddDialog"
      @edit="viewBill"
      @delete="confirmDeleteBill"
      @row-dblclick="viewBill"
      @refresh="onRefresh"
    >
      <!-- Top Filters in Table Toolbar -->
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
          popup-content-class="desk-select-menu"
          style="min-width: 140px;"
        />
      </template>

      <!-- Custom Body Cell: Bill ID -->
      <template #body-cell-id="{ value }">
        <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Supplier -->
      <template #body-cell-supplier="{ value }">
        <span class="text-white text-weight-bold">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Category Type -->
      <template #body-cell-type="{ value }">
        <span class="subtype-pill" :class="getTypePillClass(value)">
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Bill No -->
      <template #body-cell-billNo="{ value }">
        <span class="font-mono text-grey-4">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Date -->
      <template #body-cell-date="{ value }">
        <span class="font-mono text-grey-4">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Base Amt -->
      <template #body-cell-baseAmt="{ value }">
        <span class="font-mono text-grey-3">₹{{ (Number(value) || 0).toLocaleString() }}</span>
      </template>

      <!-- Custom Body Cell: GST -->
      <template #body-cell-gst="{ value }">
        <span class="font-mono text-grey-4">₹{{ (Number(value) || 0).toLocaleString() }}</span>
      </template>

      <!-- Custom Body Cell: Total -->
      <template #body-cell-total="{ value }">
        <span class="font-mono text-weight-bold text-white">₹{{ (Number(value) || 0).toLocaleString() }}</span>
      </template>

      <!-- Custom Body Cell: TDS -->
      <template #body-cell-tds="{ value }">
        <span class="font-mono text-amber-400 font-bold">
          {{ Number(value) > 0 ? '₹' + Number(value).toLocaleString() : '—' }}
        </span>
      </template>

      <!-- Custom Body Cell: Linked Ref -->
      <template #body-cell-linkedRef="{ value }">
        <span class="font-mono text-cyan-4 font-bold">{{ value || '—' }}</span>
      </template>

      <!-- Custom Body Cell: Status -->
      <template #body-cell-status="{ value }">
        <span
          class="desk-pill"
          :class="value === 'Paid' ? 'desk-pill-success' : value === 'Partially Paid' ? 'desk-pill-active' : 'desk-pill-warning'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Actions -->
      <template #body-cell-actions="{ props }">
        <div class="row items-center q-gutter-x-xs no-wrap justify-center">
          <button class="btn-table-action" @click.stop="viewBill(props.row)">View</button>
          <button
            class="btn-table-icon"
            @click.stop="printSingleBill(props.row)"
            title="Print Official Vendor Payment Voucher"
          >
            <q-icon name="print" size="14px" />
          </button>
          <button
            class="btn-table-icon"
            @click.stop="editBill(props.row)"
            title="Edit Purchase Bill"
          >
            <q-icon name="edit" size="14px" />
          </button>
          <button
            class="btn-table-icon btn-table-icon--danger"
            @click.stop="confirmDeleteBill(props.row)"
            title="Delete Bill"
          >
            <q-icon name="delete" size="14px" />
          </button>
        </div>
      </template>
    </DeskDataTable>

    <!-- Create / Edit Purchase Bill Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? `Edit Purchase Bill — ${editingItem?.id}` : 'Record New Vendor Purchase Bill'"
      width="580px"
      :confirm-label="isEditing ? 'Update Bill' : 'Save Purchase Bill'"
      cancel-label="Cancel"
      @confirm="saveBill"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveBill">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Vendor / Supplier Name" required shortcut="1">
              <DeskCombo
                v-model="form.supplier"
                :options="supplierOptions"
                placeholder="Select or enter supplier..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Supplier Category Type" required shortcut="2">
              <DeskCombo
                v-model="form.type"
                :options="['Fuel Station', 'Service Centre', 'Tyre Supplier', 'Vehicle Lease', 'Insurance / Tax']"
                placeholder="Select category..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Vendor Bill / Invoice No" required shortcut="3">
              <q-input
                v-model="form.billNo"
                dense
                outlined
                placeholder="e.g. HPCL/OCT/1234"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Base Amount (₹)" required shortcut="4">
              <DeskNumberInput
                v-model="form.baseAmt"
                placeholder="e.g. 45000"
                :step="500"
                :min="0"
                @update:model-value="calcTotal"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="GST Tax Amount (₹)" shortcut="5">
              <DeskNumberInput
                v-model="form.gst"
                placeholder="e.g. 8100"
                :step="100"
                :min="0"
                @update:model-value="calcTotal"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Gross Total Amount (₹)" required shortcut="6">
              <DeskNumberInput
                v-model="form.total"
                placeholder="e.g. 53100"
                :step="500"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TDS Deducted (Sec 194C) (₹)" shortcut="7">
              <DeskNumberInput
                v-model="form.tds"
                placeholder="e.g. 900"
                :step="100"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Linked Operation Ref" shortcut="8">
              <q-input
                v-model="form.linkedRef"
                dense
                outlined
                placeholder="e.g. FE/2400089, JC/240055"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Bill Invoice Date" required shortcut="9">
              <DeskDateInput
                v-model="form.date"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Payment Status" required shortcut="0">
              <DeskCombo
                v-model="form.status"
                :options="['Pending', 'Paid', 'Partially Paid']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- View Purchase Bill Details Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Vendor Purchase Bill — ${selectedBill?.id}`"
      width="600px"
      confirm-label="Print Payment Voucher"
      cancel-label="Close"
      @confirm="printSingleBill(selectedBill)"
      @cancel="showDetailsModal = false"
    >
      <div v-if="selectedBill" class="q-py-xs">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="text-caption text-grey-5">Bill ID & Vendor Bill No</div>
            <div class="text-h6 text-weight-bold text-white font-mono">{{ selectedBill.id }}</div>
            <div class="text-caption font-mono text-cyan-4">{{ selectedBill.billNo }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Supplier & Category</div>
            <div class="text-body1 text-white font-bold">{{ selectedBill.supplier }}</div>
            <div class="text-caption text-grey-4">{{ selectedBill.type }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Base Amount (Net of Tax)</div>
            <div class="text-body2 text-white font-mono">₹{{ selectedBill.baseAmt.toLocaleString() }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">GST Input Tax Credit</div>
            <div class="text-body2 text-cyan font-mono font-bold">₹{{ selectedBill.gst.toLocaleString() }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Gross Bill Total</div>
            <div class="text-h6 text-weight-bold text-white font-mono">₹{{ selectedBill.total.toLocaleString() }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">TDS Deducted (Sec 194C)</div>
            <div class="text-body1 text-amber-400 font-mono font-bold">₹{{ selectedBill.tds ? selectedBill.tds.toLocaleString() : '0' }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Linked TMS Reference</div>
            <div class="text-body2 font-mono text-cyan-3">{{ selectedBill.linkedRef || '—' }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Invoice Date</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedBill.date }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-5 q-mb-xs">Payment Settlement Status</div>
            <span
              class="desk-pill"
              :class="selectedBill.status === 'Paid' ? 'desk-pill-success' : selectedBill.status === 'Partially Paid' ? 'desk-pill-active' : 'desk-pill-warning'"
            >
              {{ selectedBill.status }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Dialog -->
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
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Purchase Bill
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.id }}</span>
          from <strong class="text-white">{{ deletingItem?.supplier }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will cancel the vendor payable and recalculate outstanding expense accounts.
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
  DeskNumberInput,
  DeskDateInput,
  GridColumn,
} from '../../framework';

export interface PurchaseBill {
  id: string;
  supplier: string;
  type: string;
  billNo: string;
  date: string;
  baseAmt: number;
  gst: number;
  total: number;
  tds: number;
  linkedRef: string;
  status: 'Pending' | 'Paid' | 'Partially Paid';
}

const $q = useQuasar();

const gridRef = ref<any>(null);

function onRefresh() {
  $q.notify({
    type: 'positive',
    message: 'Register Refreshed',
    caption: 'Purchase bills updated from ledger.',
    position: 'top-right',
  });
}

const tableColumns: GridColumn[] = [
  { name: 'id', label: 'BILL ID', field: 'id', align: 'left', sortable: true },
  { name: 'supplier', label: 'SUPPLIER', field: 'supplier', align: 'left', sortable: true },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left', sortable: true },
  { name: 'billNo', label: 'BILL NO', field: 'billNo', align: 'left' },
  { name: 'date', label: 'DATE', field: 'date', align: 'left', sortable: true },
  { name: 'baseAmt', label: 'BASE AMT', field: 'baseAmt', align: 'right' },
  { name: 'gst', label: 'GST', field: 'gst', align: 'right' },
  { name: 'total', label: 'TOTAL', field: 'total', align: 'right', sortable: true },
  { name: 'tds', label: 'TDS', field: 'tds', align: 'right', sortable: true },
  { name: 'linkedRef', label: 'LINKED REF', field: 'linkedRef', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'center' },
];

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<PurchaseBill | null>(null);

const showDetailsModal = ref(false);
const selectedBill = ref<PurchaseBill | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<PurchaseBill | null>(null);

const search = ref('');
const typeFilter = ref('ALL');
const statusFilter = ref('ALL');

const supplierOptions = [
  'HPCL Adajan',
  'Shree Motors',
  'Tata Rubber Ltd',
  'BPCL Naroda',
  'IndianOil Ring Rd',
  'RK Auto Garage',
  'Apollo Tyres Depot',
];

const typeFilterOptions = [
  { label: 'All Vendor Types', value: 'ALL' },
  { label: 'Fuel Station', value: 'Fuel Station' },
  { label: 'Service Centre', value: 'Service Centre' },
  { label: 'Tyre Supplier', value: 'Tyre Supplier' },
  { label: 'Vehicle Lease', value: 'Vehicle Lease' },
];

const statusFilterOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Partially Paid', value: 'Partially Paid' },
];

const defaultBills: PurchaseBill[] = [
  { id: 'PB/240055', supplier: 'HPCL Adajan', type: 'Fuel Station', billNo: 'HPCL/OCT/1234', date: '2026-10-24', baseAmt: 125000, gst: 0, total: 125000, tds: 0, linkedRef: 'FE/2400089', status: 'Pending' },
  { id: 'PB/240054', supplier: 'Shree Motors', type: 'Service Centre', billNo: 'SM/OCT/0089', date: '2026-10-20', baseAmt: 45000, gst: 8100, total: 53100, tds: 900, linkedRef: 'JC/240055', status: 'Paid' },
  { id: 'PB/240053', supplier: 'Tata Rubber Ltd', type: 'Tyre Supplier', billNo: 'TRL/OCT/0456', date: '2026-10-18', baseAmt: 28000, gst: 3360, total: 31360, tds: 560, linkedRef: 'TYR-MRF-89101', status: 'Paid' },
  { id: 'PB/240052', supplier: 'BPCL Naroda', type: 'Fuel Station', billNo: 'BPCL/OCT/0789', date: '2026-10-21', baseAmt: 33480, gst: 0, total: 33480, tds: 0, linkedRef: 'FE/2400086', status: 'Partially Paid' },
];

const bills = ref<PurchaseBill[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('tms_purchase_bills');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      bills.value = parsed.map((item: any, idx: number) => {
        const fallback = defaultBills[idx] || {};
        return {
          ...item,
          tds: item.tds !== undefined ? item.tds : (fallback.tds || 0),
          linkedRef: item.linkedRef !== undefined ? item.linkedRef : (fallback.linkedRef || ''),
        };
      });
    } catch {
      bills.value = defaultBills;
    }
  } else {
    bills.value = defaultBills;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_purchase_bills', JSON.stringify(bills.value));
}

const form = ref<Omit<PurchaseBill, 'id'>>({
  supplier: 'HPCL Adajan',
  type: 'Fuel Station',
  billNo: 'HPCL/OCT/1235',
  date: new Date().toISOString().slice(0, 10),
  baseAmt: 50000,
  gst: 0,
  total: 50000,
  tds: 0,
  linkedRef: 'FE/2400090',
  status: 'Pending',
});

function calcTotal() {
  form.value.total = (Number(form.value.baseAmt) || 0) + (Number(form.value.gst) || 0);
}

const filteredBills = computed(() => {
  return bills.value.filter((b) => {
    const q = search.value.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.supplier.toLowerCase().includes(q) ||
      b.billNo.toLowerCase().includes(q) ||
      b.linkedRef.toLowerCase().includes(q);
    const matchType = typeFilter.value === 'ALL' || b.type === typeFilter.value;
    const matchStatus = statusFilter.value === 'ALL' || b.status === statusFilter.value;
    return matchSearch && matchType && matchStatus;
  });
});

const formattedTotalPayables = computed(() => {
  const sum = bills.value.reduce((acc, curr) => acc + (curr.total || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedFuelDues = computed(() => {
  const sum = bills.value
    .filter((b) => b.type === 'Fuel Station')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedMaintenanceExpense = computed(() => {
  const sum = bills.value
    .filter((b) => b.type === 'Service Centre' || b.type === 'Tyre Supplier')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString();
});

const formattedTdsDeducted = computed(() => {
  const sum = bills.value.reduce((acc, curr) => acc + (curr.tds || 0), 0);
  return sum.toLocaleString();
});

function getTypePillClass(type: string) {
  switch (type) {
    case 'Fuel Station':
      return 'sub-fuel-station';
    case 'Service Centre':
      return 'sub-service-centre';
    case 'Tyre Supplier':
      return 'sub-driver';
    default:
      return 'sub-customer';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  form.value = {
    supplier: 'HPCL Adajan',
    type: 'Fuel Station',
    billNo: `INV/OCT/${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().slice(0, 10),
    baseAmt: 45000,
    gst: 0,
    total: 45000,
    tds: 0,
    linkedRef: '',
    status: 'Pending',
  };
  showDialog.value = true;
}

function editBill(item: PurchaseBill) {
  isEditing.value = true;
  editingItem.value = item;
  form.value = {
    supplier: item.supplier,
    type: item.type,
    billNo: item.billNo,
    date: item.date,
    baseAmt: item.baseAmt,
    gst: item.gst,
    total: item.total,
    tds: item.tds,
    linkedRef: item.linkedRef,
    status: item.status,
  };
  showDialog.value = true;
}

function saveBill() {
  if (!form.value.supplier || !form.value.billNo || !form.value.baseAmt) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter supplier name, bill number, and base amount.',
      position: 'top-right',
    });
    return;
  }

  calcTotal();

  if (isEditing.value && editingItem.value) {
    const idx = bills.value.findIndex((b) => b.id === editingItem.value!.id);
    if (idx !== -1) {
      bills.value[idx] = {
        ...bills.value[idx],
        ...form.value,
      };
      persist();
      $q.notify({
        type: 'positive',
        message: 'Bill Updated',
        caption: `Purchase bill ${editingItem.value.id} updated.`,
        position: 'top-right',
      });
    }
  } else {
    const seq = 240056 + bills.value.length;
    const newBill: PurchaseBill = {
      id: `PB/${seq}`,
      ...form.value,
    };
    bills.value.unshift(newBill);
    persist();
    $q.notify({
      type: 'positive',
      message: 'Purchase Bill Recorded',
      caption: `Purchase bill ${newBill.id} saved for ${newBill.supplier}.`,
      position: 'top-right',
    });
  }

  showDialog.value = false;
}

function viewBill(item: PurchaseBill) {
  selectedBill.value = item;
  showDetailsModal.value = true;
}

function confirmDeleteBill(item: PurchaseBill) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteBill() {
  if (!deletingItem.value) return;
  bills.value = bills.value.filter((b) => b.id !== deletingItem.value!.id);
  persist();
  $q.notify({
    type: 'positive',
    message: 'Bill Deleted',
    caption: `Purchase bill ${deletingItem.value.id} deleted.`,
    position: 'top-right',
  });
  showDeleteDialog.value = false;
}

/**
 * Print official Vendor Purchase Bill Payment Voucher
 */
function printSingleBill(bill: PurchaseBill | null) {
  if (!bill) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    $q.notify({
      type: 'warning',
      message: 'Popup Blocked',
      caption: 'Please allow popups in your browser to print the payment voucher.',
      position: 'top-right',
    });
    return;
  }

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const netPayable = (bill.total || 0) - (bill.tds || 0);

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Vendor Payment Voucher ${bill.id} - Ankpal Gati Shakti TMS</title>
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
      font-size: 14px;
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
    .table-voucher {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .table-voucher th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
    }
    .table-voucher td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      font-size: 13px;
    }
    .net-box {
      border: 2px solid #0891b2;
      background: #ecfeff;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .net-title {
      font-size: 14px;
      font-weight: 700;
      color: #0e7490;
    }
    .net-val {
      font-size: 22px;
      font-weight: 800;
      font-family: monospace;
      color: #0891b2;
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
      height: 48px;
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
      <div class="company-sub">Accounts Payable &bull; Vendor Purchase Bill Disbursement Voucher</div>
    </div>
    <div class="jc-tag">
      <div class="jc-title">PAYMENT VOUCHER</div>
      <div class="jc-number">${bill.id}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Printed: ${currentDate}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="info-card">
      <h4>Vendor & Invoice Identification</h4>
      <div class="info-row">
        <span class="info-label">Vendor / Supplier:</span>
        <span class="info-value" style="font-size: 14px; color: #0891b2;">${bill.supplier}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Category Head:</span>
        <span class="info-value">${bill.type}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Vendor Bill No:</span>
        <span class="info-value" style="font-family: monospace;">${bill.billNo}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Invoice Date:</span>
        <span class="info-value">${bill.date}</span>
      </div>
    </div>

    <div class="info-card">
      <h4>TMS Operational Linkage</h4>
      <div class="info-row">
        <span class="info-label">Linked Operation:</span>
        <span class="info-value" style="font-family: monospace; color: #0891b2;">${bill.linkedRef || 'General Account'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Settlement Status:</span>
        <span class="info-value" style="color: #059669;">${bill.status}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Mode:</span>
        <span class="info-value">Direct Bank RTGS / NEFT</span>
      </div>
      <div class="info-row">
        <span class="info-label">TDS Section:</span>
        <span class="info-value">194C (Carriage / Workshop)</span>
      </div>
    </div>
  </div>

  <table class="table-voucher">
    <thead>
      <tr>
        <th>Accounting Head / Particulars</th>
        <th>Reference ID</th>
        <th style="text-align: right;">Base Amount</th>
        <th style="text-align: right;">GST Input</th>
        <th style="text-align: right;">Gross Bill Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${bill.type} Expenses</strong> — ${bill.supplier}</td>
        <td style="font-family: monospace;">${bill.linkedRef || bill.billNo}</td>
        <td style="text-align: right; font-family: monospace;">₹${bill.baseAmt.toLocaleString()}</td>
        <td style="text-align: right; font-family: monospace;">₹${bill.gst.toLocaleString()}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700;">₹${bill.total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="net-box">
    <div>
      <div class="net-title">NET PAYABLE AMOUNT (AFTER TDS DEDUCTION)</div>
      <div style="font-size: 11px; color: #155e75; margin-top: 2px;">Gross Total ₹${bill.total.toLocaleString()} &minus; TDS (Sec 194C) ₹${(bill.tds || 0).toLocaleString()}</div>
    </div>
    <div class="net-val">₹${netPayable.toLocaleString()}</div>
  </div>

  <div class="sign-grid">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Prepared By (Accounts)</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Verified By (Finance Mgr)</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Authorized Signatory</div>
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

function exportBillsCsv() {
  exportToCsv(
    'purchase_bills_register',
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
    filteredBills.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${filteredBills.value.length} purchase bills exported to CSV.`,
    position: 'top-right',
  });
}

function exportBillsPdf() {
  exportToPdf({
    title: 'Purchase Bills & Vendor Payables Register',
    subtitle: `Total Payables: ${filteredBills.value.length} records`,
    columns: [
      { label: 'Bill ID', field: 'id' },
      { label: 'Supplier', field: 'supplier' },
      { label: 'Type', field: 'type' },
      { label: 'Bill No', field: 'billNo' },
      { label: 'Date', field: 'date' },
      { label: 'Total', field: 'total', align: 'right' },
      { label: 'TDS', field: 'tds', align: 'right' },
      { label: 'Linked Ref', field: 'linkedRef' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredBills.value,
  });
}
</script>

<style scoped>
.purchase-bills-page {
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
