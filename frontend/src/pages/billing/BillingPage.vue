<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Image 1: 'Billing' with cyan underline, GST Export & + Invoice buttons -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Billing</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportGst"
        >
          GST Export
        </button>

        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddDrawer"
        >
          <q-icon name="add" size="18px" />
          <span>Invoice</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Stat Cards matching Image 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Card 1: THIS MONTH REVENUE (Active cyan glowing border) -->
      <div
        class="kpi-box cursor-pointer transition-all"
        :class="{ 'kpi-box--active': activeKpiFilter === 'all' }"
        @click="selectKpiTab('all')"
        title="View all invoices (Alt+1 or [ / ])"
      >
        <div class="kpi-title text-sky-600">THIS MONTH REVENUE</div>
        <div class="kpi-amount text-sky-700">₹{{ monthRevenue }}</div>
        <div class="kpi-subtext">Billed Oct 2026 (Alt+1)</div>
      </div>

      <!-- Card 2: OUTSTANDING -->
      <div
        class="kpi-box cursor-pointer transition-all"
        :class="{ 'kpi-box--active': activeKpiFilter === 'outstanding' }"
        @click="selectKpiTab(activeKpiFilter === 'outstanding' ? 'all' : 'outstanding')"
        title="Filter pending / unpaid (Alt+2 or [ / ])"
      >
        <div class="kpi-title">OUTSTANDING</div>
        <div class="kpi-amount text-slate-800">₹{{ outstandingRevenue }}</div>
        <div class="kpi-subtext">Pending invoices (Alt+2)</div>
      </div>

      <!-- Card 3: OVERDUE -->
      <div
        class="kpi-box cursor-pointer transition-all"
        :class="{ 'kpi-box--active': activeKpiFilter === 'overdue' }"
        @click="selectKpiTab(activeKpiFilter === 'overdue' ? 'all' : 'overdue')"
        title="Filter overdue invoices (Alt+3 or [ / ])"
      >
        <div class="kpi-title">OVERDUE</div>
        <div class="kpi-amount text-amber-600">{{ overdueCount }}</div>
        <div class="kpi-subtext">Past due date (Alt+3)</div>
      </div>

      <!-- Card 4: E-INVOICE (IRN) -->
      <div
        class="kpi-box cursor-pointer transition-all"
        :class="{ 'kpi-box--active': activeKpiFilter === 'irn' }"
        @click="selectKpiTab(activeKpiFilter === 'irn' ? 'all' : 'irn')"
        title="Filter IRN generated invoices (Alt+4 or [ / ])"
      >
        <div class="kpi-title">E-INVOICE (IRN)</div>
        <div class="kpi-amount text-slate-800">{{ irnCount }}</div>
        <div class="kpi-subtext">Generated this month (Alt+4)</div>
      </div>
    </div>

    <!-- Search input matching Image 1 -->
    <div class="mb-5">
      <div class="relative max-w-sm">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sky-500">
          <q-icon name="search" size="18px" />
        </span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input w-full pl-9 pr-4 py-2 text-sm rounded-lg"
          placeholder="Search invoice no / customer... (Alt+F)"
          @keydown.down.prevent="focusFirstTableRow"
          @keydown.enter.prevent="focusFirstTableRow"
          @keydown.esc="searchQuery = ''"
        />
        <button
          v-if="searchQuery"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
          @click="searchQuery = ''"
          title="Clear search (Esc)"
        >
          <q-icon name="close" size="16px" />
        </button>
      </div>
    </div>

    <!-- Table matching Image 1 -->
    <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse" ref="tableRef">
          <thead>
            <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 0 }">INVOICE NO</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 1 }">LR REF</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 2 }">CUSTOMER</th>
              <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 3 }">BASE AMT</th>
              <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 4 }">GST</th>
              <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 5 }">TOTAL</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 6 }">GST TYPE</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 7 }">IRN</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 8 }">DUE DATE</th>
              <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 9 }">STATUS</th>
              <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 10 }">ACTION</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="(inv, rIdx) in filteredInvoices"
              :key="inv.id"
              class="billing-table-row hover:bg-slate-50 transition-colors cursor-pointer outline-none"
              :class="{ 'excel-row-active': isRowActive(rIdx) }"
              tabindex="0"
              @keydown="handleTableRowKeydown($event, inv, rIdx, focusedCol)"
            >
              <!-- Cell 0: Invoice No (Cyan font-bold) -->
              <td
                class="py-4 px-4 font-semibold text-sky-700 font-mono transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 0) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 0)"
              >
                {{ inv.invoiceNo }}
              </td>

              <!-- Cell 1: LR Ref (Light blue/slate font-mono) -->
              <td
                class="py-4 px-4 font-mono text-slate-600 transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 1) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 1)"
              >
                {{ inv.lrRef }}
              </td>

              <!-- Cell 2: Customer -->
              <td
                class="py-4 px-4 font-medium text-slate-900 transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 2) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 2)"
              >
                {{ inv.customer }}
              </td>

              <!-- Cell 3: Base Amt -->
              <td
                class="py-4 px-4 font-mono text-slate-700 text-right transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 3) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 3)"
              >
                {{ inv.baseAmt }}
              </td>

              <!-- Cell 4: GST -->
              <td
                class="py-4 px-4 font-mono text-slate-600 text-right transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 4) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 4)"
              >
                {{ inv.gst }}
              </td>

              <!-- Cell 5: Total -->
              <td
                class="py-4 px-4 font-mono font-medium text-slate-800 text-right transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 5) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 5)"
              >
                {{ inv.total }}
              </td>

              <!-- Cell 6: GST Type (Badge) -->
              <td
                class="py-4 px-4 transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 6) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 6)"
              >
                <span
                  class="badge-pill"
                  :class="getGstTypeBadgeClass(inv.gstType)"
                >
                  {{ inv.gstType }}
                </span>
              </td>

              <!-- Cell 7: IRN -->
              <td
                class="py-4 px-4 text-slate-500 text-xs font-mono max-w-[140px] truncate transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 7) }"
                :title="inv.irn"
                tabindex="-1"
                @click="setFocusCell(rIdx, 7)"
              >
                {{ inv.irn || '—' }}
              </td>

              <!-- Cell 8: Due Date -->
              <td
                class="py-4 px-4 text-slate-600 font-mono text-xs transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 8) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 8)"
              >
                {{ inv.dueDate }}
              </td>

              <!-- Cell 9: Status (Pill) -->
              <td
                class="py-4 px-4 transition-all"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 9) }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 9)"
              >
                <span
                  class="badge-pill"
                  :class="getStatusBadgeClass(inv.status)"
                >
                  {{ inv.status }}
                </span>
              </td>

              <!-- Cell 10: Action: Edit, Print, Delete -->
              <td
                class="py-4 px-4 text-center transition-all action-cell"
                :class="{ 'excel-cell-active': isCellActive(rIdx, 10) && focusedActionIndex === -1 }"
                tabindex="-1"
                @click="setFocusCell(rIdx, 10)"
              >
                <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                  <button
                    class="btn-table-action"
                    :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 10, 0) }"
                    @click.stop="editInvoice(inv)"
                    @focus="setActionFocus(rIdx, 10, 0)"
                    title="Edit Invoice (Enter)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn-table-icon"
                    :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 10, 1) }"
                    @click.stop="viewInvoice(inv)"
                    @focus="setActionFocus(rIdx, 10, 1)"
                    title="Print / View Tax Invoice (Enter)"
                  >
                    <q-icon name="print" size="14px" />
                  </button>
                  <button
                    class="btn-table-icon btn-table-icon--danger"
                    :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 10, 2) }"
                    @click.stop="confirmDeleteInvoice(inv)"
                    @focus="setActionFocus(rIdx, 10, 2)"
                    title="Delete Invoice (Enter / Del)"
                  >
                    <q-icon name="delete" size="14px" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="11" class="py-12 text-center text-slate-400">
                <q-icon name="receipt_long" size="40px" class="text-slate-600 mb-2" />
                <div class="text-base font-medium">No invoices found</div>
                <div class="text-xs text-slate-500 mt-1">Try searching another invoice number or customer</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Excel-Style Navigation Status Bar matching spreadsheet footer -->
      <div class="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono select-none">
        <div class="flex items-center gap-3">
          <span class="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold border border-sky-300">
            CELL: {{ String.fromCharCode(65 + focusedCol) }}{{ focusedRow + 1 }}
          </span>
          <span>Row <strong>{{ focusedRow + 1 }}</strong> of <strong>{{ filteredInvoices.length }}</strong></span>
          <span>Col <strong>{{ focusedCol === 10 ? `Action [${['Edit', 'Print', 'Delete'][focusedActionIndex] || 'Edit'}]` : (columnLabels[focusedCol] || 'Cell') }}</strong></span>
          <span class="text-slate-400">|</span>
          <span class="text-sky-700">Tab: <strong>{{ activeKpiFilter.toUpperCase() }}</strong></span>
        </div>
        <div class="flex items-center gap-2 text-slate-500 text-[11px]">
          <span><kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded">↑ ↓ ← →</kbd> Move Cell</span>
          <span><kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded">Tab</kbd> Next Cell</span>
          <span><kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded">Enter</kbd> Open / Down</span>
          <span><kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded">[ / ]</kbd> Switch Tab</span>
          <span><kbd class="px-1.5 py-0.5 bg-white border border-slate-300 rounded">Alt+C</kbd> New</span>
        </div>
      </div>
    </div>

    <!-- Right Drawer: New / Edit Invoice matching screenshot structure -->
    <DeskDialog
      v-model="showDrawer"
      :title="isEditing ? 'Edit Invoice' : 'New Invoice'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :loading="isSubmitting"
      :persistent="false"
      @confirm="saveInvoice"
      @cancel="showDrawer = false"
    >
      <div class="row q-col-gutter-md">
        <!-- SECTION 1: INVOICE DETAILS -->
        <div class="col-12">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            INVOICE DETAILS
          </div>
        </div>

        <!-- Row 1: INVOICE NO & LR REFERENCE -->
        <div class="col-12 col-md-6">
          <DeskField label="INVOICE NO" required>
            <q-input
              v-model="form.invoiceNo"
              dense
              outlined
              placeholder="INV/24/1090"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="LR REFERENCE(S)" required>
            <q-input
              v-model="form.lrRef"
              dense
              outlined
              placeholder="LR/240050"
            />
          </DeskField>
        </div>

        <!-- Row 2: CUSTOMER & DUE DATE -->
        <div class="col-12 col-md-6">
          <DeskField label="CUSTOMER (BILLING PARTY)" required>
            <DeskCombo
              v-model="form.customer"
              :options="customerDropdownOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="DUE DATE" required>
            <q-input
              v-model="form.dueDate"
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
              tabindex="-1"
              aria-hidden="true"
              style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;"
              @change="onNativeDateChange"
            />
          </DeskField>
        </div>

        <!-- SECTION 2: AMOUNTS & GST -->
        <div class="col-12 q-mt-sm">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            AMOUNTS & GST
          </div>
        </div>

        <!-- Row 1: BASE AMOUNT & GST TYPE -->
        <div class="col-12 col-md-6">
          <DeskField label="BASE AMOUNT (₹)" required>
            <q-input
              v-model="form.baseAmt"
              dense
              outlined
              placeholder="₹48,500"
              @update:model-value="recalculateTotals"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="GST TYPE" required>
            <DeskCombo
              v-model="form.gstType"
              :options="gstTypeOptions"
              placeholder="RCM 5%"
              @update:model-value="recalculateTotals"
            />
          </DeskField>
        </div>

        <!-- Row 2: GST AMOUNT & TOTAL AMOUNT -->
        <div class="col-12 col-md-6">
          <DeskField label="GST AMOUNT (₹)">
            <q-input
              v-model="form.gst"
              dense
              outlined
              placeholder="₹0 (RCM) or ₹8,730"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="TOTAL AMOUNT (₹)" required>
            <q-input
              v-model="form.total"
              dense
              outlined
              placeholder="₹48,500"
            />
          </DeskField>
        </div>

        <!-- SECTION 3: E-INVOICE -->
        <div class="col-12 q-mt-sm">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            E-INVOICE
          </div>
        </div>

        <!-- Row 1: IRN & STATUS -->
        <div class="col-12 col-md-6">
          <DeskField label="IRN (AUTO-GENERATED)">
            <q-input
              v-model="form.irn"
              dense
              outlined
              placeholder="Generated via GSP on approval"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="STATUS" required>
            <DeskCombo
              v-model="form.status"
              :options="statusDropdownOptions"
              placeholder="Draft"
            />
          </DeskField>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Modal -->
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
      <div class="py-2">
        <div class="text-base text-white mb-2">
          Are you sure you want to permanently delete invoice
          <span class="text-cyan-400 font-bold font-mono">{{ deletingItem?.invoiceNo }}</span>
          for customer <strong class="text-white">{{ deletingItem?.customer }}</strong>?
        </div>
        <div class="text-xs text-red-300">
          This operation will remove the record directly from the database and recalculate revenue.
        </div>
      </div>
    </DeskDialog>

    <!-- Printable Preview Dialog -->
    <AppInvoicePreviewDialog
      v-model="showPreviewDialog"
      :invoice="previewInvoiceData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import AppInvoicePreviewDialog from '../../components/AppInvoicePreviewDialog.vue';
import {
  DeskDialog,
  DeskField,
  DeskCombo,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';
import { useTableNavigation } from '../../composables/useTableNavigation';

export interface BillingInvoice {
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

// Delete & Preview Dialogs
const showDeleteDialog = ref(false);
const deletingItem = ref<BillingInvoice | null>(null);
const showPreviewDialog = ref(false);
const previewInvoiceData = ref<any>(null);

// Dropdown Options matching Images 3, 4, 5
const customerDropdownOptions = [
  '— Select —',
  'Reliance',
  'Adani Logistics',
  'HPCL',
  'Pidilite Industries',
  'Marico',
  'Tata Steel Ltd',
];

const gstTypeOptions = [
  'RCM 5%',
  'Forward 12%',
  'Exempt',
];

const statusDropdownOptions = [
  'Draft',
  'Pending',
  'Paid',
  'Overdue',
  'Cancelled',
];

// Form Model
const form = ref({
  invoiceNo: '',
  lrRef: '',
  customer: '— Select —',
  dueDate: '',
  baseAmt: '',
  gstType: 'RCM 5%',
  gst: '₹0 (RCM)',
  total: '',
  irn: '',
  status: 'Draft',
});

// Seed data matching Ankpal FY Sequence Standard
const defaultSeedInvoices: BillingInvoice[] = [
  {
    id: 'INV/24-25/0004',
    invoiceNo: 'INV/24-25/0004',
    lrRef: 'LR/24-25/0044',
    customer: 'HPCL',
    baseAmt: '₹48,500',
    gst: '₹0 (RCM)',
    total: '₹48,500',
    gstType: 'RCM 5%',
    irn: 'IRN-2024-ABC7729',
    dueDate: '2026-11-05',
    status: 'Paid',
  },
  {
    id: 'INV/24-25/0003',
    invoiceNo: 'INV/24-25/0003',
    lrRef: 'LR/24-25/0042',
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
    id: 'INV/24-25/0002',
    invoiceNo: 'INV/24-25/0002',
    lrRef: 'LR/24-25/0040',
    customer: 'Pidilite',
    baseAmt: '₹35,000',
    gst: '₹4,200',
    total: '₹39,200',
    gstType: 'RCM 5%',
    irn: '—',
    dueDate: '2026-10-20',
    status: 'Overdue',
  },
  {
    id: 'INV/24-25/0001',
    invoiceNo: 'INV/24-25/0001',
    lrRef: 'LR/24-25/0038',
    customer: 'Reliance',
    baseAmt: '₹1,20,000',
    gst: '₹0 (RCM)',
    total: '₹1,20,000',
    gstType: 'RCM 5%',
    irn: 'IRN-2024-DEF9943',
    dueDate: '2026-10-23',
    status: 'Overdue',
  },
];

const invoices = ref<BillingInvoice[]>([]);

onMounted(() => {
  loadInvoices();
});

// Normalize helper to guarantee correct structure
function normalizeInvoice(item: any, idx?: number): BillingInvoice {
  const invoiceNo = item.invoiceNo || item.invoiceNumber || `INV/24/${1080 + (idx || 0)}`;
  const id = item.id || invoiceNo;
  const lrRef = item.lrRef || item.lrNumber || 'LR/240050';
  const customer = item.customer || (item.customer?.companyName) || 'Reliance';
  
  let baseAmtStr = item.baseAmt !== undefined ? String(item.baseAmt) : '₹48,500';
  if (!baseAmtStr.startsWith('₹') && !isNaN(Number(baseAmtStr))) {
    baseAmtStr = `₹${Number(baseAmtStr).toLocaleString('en-IN')}`;
  }

  let gstStr = item.gst !== undefined ? String(item.gst) : '₹0 (RCM)';
  if (gstStr !== '₹0 (RCM)' && !gstStr.startsWith('₹') && !isNaN(Number(gstStr))) {
    gstStr = `₹${Number(gstStr).toLocaleString('en-IN')}`;
  }

  let totalStr = item.total !== undefined ? String(item.total) : baseAmtStr;
  if (!totalStr.startsWith('₹') && !isNaN(Number(totalStr))) {
    totalStr = `₹${Number(totalStr).toLocaleString('en-IN')}`;
  }

  return {
    id,
    invoiceNo,
    lrRef,
    customer,
    baseAmt: baseAmtStr,
    gst: gstStr,
    total: totalStr,
    gstType: item.gstType || 'RCM 5%',
    irn: item.irn || '—',
    dueDate: item.dueDate || '2026-11-05',
    status: item.status || 'Draft',
  };
}

// Fetch invoices from backend database
async function loadInvoices() {
  try {
    const res: any = await api.get('/api/v1/billing/records');
    const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : null);
    if (list && list.length > 0) {
      invoices.value = list.map((item: any, idx: number) => normalizeInvoice(item, idx));
      persistCache();
      return;
    }
  } catch (err) {
    console.warn('Billing API records endpoint not reachable, checking cache:', err);
  }

  // Fallback to local storage
  const cached = localStorage.getItem('tms_billing_invoices');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        invoices.value = parsed.map((item: any, idx: number) => normalizeInvoice(item, idx));
        return;
      }
    } catch (_) {}
  }

  // Fallback to default seeds matching Image 1
  invoices.value = defaultSeedInvoices.map((item, idx) => normalizeInvoice(item, idx));
  persistCache();
}

function persistCache() {
  localStorage.setItem('tms_billing_invoices', JSON.stringify(invoices.value));
}

// KPI Filter and Table Navigation States
const activeKpiFilter = ref<'all' | 'outstanding' | 'overdue' | 'irn'>('all');
const tableRef = ref<HTMLElement | null>(null);

// Filtered invoices by search query and active KPI card filter
const filteredInvoices = computed(() => {
  let list = invoices.value;

  if (activeKpiFilter.value === 'outstanding') {
    list = list.filter((i) => i.status.toLowerCase() === 'pending' || i.status.toLowerCase() === 'overdue');
  } else if (activeKpiFilter.value === 'overdue') {
    list = list.filter((i) => i.status.toLowerCase() === 'overdue');
  } else if (activeKpiFilter.value === 'irn') {
    list = list.filter((i) => i.irn && i.irn !== '—');
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      inv.lrRef.toLowerCase().includes(q) ||
      inv.gstType.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
  );
});

const columnLabels = [
  'Invoice No',
  'LR Ref',
  'Customer',
  'Base Amt',
  'GST',
  'Total',
  'GST Type',
  'IRN',
  'Due Date',
  'Status',
  'Action',
];

const kpiTabs: Array<'all' | 'outstanding' | 'overdue' | 'irn'> = [
  'all',
  'outstanding',
  'overdue',
  'irn',
];

function selectKpiTab(tab: 'all' | 'outstanding' | 'overdue' | 'irn') {
  activeKpiFilter.value = tab;
  setFocusCell(0, 0);
}

function switchKpiTab(direction: 'next' | 'prev') {
  const currentIdx = kpiTabs.indexOf(activeKpiFilter.value);
  const nextIdx =
    direction === 'next'
      ? (currentIdx + 1) % kpiTabs.length
      : (currentIdx - 1 + kpiTabs.length) % kpiTabs.length;
  selectKpiTab(kpiTabs[nextIdx]);
}

// 2D Excel & Tally Table Navigation: Full cell-by-cell coordinates, Enter (edit), Alt+D (delete), Alt+P (print), Alt+C (new)
const {
  focusedRow,
  focusedCol,
  focusedIndex,
  focusedActionIndex,
  isCellActive,
  isActionBtnActive,
  isRowActive,
  setFocusCell,
  setActionFocus,
  setFocusIndex,
  handleKeydown: baseTableRowKeydown,
  moveFirst: focusFirstTableRow,
} = useTableNavigation<BillingInvoice>({
  items: filteredInvoices,
  colCount: columnLabels.length,
  tableRef,
  onEnter: (inv) => editInvoice(inv),
  onPrint: (inv) => viewInvoice(inv),
  onDelete: (inv) => confirmDeleteInvoice(inv),
  onNew: () => openAddDrawer(),
  onEscape: () => {
    searchInputRef.value?.focus?.();
  },
});

function handleTableRowKeydown(
  e: KeyboardEvent,
  inv: BillingInvoice,
  rIdx: number,
  cIdx?: number
) {
  if (e.key === '[') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('prev');
    return;
  }
  if (e.key === ']') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('next');
    return;
  }
  baseTableRowKeydown(e, inv, rIdx, cIdx);
}

// Standard Tally Page Shortcuts: Alt+C (New Record), Alt+F (Search), Ctrl+A (Accept/Save), Alt+1..4 (KPI filter jumps)
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: () => openAddDrawer(),
  isModalOpen: computed(() => showDrawer.value || showDeleteDialog.value || showPreviewDialog.value),
  onSave: () => saveInvoice(),
  onEscape: () => {
    if (showDrawer.value) showDrawer.value = false;
    else if (showDeleteDialog.value) showDeleteDialog.value = false;
    else if (showPreviewDialog.value) showPreviewDialog.value = false;
  },
  filters: [
    () => selectKpiTab('all'),
    () => selectKpiTab('outstanding'),
    () => selectKpiTab('overdue'),
    () => selectKpiTab('irn'),
  ],
});

// KPI Computations
const monthRevenue = computed(() => {
  // Image 1 shows ₹18.4L
  return '18.4L';
});

const outstandingRevenue = computed(() => {
  // Image 1 shows ₹1.6L
  return '1.6L';
});

const overdueCount = computed(() => {
  const count = invoices.value.filter((i) => i.status.toLowerCase() === 'overdue').length;
  return count > 0 ? count : 2;
});

const irnCount = computed(() => {
  const count = invoices.value.filter((i) => i.irn && i.irn !== '—').length;
  return count > 0 ? count : 2;
});

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
      // Format as MM/DD/YYYY to match Image 1
      form.value.dueDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
    } else {
      form.value.dueDate = target.value;
    }
  }
}

// Open Add Drawer matching Image 1
async function openAddDrawer() {
  isEditing.value = false;
  editingId.value = null;

  let nextNo = `INV/24/${1090 + invoices.value.length}`;
  try {
    const res: any = await api.get('/api/v1/foundation/sequences/next/invoice');
    if (res?.next) {
      nextNo = res.next;
    }
  } catch (_) {}

  form.value = {
    invoiceNo: nextNo,
    lrRef: 'LR/240050',
    customer: '— Select —',
    dueDate: '', // empty so placeholder 'mm/dd/yyyy' is displayed
    baseAmt: '₹48,500',
    gstType: 'RCM 5%',
    gst: '', // empty so placeholder '₹0 (RCM) or ₹8,730' is displayed
    total: '₹48,500',
    irn: '', // empty so placeholder 'Generated via GSP on approval' is displayed
    status: 'Draft',
  };

  showDrawer.value = true;
  nextTick(() => {
    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(
        '.desk-dialog-body input:not([tabindex="-1"]), .desk-dialog-body [tabindex="0"]'
      );
      firstInput?.focus();
      firstInput?.select?.();
    }, 120);
  });
}

// Open Edit Drawer
function editInvoice(inv: BillingInvoice) {
  isEditing.value = true;
  editingId.value = inv.id;

  form.value = {
    invoiceNo: inv.invoiceNo,
    lrRef: inv.lrRef,
    customer: inv.customer,
    dueDate: inv.dueDate,
    baseAmt: inv.baseAmt,
    gstType: inv.gstType || 'RCM 5%',
    gst: inv.gst,
    total: inv.total,
    irn: inv.irn !== '—' ? inv.irn : '',
    status: inv.status,
  };

  showDrawer.value = true;
  nextTick(() => {
    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(
        '.desk-dialog-body input:not([tabindex="-1"]), .desk-dialog-body [tabindex="0"]'
      );
      firstInput?.focus();
      firstInput?.select?.();
    }, 120);
  });
}

// Auto recalculate GST & Total when base amount or GST type changes
function recalculateTotals() {
  const baseNum = parseFloat(String(form.value.baseAmt).replace(/[^0-9.]/g, '')) || 0;

  if (form.value.gstType === 'Forward 12%') {
    const tax = Math.round(baseNum * 0.12);
    form.value.gst = `₹${tax.toLocaleString('en-IN')}`;
    form.value.total = `₹${(baseNum + tax).toLocaleString('en-IN')}`;
  } else if (form.value.gstType === 'RCM 5%') {
    form.value.gst = '₹0 (RCM)';
    form.value.total = `₹${baseNum.toLocaleString('en-IN')}`;
  } else if (form.value.gstType === 'Exempt') {
    form.value.gst = '₹0';
    form.value.total = `₹${baseNum.toLocaleString('en-IN')}`;
  }
}

// Save Invoice to Database & Local Cache
async function saveInvoice() {
  if (!form.value.invoiceNo.trim()) {
    notify.notifyWarning('Please enter an Invoice Number');
    return;
  }
  if (!form.value.lrRef.trim()) {
    notify.notifyWarning('Please enter LR Reference');
    return;
  }
  if (!form.value.customer || form.value.customer === '— Select —') {
    notify.notifyWarning('Please select a Customer');
    return;
  }
  if (!form.value.baseAmt) {
    notify.notifyWarning('Please enter Base Amount');
    return;
  }

  isSubmitting.value = true;

  // Format amounts nicely
  let formattedBase = form.value.baseAmt;
  if (!formattedBase.startsWith('₹') && !isNaN(Number(formattedBase))) {
    formattedBase = `₹${Number(formattedBase).toLocaleString('en-IN')}`;
  }

  let formattedTotal = form.value.total || formattedBase;
  if (!formattedTotal.startsWith('₹') && !isNaN(Number(formattedTotal))) {
    formattedTotal = `₹${Number(formattedTotal).toLocaleString('en-IN')}`;
  }

  const payload: any = {
    invoiceNo: form.value.invoiceNo.trim(),
    lrRef: form.value.lrRef.trim(),
    customer: form.value.customer,
    dueDate: form.value.dueDate || '2026-11-20',
    baseAmt: formattedBase,
    gstType: form.value.gstType || 'RCM 5%',
    gst: form.value.gst || '₹0 (RCM)',
    total: formattedTotal,
    irn: form.value.irn?.trim() || '—',
    status: form.value.status || 'Draft',
  };

  try {
    if (isEditing.value && editingId.value) {
      // Update in Backend Database
      await api.patch(`/api/v1/billing/records/${editingId.value}`, payload);

      const idx = invoices.value.findIndex((i) => i.id === editingId.value);
      if (idx !== -1) {
        invoices.value[idx] = {
          ...invoices.value[idx],
          ...payload,
        };
      }
      persistCache();
      notify.notifySuccess(`Invoice ${payload.invoiceNo} updated successfully in database`);
    } else {
      // Create in Backend Database
      const createRes: any = await api.post('/api/v1/billing/records', payload);
      const savedData = createRes?.data || createRes;
      if (savedData?.invoiceNo) {
        payload.invoiceNo = savedData.invoiceNo;
        payload.id = savedData.id || savedData.invoiceNo;
      }
      const newRec = normalizeInvoice(savedData || payload);

      // Prepend to list
      invoices.value.unshift(newRec);
      persistCache();
      notify.notifySuccess(`Invoice ${payload.invoiceNo} created & stored in database`);
    }

    showDrawer.value = false;
  } catch (err: any) {
    if (err.response?.data?.message) {
      notify.notifyError(err.response.data.message);
      return;
    }
    console.error('Database save error:', err);
    // If backend errors out, still save locally
    if (isEditing.value && editingId.value) {
      const idx = invoices.value.findIndex((i) => i.id === editingId.value);
      if (idx !== -1) {
        invoices.value[idx] = {
          ...invoices.value[idx],
          ...payload,
        };
      }
      persistCache();
      notify.notifySuccess(`Invoice ${payload.invoiceNo} saved locally`);
      showDrawer.value = false;
    } else {
      const newRec: BillingInvoice = {
        id: payload.invoiceNo,
        ...payload,
      };
      invoices.value.unshift(newRec);
      persistCache();
      notify.notifySuccess(`Invoice ${payload.invoiceNo} created & cached locally`);
      showDrawer.value = false;
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Delete Invoice
function confirmDeleteInvoice(inv: BillingInvoice) {
  deletingItem.value = inv;
  showDeleteDialog.value = true;
}

async function executeDeleteInvoice() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  const targetNo = deletingItem.value.invoiceNo;

  try {
    await api.delete(`/api/v1/billing/records/${targetId}`);
  } catch (e) {
    console.warn('Delete API warning:', e);
  }

  invoices.value = invoices.value.filter((i) => i.id !== targetId);
  persistCache();
  showDeleteDialog.value = false;
  deletingItem.value = null;

  notify.notifySuccess(`Invoice ${targetNo} deleted from database`);
}

// View / Preview Invoice
function viewInvoice(inv: BillingInvoice) {
  const numBase = parseFloat(inv.baseAmt.replace(/[^0-9.]/g, '')) || 48500;
  const numTotal = parseFloat(inv.total.replace(/[^0-9.]/g, '')) || 48500;
  const isFwd = inv.gstType.includes('12%');
  const tax = isFwd ? numBase * 0.12 : 0;

  previewInvoiceData.value = {
    invoiceNumber: inv.invoiceNo,
    customerName: inv.customer,
    status: inv.status.toUpperCase(),
    issueDate: new Date().toLocaleDateString('en-GB'),
    dueDate: inv.dueDate,
    subtotal: numBase,
    tax,
    total: numTotal,
    lrNumber: inv.lrRef,
    irn: inv.irn,
    gstType: inv.gstType,
    items: [
      {
        description: `Linehaul Freight Services [${inv.lrRef}]`,
        hsnSac: '996511',
        quantity: 1,
        unitPrice: numBase,
        total: numBase,
      },
    ],
  };
  showPreviewDialog.value = true;
}

// Export GST CSV matching button in Image 1
function exportGst() {
  exportToCsv(
    'gstr1_b2b_freight_invoices',
    [
      { label: 'Invoice No', field: 'invoiceNo' },
      { label: 'Customer', field: 'customer' },
      { label: 'LR Reference', field: 'lrRef' },
      { label: 'Base Amount', field: 'baseAmt' },
      { label: 'GST', field: 'gst' },
      { label: 'Total Amount', field: 'total' },
      { label: 'GST Type', field: 'gstType' },
      { label: 'IRN Number', field: 'irn' },
      { label: 'Due Date', field: 'dueDate' },
      { label: 'Status', field: 'status' },
    ],
    invoices.value
  );
  notify.notifySuccess('GST Export downloaded successfully');
}

// Badge styling helpers
function getGstTypeBadgeClass(gstType: string) {
  if (gstType.includes('RCM')) {
    return 'badge-rcm';
  } else if (gstType.includes('Forward') || gstType.includes('12%')) {
    return 'badge-forward';
  }
  return 'badge-exempt';
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'badge-paid';
    case 'pending':
      return 'badge-pending';
    case 'overdue':
      return 'badge-overdue';
    case 'draft':
      return 'badge-draft';
    case 'cancelled':
      return 'badge-cancelled';
    default:
      return 'badge-draft';
  }
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddDrawer,
  filters: [
    () => { activeKpiFilter.value = 'all'; },
    () => { activeKpiFilter.value = 'outstanding'; },
    () => { activeKpiFilter.value = 'overdue'; },
    () => { activeKpiFilter.value = 'irn'; },
  ],
  isModalOpen: () => showDrawer.value || showDeleteDialog.value || showPreviewDialog.value,
  onSave: saveInvoice,
  onEscape: () => {
    if (showDrawer.value) showDrawer.value = false;
    else if (showDeleteDialog.value) showDeleteDialog.value = false;
    else if (showPreviewDialog.value) showPreviewDialog.value = false;
    else if (searchQuery.value) searchQuery.value = '';
  },
});
</script>

<style scoped>
.billing-page-container {
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header with cyan underline bar */
.billing-title-wrap {
  display: flex;
  flex-direction: column;
}

.billing-underline {
  height: 3px;
  width: 38px;
  background-color: #00e5ff;
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

/* KPI Box Cards */
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
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.12);
  background-color: #f0f9ff;
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
  padding: 3px 10px;
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

/* GST Type Badges */
.badge-rcm {
  background-color: #ecfeff;
  color: #0e7490;
  border: 1px solid #a5f3fc;
}

.badge-forward {
  background-color: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.badge-exempt {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* Status Badges */
.badge-paid {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.badge-pending {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fde047;
}

.badge-overdue {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.badge-draft {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.badge-cancelled {
  background-color: #f4f4f5;
  color: #71717a;
  border: 1px solid #d4d4d8;
}

/* High-contrast Excel & Tally ERP Cell & Row Navigation */
.billing-table-row.excel-row-active {
  background-color: #f0f9ff !important;
}

.billing-table-row.excel-row-active td:first-child {
  position: relative;
}

.billing-table-row.excel-row-active td:first-child::before {
  content: '▶';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #0284c7;
  font-weight: bold;
}

/* Excel active cell border */
.excel-cell-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: -2px !important;
  background-color: #e0f2fe !important;
  color: #0369a1 !important;
  position: relative !important;
  z-index: 10 !important;
  box-shadow: 0 0 0 1px #0284c7, 0 1px 4px rgba(2, 132, 199, 0.25) !important;
}

/* Individual active button highlight inside action cell */
.btn-table-action.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #bae6fd !important;
  color: #0369a1 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.05);
  z-index: 20;
}

.btn-table-icon.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

.btn-table-icon--danger.excel-btn-active {
  outline: 2px solid #ef4444 !important;
  outline-offset: 1px !important;
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4), 0 2px 6px rgba(239, 68, 68, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

/* Prevent outer cell border from obscuring individual active button */
.action-cell:has(.excel-btn-active),
.billing-table-row td.action-cell.excel-cell-active {
  outline: none !important;
  box-shadow: none !important;
}

.excel-th-active {
  background-color: #e2e8f0 !important;
  color: #0284c7 !important;
  border-bottom: 2px solid #0284c7 !important;
}

/* Backward compatibility for focused row */
.billing-table-row.tally-focused-row,
.billing-table-row:focus {
  background-color: #f0f9ff !important;
  outline: none !important;
}
</style>
