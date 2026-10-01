<template>
  <div class="booking-lr-page q-pa-md">
    <!-- Header with Title & Summary Metrics -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="description" color="cyan" size="24px" />
          <span>Lorry Receipts & Booking (LR)</span>
        </div>
        <div class="text-caption text-grey-5">
          Keyboard-driven high-density booking console &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for new LR &bull; <kbd class="desk-kbd">Alt+F</kbd> to filter
        </div>
      </div>

      <!-- Quick Export & Print Actions -->
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportOrdersPdf"
        >
          <q-tooltip>Download / Print LRs in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportOrdersCsv"
        >
          <q-tooltip>Export LRs to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="New LR (Ctrl+N)"
          class="desk-btn-primary"
          @click="openCreateModal"
        >
          <q-tooltip>Generate New Lorry Receipt (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Desk Keyboard Data Table -->
    <DeskDataTable
      ref="gridRef"
      title="Booking / LR Register"
      :rows="filteredLrs"
      :columns="tableColumns"
      row-key="id"
      selection-mode="none"
      :allow-create="false"
      :allow-export="false"
      :allow-refresh="true"
      :allow-delete="true"
      @create="openCreateModal"
      @edit="editLr"
      @delete="confirmDeleteLr"
      @row-dblclick="editLr"
      @refresh="onRefresh"
    >
      <!-- Top Filters in Table Toolbar -->
      <template #top-filters>
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          style="min-width: 140px;"
        />
        <q-select
          v-model="branchFilter"
          :options="branchOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          style="min-width: 130px;"
        />
      </template>

      <!-- Custom Body Cell: LR No with Cyan Code formatting -->
      <template #body-cell-lrNo="{ value }">
        <span class="text-white text-weight-bold font-mono">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Consignor -->
      <template #body-cell-consignor="{ value }">
        <span class="text-white text-weight-medium">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Route -->
      <template #body-cell-route="{ value }">
        <span class="text-weight-medium text-grey-3">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Rate -->
      <template #body-cell-rate="{ value }">
        <span class="text-white text-weight-bold">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: E-Way Bill -->
      <template #body-cell-ewayBill="{ value }">
        <span class="font-mono text-grey-4">{{ value }}</span>
      </template>

      <!-- Custom Body Cell: Status Badge -->
      <template #body-cell-status="{ value }">
        <span class="desk-pill" :class="getStatusBadgeClass(value)">
          {{ value }}
        </span>
      </template>

      <!-- Custom Body Cell: Actions matching Image 2 -->
      <template #body-cell-actions="{ props }">
        <div class="row items-center q-gutter-x-xs no-wrap">
          <button class="btn-table-action" @click.stop="editLr(props.row)">Edit</button>
          <button class="btn-table-icon" @click.stop="printSingleLr(props.row)" title="Print LR">
            <q-icon name="print" size="14px" />
          </button>
          <button class="btn-table-icon btn-table-icon--danger" @click.stop="confirmDeleteLr(props.row)" title="Delete LR">
            <q-icon name="delete" size="14px" />
          </button>
        </div>
      </template>
    </DeskDataTable>

    <!-- Create / Edit LR Desk Dialog matching Image 1 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Lorry Receipt — ${currentLrNo}` : 'Generate New Lorry Receipt (LR)'"
      width="580px"
      :loading="isSubmitting"
      :confirm-label="isEditing ? 'Update LR' : 'Generate LR'"
      cancel-label="Cancel"
      @confirm="saveLr"
      @cancel="showAddModal = false"
    >
      <DeskForm ref="formRef" @submit="saveLr">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <DeskField label="Consignor (Customer)" required shortcut="1">
              <DeskCombo
                v-model="newLr.consignor"
                :options="customerOptions"
                placeholder="Select or enter customer..."
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="Origin Hub / City" required shortcut="2">
              <q-input
                v-model="newLr.origin"
                dense
                outlined
                placeholder="e.g. AHD (Ahmedabad)"
                autofocus
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="Destination Hub / City" required shortcut="3">
              <q-input
                v-model="newLr.destination"
                dense
                outlined
                placeholder="e.g. MUM (Mumbai)"
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="Cargo Description" required shortcut="4">
              <q-input
                v-model="newLr.product"
                dense
                outlined
                placeholder="e.g. FMCG Goods, Steel Coils"
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="Charged Weight (MT)" required shortcut="5">
              <q-input
                v-model="newLr.chargedWt"
                dense
                outlined
                placeholder="e.g. 15 MT"
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="Agreed Freight Rate" required shortcut="6">
              <q-input
                v-model="newLr.rate"
                dense
                outlined
                placeholder="e.g. ₹2,200"
              />
            </DeskField>
          </div>

          <div class="col-6">
            <DeskField label="GST E-Way Bill Number" shortcut="7">
              <q-input
                v-model="newLr.ewayBill"
                dense
                outlined
                placeholder="12-digit EWB (e.g. 240600128841)"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog (No raw browser alert/confirm!) -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Lorry Receipt"
      icon="warning"
      width="480px"
      confirm-label="Delete Record"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteLr"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Lorry Receipt
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.lrNo }}</span>
          for consignor <strong class="text-white">{{ deletingItem?.consignor }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the booking and unassign any associated shipment plans.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import {
  DeskDataTable,
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  GridColumn,
} from '../../framework';

const $q = useQuasar();
const gridRef = ref<any>(null);
const formRef = ref<any>(null);

const isEditing = ref(false);
const editingId = ref<string | null>(null);
const currentLrNo = ref('');
const isSubmitting = ref(false);

const showAddModal = ref(false);
const showDeleteDialog = ref(false);
const deletingItem = ref<LrItem | null>(null);

const searchQuery = ref('');
const statusFilter = ref('ALL');
const branchFilter = ref('ALL');

export interface LrItem {
  id: string;
  lrNo: string;
  consignor: string;
  route: string;
  product: string;
  chargedWt: string;
  rate: string;
  ewayBill: string;
  status: 'InTransit' | 'Confirmed' | 'Draft' | 'PODVerified' | 'Billed';
}

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'InTransit', value: 'InTransit' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Draft', value: 'Draft' },
  { label: 'PODVerified', value: 'PODVerified' },
  { label: 'Billed', value: 'Billed' },
];

const branchOptions = [
  { label: 'All Branches', value: 'ALL' },
  { label: 'Ahmedabad (AHD)', value: 'Ahmedabad' },
  { label: 'Surat (SRT)', value: 'Surat' },
  { label: 'Mumbai (MUM)', value: 'Mumbai' },
];

const customerOptions = [
  'Reliance Retail DC',
  'Adani Logistics',
  'Tata Steel Ltd',
  'HPCL',
  'Pidilite Industries',
  'Ultratech Cement',
];

const tableColumns: GridColumn[] = [
  { name: 'lrNo', label: 'LR NO', field: 'lrNo', align: 'left', sortable: true },
  { name: 'consignor', label: 'CONSIGNOR / CUSTOMER', field: 'consignor', align: 'left', sortable: true },
  { name: 'route', label: 'ORIGIN → DEST', field: 'route', align: 'left', sortable: true },
  { name: 'product', label: 'PRODUCT', field: 'product', align: 'left' },
  { name: 'chargedWt', label: 'CHARGED WT', field: 'chargedWt', align: 'right' },
  { name: 'rate', label: 'AGREED RATE', field: 'rate', align: 'right' },
  { name: 'ewayBill', label: 'E-WAY BILL', field: 'ewayBill', align: 'center' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' },
  { name: 'actions', label: 'ACTION', field: 'actions', align: 'center' },
];

const lrs = ref<LrItem[]>([
  {
    id: '1',
    lrNo: 'LR/240047',
    consignor: 'Reliance Retail DC',
    route: 'AHD → MUM',
    product: 'FMCG Mixed',
    chargedWt: '15 MT',
    rate: '₹2,200',
    ewayBill: '240600128841',
    status: 'InTransit',
  },
  {
    id: '2',
    lrNo: 'LR/240046',
    consignor: 'Adani Logistics',
    route: 'AHD → VAPI',
    product: 'Industrial Goods',
    chargedWt: '9 MT',
    rate: '₹18,000',
    ewayBill: '240600982144',
    status: 'Confirmed',
  },
  {
    id: '3',
    lrNo: 'LR/240045',
    consignor: 'Tata Steel Ltd',
    route: 'SRT → PUN',
    product: 'Steel Coils',
    chargedWt: '18 MT',
    rate: '₹1,800',
    ewayBill: '240600551920',
    status: 'Draft',
  },
  {
    id: '4',
    lrNo: 'LR/240044',
    consignor: 'HPCL',
    route: 'MUM → SUB',
    product: 'Cement',
    chargedWt: '25 MT',
    rate: '₹48,000',
    ewayBill: '240600119283',
    status: 'PODVerified',
  },
  {
    id: '5',
    lrNo: 'LR/240043',
    consignor: 'Pidilite Industries',
    route: 'AHD → DEL',
    product: 'Chemical Drums',
    chargedWt: '8 MT',
    rate: '₹2,800',
    ewayBill: '240600662910',
    status: 'Billed',
  },
]);

const newLr = ref({
  consignor: 'Reliance Retail DC',
  origin: 'AHD',
  destination: 'MUM',
  product: '',
  chargedWt: '15 MT',
  rate: '₹2,200',
  ewayBill: '',
});

const filteredLrs = computed(() => {
  return lrs.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.lrNo.toLowerCase().includes(q) ||
      item.consignor.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q);
    const matchStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'InTransit':
      return 'desk-pill-active';
    case 'Confirmed':
      return 'desk-pill-pending';
    case 'Draft':
      return 'desk-pill-draft';
    case 'PODVerified':
      return 'desk-pill-success';
    case 'Billed':
      return 'desk-pill-success';
    default:
      return 'desk-pill-draft';
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  currentLrNo.value = '';
  newLr.value = {
    consignor: 'Reliance Retail DC',
    origin: 'AHD',
    destination: 'MUM',
    product: '',
    chargedWt: '10 MT',
    rate: '₹2,000',
    ewayBill: '',
  };
  showAddModal.value = true;
}

function editLr(lr: LrItem) {
  isEditing.value = true;
  editingId.value = lr.id;
  currentLrNo.value = lr.lrNo;
  const parts = lr.route.split(' → ');
  newLr.value = {
    consignor: lr.consignor,
    origin: parts[0] || 'AHD',
    destination: parts[1] || 'MUM',
    product: lr.product,
    chargedWt: lr.chargedWt,
    rate: lr.rate,
    ewayBill: lr.ewayBill,
  };
  showAddModal.value = true;
}

function confirmDeleteLr(lr: LrItem) {
  deletingItem.value = lr;
  showDeleteDialog.value = true;
}

function executeDeleteLr() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  const targetLrNo = deletingItem.value.lrNo;

  lrs.value = lrs.value.filter((item) => item.id !== targetId);
  showDeleteDialog.value = false;
  deletingItem.value = null;

  $q.notify({
    type: 'positive',
    message: 'Lorry Receipt Deleted',
    caption: `${targetLrNo} was successfully removed.`,
    position: 'top-right',
  });
}

function saveLr() {
  if (!newLr.value.consignor || !newLr.value.origin || !newLr.value.destination) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter consignor, origin, and destination.',
      position: 'top-right',
    });
    return;
  }

  isSubmitting.value = true;
  setTimeout(() => {
    if (isEditing.value && editingId.value) {
      const idx = lrs.value.findIndex((item) => item.id === editingId.value);
      if (idx !== -1) {
        lrs.value[idx] = {
          ...lrs.value[idx],
          consignor: newLr.value.consignor,
          route: `${newLr.value.origin.toUpperCase()} → ${newLr.value.destination.toUpperCase()}`,
          product: newLr.value.product || 'General Freight',
          chargedWt: newLr.value.chargedWt || '10 MT',
          rate: newLr.value.rate || '₹2,000',
          ewayBill: newLr.value.ewayBill || lrs.value[idx].ewayBill,
        };
        $q.notify({
          type: 'positive',
          message: 'Lorry Receipt Updated',
          caption: `LR ${lrs.value[idx].lrNo} saved successfully.`,
          position: 'top-right',
        });
      }
    } else {
      const num = 240048 + lrs.value.length;
      lrs.value.unshift({
        id: String(Date.now()),
        lrNo: `LR/${num}`,
        consignor: newLr.value.consignor,
        route: `${newLr.value.origin.toUpperCase()} → ${newLr.value.destination.toUpperCase()}`,
        product: newLr.value.product || 'General Freight',
        chargedWt: newLr.value.chargedWt || '10 MT',
        rate: newLr.value.rate || '₹2,000',
        ewayBill: newLr.value.ewayBill || '240600889123',
        status: 'Confirmed',
      });
      $q.notify({
        type: 'positive',
        message: 'Lorry Receipt Generated',
        caption: `LR #${num} created and queued for dispatch.`,
        position: 'top-right',
      });
    }
    isSubmitting.value = false;
    showAddModal.value = false;
  }, 250);
}

function onRefresh() {
  $q.notify({
    type: 'info',
    message: 'Grid Refreshed',
    caption: 'Loaded latest booking records.',
    position: 'top-right',
  });
}

function printSingleLr(lr: LrItem) {
  exportToPdf({
    title: `Lorry Receipt Document — ${lr.lrNo}`,
    subtitle: `Customer: ${lr.consignor} | Route: ${lr.route}`,
    columns: [
      { label: 'Field', field: 'field' },
      { label: 'Detail Information', field: 'val' },
    ],
    rows: [
      { field: 'LR Number', val: lr.lrNo },
      { field: 'Consignor', val: lr.consignor },
      { field: 'Route Corridor', val: lr.route },
      { field: 'Product Description', val: lr.product },
      { field: 'Charged Weight', val: lr.chargedWt },
      { field: 'Agreed Freight Rate', val: lr.rate },
      { field: 'GST E-Way Bill', val: lr.ewayBill },
      { field: 'Current Status', val: lr.status },
    ],
  });
}

function exportOrdersCsv() {
  exportToCsv(
    'lorry_receipts_register',
    [
      { label: 'LR Number', field: 'lrNo' },
      { label: 'Consignor / Customer', field: 'consignor' },
      { label: 'Route', field: 'route' },
      { label: 'Cargo Product', field: 'product' },
      { label: 'Charged Weight', field: 'chargedWt' },
      { label: 'Agreed Rate', field: 'rate' },
      { label: 'GST E-Way Bill', field: 'ewayBill' },
      { label: 'Status', field: 'status' },
    ],
    lrs.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${lrs.value.length} records exported to CSV.`,
    position: 'top-right',
  });
}

function exportOrdersPdf() {
  exportToPdf({
    title: 'Lorry Receipts & Booking Register',
    subtitle: `Filter: ${statusFilter.value} | Total Records: ${lrs.value.length}`,
    columns: [
      { label: 'LR Number', field: 'lrNo' },
      { label: 'Consignor', field: 'consignor' },
      { label: 'Route', field: 'route' },
      { label: 'Product', field: 'product' },
      { label: 'Weight', field: 'chargedWt', align: 'right' },
      { label: 'Rate', field: 'rate', align: 'right' },
      { label: 'E-Way Bill', field: 'ewayBill' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredLrs.value,
  });
}
</script>

<style scoped>
.booking-lr-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
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
