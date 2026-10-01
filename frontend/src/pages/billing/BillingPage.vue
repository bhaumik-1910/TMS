<template>
  <div class="billing-page q-pa-md">
    <!-- Header with Action Controls (Single-Row) -->
    <div class="row items-center justify-between no-wrap q-mb-md gap-3">
      <div class="min-w-0">
        <div class="text-h6 text-weight-bold text-white row items-center no-wrap q-gutter-x-sm">
          <q-icon name="account_balance_wallet" color="cyan" size="24px" />
          <span class="truncate">Freight Billing & E-Invoicing</span>
        </div>
        <div class="text-caption text-grey-5 truncate">
          GST-compliant billing, IRN generation, and receivables tracking &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for new invoice
        </div>
      </div>

      <div class="row items-center no-wrap q-gutter-x-sm flex-shrink-0">
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
          <q-tooltip>Refresh Invoices & Ledger</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportInvoicesPdf"
        >
          <q-tooltip>Download Invoices in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="GST CSV Export"
          class="desk-btn-secondary"
          @click="exportGst"
        >
          <q-tooltip>Export GST Returns CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="New Invoice (Ctrl+N)"
          class="desk-btn-primary"
          @click="openAddModal"
        >
          <q-tooltip>Generate Tax Invoice (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Main Workspace with Inner Loading Overlay -->
    <div class="relative min-h-[400px]">

    <!-- 4 KPI Cards -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="kpi-label">THIS MONTH REVENUE</div>
          <div class="kpi-val text-cyan">₹18.4L</div>
          <div class="kpi-sub">Billed Oct 2026</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="kpi-label">OUTSTANDING</div>
          <div class="kpi-val text-white">₹1.6L</div>
          <div class="kpi-sub">Pending invoices</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="kpi-label">OVERDUE</div>
          <div class="kpi-val text-amber">{{ overdueCount }}</div>
          <div class="kpi-sub">Past due date</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="kpi-label">E-INVOICE (IRN)</div>
          <div class="kpi-val text-white">{{ irnCount }}</div>
          <div class="kpi-sub">Generated this month</div>
        </div>
      </div>
    </div>

    <!-- Desk Keyboard Data Table -->
    <DeskDataTable
      title="Freight Tax Invoices Register"
      :rows="filteredInvoices"
      :columns="tableColumns"
      row-key="id"
      selection-mode="none"
      :allow-create="false"
      :allow-export="false"
      :allow-refresh="true"
      :allow-delete="true"
      @create="openAddModal"
      @edit="downloadInvoice"
      @delete="confirmDeleteInvoice"
      @row-dblclick="downloadInvoice"
      @refresh="onRefresh"
    >
      <!-- Custom Filter in Table Toolbar -->
      <template #top-filters>
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
      </template>

      <!-- Custom Cell: Invoice No -->
      <template #body-cell-invoiceNo="{ value }">
        <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
      </template>

      <!-- Custom Cell: LR Ref -->
      <template #body-cell-lrRef="{ value }">
        <span class="font-mono text-grey-4">{{ value }}</span>
      </template>

      <!-- Custom Cell: Customer -->
      <template #body-cell-customer="{ value }">
        <span class="text-white text-weight-medium">{{ value }}</span>
      </template>

      <!-- Custom Cell: Base Amount -->
      <template #body-cell-baseAmt="{ value }">
        <span class="font-mono">{{ value }}</span>
      </template>

      <!-- Custom Cell: Total -->
      <template #body-cell-total="{ value }">
        <span class="font-mono text-weight-bold text-white">{{ value }}</span>
      </template>

      <!-- Custom Cell: Status -->
      <template #body-cell-status="{ value }">
        <span
          class="desk-pill"
          :class="value === 'Paid' ? 'desk-pill-success' : value === 'Pending' ? 'desk-pill-pending' : 'desk-pill-danger'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Cell: Actions matching Reference Image 1 & 2 -->
      <template #body-cell-actions="{ props }">
        <div class="row items-center q-gutter-x-xs no-wrap justify-center">
          <button class="btn-table-action" @click.stop="editInvoice(props.row)">
            Edit
          </button>
          <button class="btn-table-action" @click.stop="downloadInvoice(props.row)">
            Invoice
          </button>
          <button
            class="btn-table-icon"
            @click.stop="downloadInvoice(props.row)"
            title="Print / View Tax Invoice"
          >
            <q-icon name="print" size="14px" />
          </button>
          <button
            class="btn-table-icon btn-table-icon--danger"
            @click.stop="confirmDeleteInvoice(props.row)"
            title="Delete Invoice"
          >
            <q-icon name="delete" size="14px" />
          </button>
        </div>
      </template>
    </DeskDataTable>

      <!-- Inner Loading Overlay on Ledger Refresh -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 12px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Syncing Freight Invoices & Tax IRN Ledger...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Querying GST portal, receivables status and audit tolerances
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Create / Edit Invoice Desk Dialog matching Image 1 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Freight Tax Invoice — ${editingInv?.invoiceNo}` : 'Generate Freight Tax Invoice'"
      width="600px"
      :confirm-label="isEditing ? 'Update Invoice' : 'Generate Invoice'"
      cancel-label="Cancel"
      @confirm="saveInvoice"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveInvoice">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Lorry Receipt Ref" required shortcut="1">
              <q-input
                v-model="newInv.lrRef"
                dense
                outlined
                placeholder="e.g. LR/240049"
                autofocus
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Customer (Billed Party)" required shortcut="2">
              <DeskCombo
                v-model="newInv.customer"
                :options="customerOptions"
                placeholder="Select billed party..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Base Freight Amount (₹)" required shortcut="3">
              <DeskNumberInput
                v-model="newInv.baseAmt"
                placeholder="e.g. 50000"
                :step="1000"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="GST Tax Treatment" required shortcut="4">
              <DeskCombo
                v-model="newInv.gstType"
                :options="['RCM 5%', 'Forward 12%']"
              />
            </DeskField>
          </div>

          <div class="col-12">
            <DeskField label="Payment Due Date" required shortcut="5">
              <DeskDateInput
                v-model="newInv.dueDate"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog (No browser alert) -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Invoice"
      icon="warning"
      width="480px"
      confirm-label="Delete Invoice"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteInvoice"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete invoice
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.invoiceNo }}</span>
          for customer <strong class="text-white">{{ deletingItem?.customer }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will cancel the invoice and recalculate pending receivables.
        </div>
      </div>
    </DeskDialog>

    <!-- Real GST Tax Invoice Printable / PDF Preview Dialog -->
    <AppInvoicePreviewDialog
      v-model="showInvoiceDialog"
      :invoice="selectedInvoice"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import AppInvoicePreviewDialog from '../../components/AppInvoicePreviewDialog.vue';
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

const $q = useQuasar();
const isRefreshing = ref(false);
const showInvoiceDialog = ref(false);
const showAddModal = ref(false);
const showDeleteDialog = ref(false);
const selectedInvoice = ref<any>(null);
const deletingItem = ref<InvoiceItem | null>(null);

const searchQuery = ref('');
const statusFilter = ref('ALL');

async function onRefresh() {
  isRefreshing.value = true;
  await new Promise((r) => setTimeout(r, 650));
  isRefreshing.value = false;
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'Billing Register Refreshed',
    caption: 'Live invoices, tax IRN clearance, and receivables updated.',
    position: 'top-right',
    timeout: 1600,
  });
}

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  lrRef: string;
  customer: string;
  baseAmt: string;
  gst: string;
  total: string;
  gstType: string;
  irn: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Overdue', value: 'Overdue' },
];

const customerOptions = [
  'Reliance Retail DC',
  'Adani Logistics',
  'HPCL',
  'Pidilite Industries',
  'Marico',
  'Tata Steel Ltd',
];

const tableColumns: GridColumn[] = [
  { name: 'invoiceNo', label: 'INVOICE NO', field: 'invoiceNo', align: 'left', sortable: true },
  { name: 'lrRef', label: 'LR REF', field: 'lrRef', align: 'left' },
  { name: 'customer', label: 'CUSTOMER', field: 'customer', align: 'left', sortable: true },
  { name: 'baseAmt', label: 'BASE AMT', field: 'baseAmt', align: 'right' },
  { name: 'gst', label: 'GST', field: 'gst', align: 'right' },
  { name: 'total', label: 'TOTAL', field: 'total', align: 'right', sortable: true },
  { name: 'dueDate', label: 'DUE DATE', field: 'dueDate', align: 'center' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' },
  { name: 'actions', label: 'ACTION', field: 'actions', align: 'center' },
];

const invoices = ref<InvoiceItem[]>([
  {
    id: '1',
    invoiceNo: 'INV/24/1089',
    lrRef: 'LR/240044',
    customer: 'HPCL',
    baseAmt: '₹48,500',
    gst: '₹0 (RCM)',
    total: '₹48,500',
    gstType: 'RCM 5%',
    irn: 'IRN-2024-ABC7761',
    dueDate: '2026-11-05',
    status: 'Paid',
  },
  {
    id: '2',
    invoiceNo: 'INV/24/1088',
    lrRef: 'LR/240042',
    customer: 'Marico',
    baseAmt: '₹62,000',
    gst: '₹7,440',
    total: '₹69,440',
    gstType: 'Forward 12%',
    irn: '—',
    dueDate: '2026-11-10',
    status: 'Pending',
  },
  {
    id: '3',
    invoiceNo: 'INV/24/1087',
    lrRef: 'LR/240040',
    customer: 'Pidilite Industries',
    baseAmt: '₹35,000',
    gst: '₹4,200',
    total: '₹39,200',
    gstType: 'Forward 12%',
    irn: '—',
    dueDate: '2026-10-20',
    status: 'Overdue',
  },
  {
    id: '4',
    invoiceNo: 'INV/24/1086',
    lrRef: 'LR/240038',
    customer: 'Reliance Retail DC',
    baseAmt: '₹1,20,000',
    gst: '₹0 (RCM)',
    total: '₹1,20,000',
    gstType: 'RCM 5%',
    irn: 'IRN-2024-DEF9943',
    dueDate: '2026-10-23',
    status: 'Overdue',
  },
]);

const newInv = ref({
  lrRef: '',
  customer: 'Reliance Retail DC',
  baseAmt: 50000,
  gstType: 'RCM 5%',
  dueDate: '2026-11-15',
});

const overdueCount = computed(() => invoices.value.filter((i) => i.status === 'Overdue').length);
const irnCount = computed(() => invoices.value.filter((i) => i.irn !== '—').length);

const filteredInvoices = computed(() => {
  return invoices.value.filter((i) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch =
      !q ||
      i.invoiceNo.toLowerCase().includes(q) ||
      i.customer.toLowerCase().includes(q) ||
      i.lrRef.toLowerCase().includes(q);
    const matchStatus = statusFilter.value === 'ALL' || i.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

const isEditing = ref(false);
const editingInv = ref<InvoiceItem | null>(null);

function openAddModal() {
  isEditing.value = false;
  editingInv.value = null;
  newInv.value = {
    lrRef: '',
    customer: 'Reliance Retail DC',
    baseAmt: 45000,
    gstType: 'RCM 5%',
    dueDate: '2026-11-20',
  };
  showAddModal.value = true;
}

function editInvoice(inv: InvoiceItem) {
  isEditing.value = true;
  editingInv.value = inv;
  const numBase = parseInt(inv.baseAmt.replace(/[^0-9]/g, '')) || 45000;
  newInv.value = {
    lrRef: inv.lrRef,
    customer: inv.customer,
    baseAmt: numBase,
    gstType: inv.gstType,
    dueDate: inv.dueDate,
  };
  showAddModal.value = true;
}

function confirmDeleteInvoice(inv: InvoiceItem) {
  deletingItem.value = inv;
  showDeleteDialog.value = true;
}

function executeDeleteInvoice() {
  if (!deletingItem.value) return;
  const targetNo = deletingItem.value.invoiceNo;
  invoices.value = invoices.value.filter((i) => i.id !== deletingItem.value?.id);
  showDeleteDialog.value = false;
  deletingItem.value = null;

  $q.notify({
    type: 'positive',
    message: 'Invoice Removed',
    caption: `${targetNo} was deleted.`,
    position: 'top-right',
  });
}

function exportGst() {
  exportToCsv(
    'gstr1_b2b_freight_invoices',
    [
      { label: 'Invoice No', field: 'invoiceNo' },
      { label: 'Customer', field: 'customer' },
      { label: 'LR Reference', field: 'lrRef' },
      { label: 'Base Amount', field: 'baseAmt' },
      { label: 'GST Amount', field: 'gst' },
      { label: 'Total Amount', field: 'total' },
      { label: 'GST Type', field: 'gstType' },
      { label: 'IRN Number', field: 'irn' },
      { label: 'Due Date', field: 'dueDate' },
      { label: 'Status', field: 'status' },
    ],
    invoices.value,
  );
  $q.notify({
    type: 'positive',
    message: 'GSTR-1 Freight Schedule Downloaded',
    caption: `${invoices.value.length} B2B invoices exported to CSV with IRN payload.`,
    position: 'top-right',
  });
}

function exportInvoicesPdf() {
  exportToPdf({
    title: 'Freight Invoices Register',
    subtitle: `Total Billed Records: ${filteredInvoices.value.length}`,
    columns: [
      { label: 'Invoice #', field: 'invoiceNo' },
      { label: 'Customer', field: 'customer' },
      { label: 'LR Ref', field: 'lrRef' },
      { label: 'Base Amount', field: 'baseAmt', align: 'right' },
      { label: 'Total', field: 'total', align: 'right' },
      { label: 'Due Date', field: 'dueDate', align: 'center' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredInvoices.value,
  });
}

function downloadInvoice(inv: InvoiceItem) {
  const numericTotal = parseFloat(inv.total.replace(/[^0-9.]/g, '')) || 48500;
  const numericSubtotal = parseFloat(inv.baseAmt.replace(/[^0-9.]/g, '')) || 48500;
  const isFwd = inv.gstType.includes('12%');
  const tax = isFwd ? numericSubtotal * 0.12 : 0;

  selectedInvoice.value = {
    invoiceNumber: inv.invoiceNo,
    customerName: inv.customer,
    status: inv.status.toUpperCase(),
    issueDate: new Date().toLocaleDateString('en-GB'),
    dueDate: inv.dueDate,
    subtotal: numericSubtotal,
    tax: tax,
    total: numericTotal,
    lrNumber: inv.lrRef,
    irn: inv.irn,
    gstType: inv.gstType,
    items: [
      {
        description: `Linehaul Freight Services [${inv.lrRef}]`,
        hsnSac: '996511',
        quantity: 1,
        unitPrice: numericSubtotal,
        total: numericSubtotal,
      },
    ],
  };
  showInvoiceDialog.value = true;
}

function saveInvoice() {
  if (!newInv.value.lrRef || !newInv.value.customer) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter LR Reference and Customer.',
      position: 'top-right',
    });
    return;
  }

  if (isEditing.value && editingInv.value) {
    const idx = invoices.value.findIndex((i) => i.id === editingInv.value!.id);
    if (idx !== -1) {
      const isFwd = newInv.value.gstType.includes('12%');
      const gstVal = isFwd ? newInv.value.baseAmt * 0.12 : 0;
      const totalVal = newInv.value.baseAmt + gstVal;

      invoices.value[idx] = {
        ...invoices.value[idx],
        lrRef: newInv.value.lrRef,
        customer: newInv.value.customer,
        baseAmt: `₹${newInv.value.baseAmt.toLocaleString('en-IN')}`,
        gst: isFwd ? `₹${gstVal.toLocaleString('en-IN')}` : '₹0 (RCM)',
        total: `₹${totalVal.toLocaleString('en-IN')}`,
        gstType: newInv.value.gstType,
        dueDate: newInv.value.dueDate || '2026-11-20',
      };

      $q.notify({
        type: 'positive',
        message: 'Invoice Updated',
        caption: `Tax invoice ${editingInv.value.invoiceNo} has been updated.`,
        position: 'top-right',
      });
      showAddModal.value = false;
      return;
    }
  }

  const num = 1090 + invoices.value.length;
  const isFwd = newInv.value.gstType.includes('12%');
  const gstVal = isFwd ? newInv.value.baseAmt * 0.12 : 0;
  const totalVal = newInv.value.baseAmt + gstVal;

  invoices.value.unshift({
    id: String(Date.now()),
    invoiceNo: `INV/24/${num}`,
    lrRef: newInv.value.lrRef,
    customer: newInv.value.customer,
    baseAmt: `₹${newInv.value.baseAmt.toLocaleString('en-IN')}`,
    gst: isFwd ? `₹${gstVal.toLocaleString('en-IN')}` : '₹0 (RCM)',
    total: `₹${totalVal.toLocaleString('en-IN')}`,
    gstType: newInv.value.gstType,
    irn: `IRN-2024-NEW${num}`,
    dueDate: newInv.value.dueDate || '2026-11-20',
    status: 'Pending',
  });

  $q.notify({
    type: 'positive',
    message: 'Invoice Generated',
    caption: `Tax invoice INV/24/${num} has been created.`,
    position: 'top-right',
  });

  showAddModal.value = false;
}
</script>

<style scoped>
.billing-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.kpi-card {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1rem;
}

.kpi-label {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.kpi-val {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--desk-font-mono, monospace);
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 0.25rem;
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

</style>
