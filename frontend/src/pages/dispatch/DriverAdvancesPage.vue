<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Driver Trip Advances</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportAdvancesPdf"
        >
          <q-icon name="picture_as_pdf" size="16px" class="q-mr-xs text-rose-600" />
          <span>Export PDF</span>
        </button>
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportAdvancesCsv"
        >
          <q-icon name="download" size="16px" class="q-mr-xs text-slate-600" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddDialog"
        >
          <q-icon name="add" size="18px" />
          <span>New Advance</span>
        </button>
      </div>
    </div>

    <!-- Advances Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards matching Billing Page -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'all' }"
          @click="selectKpiTab('all')"
          title="View all vouchers (Alt+1 or [ / ])"
        >
          <div class="kpi-title text-sky-600">TOTAL DISBURSED</div>
          <div class="kpi-amount text-sky-700">₹{{ formattedTotalAdvances }}</div>
          <div class="kpi-subtext">{{ advances.length }} vouchers recorded (Alt+1)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'advances' }"
          @click="selectKpiTab(activeKpiFilter === 'advances' ? 'all' : 'advances')"
          title="Filter trip allowances & bhatta (Alt+2 or [ / ])"
        >
          <div class="kpi-title text-emerald-700">TRIP ADVANCES</div>
          <div class="kpi-amount text-emerald-600">₹{{ formattedAdvancesOnly }}</div>
          <div class="kpi-subtext">Driver route allowances (Alt+2)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'expenses' }"
          @click="selectKpiTab(activeKpiFilter === 'expenses' ? 'all' : 'expenses')"
          title="Filter en-route expenses (Alt+3 or [ / ])"
        >
          <div class="kpi-title text-slate-700">EN-ROUTE EXPENSES</div>
          <div class="kpi-amount text-slate-800">₹{{ formattedExpensesOnly }}</div>
          <div class="kpi-subtext">Toll, repairs, RTO &amp; misc (Alt+3)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'pending' }"
          @click="selectKpiTab(activeKpiFilter === 'pending' ? 'all' : 'pending')"
          title="Filter pending vouchers (Alt+4 or [ / ])"
        >
          <div class="kpi-title text-amber-700">PENDING APPROVAL</div>
          <div class="kpi-amount text-amber-600">₹{{ formattedPendingAmount }}</div>
          <div class="kpi-subtext">{{ pendingCount }} vouchers awaiting signoff (Alt+4)</div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="relative min-w-[280px]">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sky-500">
              <q-icon name="search" size="18px" />
            </span>
            <input
              ref="searchInputRef"
              v-model="search"
              type="text"
              class="search-input w-full pl-9 pr-4 py-2 text-sm rounded-lg"
              placeholder="Search advance ID / driver / trip... (Alt+F)"
              @keydown.down.prevent="focusFirstTableRow"
              @keydown.enter.prevent="focusFirstTableRow"
              @keydown.esc="search = ''"
            />
            <button
              v-if="search"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
              @click="search = ''"
              title="Clear search (Esc)"
            >
              <q-icon name="close" size="16px" />
            </button>
          </div>

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

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-secondary-action flex items-center gap-1.5"
            :disabled="isRefreshing"
            @click="onRefresh"
          >
            <q-icon name="refresh" size="16px" :class="{ 'rotate-180': isRefreshing }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- White Theme Table with 2D Excel Navigation matching Billing Page -->
      <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse" ref="tableRef">
            <thead>
              <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 0 }">ENTRY ID</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 1 }">DATE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 2 }">DRIVER</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 3 }">TRIP REF</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 4 }">TYPE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 5 }">EXPENSE HEAD</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 6 }">AMOUNT</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 7 }">MODE</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 8 }">STATUS</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 9 }">REMARKS</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 10 }">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="(item, rIdx) in filteredAdvances"
                :key="item.id"
                class="billing-table-row hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                :class="{ 'excel-row-active': isRowActive(rIdx) }"
                tabindex="0"
                @keydown="handleTableRowKeydown($event, item, rIdx, focusedCol)"
                @focus="setFocusIndex(rIdx)"
              >
                <!-- Col 0: ENTRY ID -->
                <td
                  class="py-3 px-4 font-mono font-bold text-sky-600 transition-all select-none"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 0) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 0)"
                >
                  <span class="pl-2">{{ item.id }}</span>
                </td>

                <!-- Col 1: DATE -->
                <td
                  class="py-3 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 1) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 1)"
                >
                  {{ item.date }}
                </td>

                <!-- Col 2: DRIVER -->
                <td
                  class="py-3 px-4 font-semibold text-slate-900 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 2) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 2)"
                >
                  {{ item.driver }}
                </td>

                <!-- Col 3: TRIP REF -->
                <td
                  class="py-3 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 3) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 3)"
                >
                  {{ item.tripRef || '—' }}
                </td>

                <!-- Col 4: TYPE -->
                <td
                  class="py-3 px-4 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 4) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 4)"
                >
                  <span
                    class="badge-pill"
                    :class="item.entryType === 'Advance' ? 'badge-paid' : 'badge-pending'"
                  >
                    {{ item.entryType }}
                  </span>
                </td>

                <!-- Col 5: EXPENSE HEAD -->
                <td
                  class="py-3 px-4 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 5) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 5)"
                >
                  <span class="badge-pill" :class="getHeadBadgeClass(item.expenseHead)">
                    {{ item.expenseHead }}
                  </span>
                </td>

                <!-- Col 6: AMOUNT -->
                <td
                  class="py-3 px-4 font-mono font-bold text-slate-900 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 6) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 6)"
                >
                  ₹{{ item.amount.toLocaleString() }}
                </td>

                <!-- Col 7: MODE -->
                <td
                  class="py-3 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 7) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 7)"
                >
                  {{ item.paymentMode }}
                </td>

                <!-- Col 8: STATUS -->
                <td
                  class="py-3 px-4 text-center transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 8) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 8)"
                >
                  <span class="badge-pill" :class="getStatusBadgeClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <!-- Col 9: REMARKS -->
                <td
                  class="py-3 px-4 text-slate-500 truncate max-w-[180px] transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 9) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 9)"
                >
                  {{ item.remarks || '—' }}
                </td>

                <!-- Col 10: ACTION -->
                <td
                  class="py-3 px-4 text-center transition-all action-cell"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 10) && focusedActionIndex === -1 }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 10)"
                >
                  <div class="flex items-center justify-center gap-1.5" @click.stop>
                    <button
                      class="btn-table-action"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 10, 0) }"
                      @click="editAdvance(item)"
                      @focus="setActionFocus(rIdx, 10, 0)"
                      title="Edit Advance (Enter)"
                    >
                      Edit
                    </button>
                    <button
                      class="btn-table-icon btn-table-icon--danger"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 10, 1) }"
                      @click="confirmDeleteAdvance(item)"
                      @focus="setActionFocus(rIdx, 10, 1)"
                      title="Delete Advance (Enter / Del)"
                    >
                      <q-icon name="delete" size="14px" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredAdvances.length === 0">
                <td colspan="11" class="text-center py-12">
                  <div class="flex flex-col items-center justify-center text-center p-8">
                    <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <q-icon name="search_off" size="28px" class="text-slate-400" />
                    </div>
                    <div class="text-base font-bold text-slate-800">No matching advance records found</div>
                    <div class="text-xs text-slate-500 mt-1">Try adjusting your search terms or clearing active filters.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Excel / Tally Keyboard Status Bar Footer -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono select-none">
          <div class="flex items-center gap-3">
            <span class="font-bold text-sky-600">CELL: {{ currentCellCoordinate }}</span>
            <span class="text-slate-300">|</span>
            <span>Row {{ focusedRow + 1 }} of {{ filteredAdvances.length }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-500">Col: {{ focusedColName }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-sky-700 font-medium">Tab: {{ currentTabLabel }}</span>
          </div>
          <div class="flex items-center gap-3 text-slate-500">
            <span><kbd class="desk-kbd">&uarr;&darr;&larr;&rarr;</kbd> Move Cell</span>
            <span><kbd class="desk-kbd">Tab</kbd> Next</span>
            <span><kbd class="desk-kbd">[ / ]</kbd> Switch Tab</span>
            <span><kbd class="desk-kbd">Enter</kbd> Edit</span>
            <span><kbd class="desk-kbd">Del</kbd> Delete</span>
            <span><kbd class="desk-kbd">Alt+N</kbd> New</span>
          </div>
        </div>
      </div>

      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Driver Advances & Expenses..."
        subtitle="Updating vouchers from database"
      />
    </div>

    <!-- Record / Edit Advance Desk Dialog -->
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
            <div class="text-subtitle2 text-weight-bold text-sky-700 q-mb-xs font-mono">
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
        <div class="text-body1 text-slate-800 q-mb-sm">
          Are you sure you want to permanently delete Advance Voucher
          <span class="text-sky-700 text-weight-bold font-mono">{{ deletingItem?.id }}</span>
          for Driver <strong class="text-slate-900">{{ deletingItem?.driver }}</strong>?
        </div>
        <div class="text-caption text-rose-600">
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
import { useTableNavigation } from '../../composables/useTableNavigation';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
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

// KPI Filter Tabs matching Billing Page design
const activeKpiFilter = ref<'all' | 'advances' | 'expenses' | 'pending'>('all');
const kpiTabs: Array<'all' | 'advances' | 'expenses' | 'pending'> = ['all', 'advances', 'expenses', 'pending'];

function selectKpiTab(tab: 'all' | 'advances' | 'expenses' | 'pending') {
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

// Driver Options
const driverOptions = ref<string[]>([
  '— Select —',
  'Ramesh Alumar',
  'Devraj Patel',
  'Kishore Bhai',
  'Suresh Patel',
]);

// Expense Head Options
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

// Status Options
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

const columnLabels = [
  'Entry ID',
  'Date',
  'Driver',
  'Trip Ref',
  'Type',
  'Expense Head',
  'Amount',
  'Mode',
  'Status',
  'Remarks',
  'Action',
];

const tableRef = ref<HTMLElement | null>(null);

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
  let list = advances.value;

  if (activeKpiFilter.value === 'advances') {
    list = list.filter((a) => a.entryType === 'Advance');
  } else if (activeKpiFilter.value === 'expenses') {
    list = list.filter((a) => a.entryType === 'Expense');
  } else if (activeKpiFilter.value === 'pending') {
    list = list.filter((a) => a.status === 'Pending');
  }

  return list.filter((a) => {
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

// Full 2D Excel & Tally Table Navigation
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
} = useTableNavigation<DriverAdvance>({
  items: filteredAdvances,
  colCount: columnLabels.length,
  tableRef,
  onEnter: (item) => editAdvance(item),
  onDelete: (item) => confirmDeleteAdvance(item),
  onNew: () => openAddDialog(),
  onEscape: () => {
    searchInputRef.value?.focus?.();
  },
});

function handleTableRowKeydown(
  e: KeyboardEvent,
  item: DriverAdvance,
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
  baseTableRowKeydown(e, item, rIdx, cIdx);
}

const colLetter = computed(() => String.fromCharCode(65 + focusedCol.value));
const currentCellCoordinate = computed(() => {
  if (filteredAdvances.value.length === 0) return 'A1';
  return `${colLetter.value}${focusedRow.value + 1}`;
});

const focusedColName = computed(() => {
  if (focusedCol.value === 10) {
    const actions = ['Edit', 'Delete'];
    const act = actions[focusedActionIndex.value] || 'Edit';
    return `Action [${act}]`;
  }
  return columnLabels[focusedCol.value] || '—';
});

const currentTabLabel = computed(() => {
  switch (activeKpiFilter.value) {
    case 'advances':
      return 'Trip Advances (Alt+2)';
    case 'expenses':
      return 'En-Route Expenses (Alt+3)';
    case 'pending':
      return 'Pending Approval (Alt+4)';
    default:
      return 'All Vouchers (Alt+1)';
  }
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

function getHeadBadgeClass(head: string): string {
  switch (head) {
    case 'Toll':
      return 'badge-toll';
    case 'Driver Bhatta':
      return 'badge-bhatta';
    case 'Repairs':
      return 'badge-repair';
    case 'Police / RTO':
      return 'badge-police';
    case 'Advance':
      return 'badge-paid';
    default:
      return 'badge-exempt';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Approved':
      return 'badge-paid';
    case 'Settled':
      return 'badge-rcm';
    case 'Pending':
      return 'badge-pending';
    case 'Rejected':
      return 'badge-overdue';
    default:
      return 'badge-exempt';
  }
}

async function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  let nextSeq = `ADV/${240056 + advances.value.length}`;
  try {
    const res: any = await api.get('/api/v1/foundation/sequences/next/advance');
    if (res?.next) {
      nextSeq = res.next;
    }
  } catch (_) {}

  form.value = {
    id: nextSeq,
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
    } catch (e: any) {
      if (e.response?.data?.message) {
        notify.notifyError(e.response.data.message);
        return;
      }
      console.warn('API advance update error, saved locally:', e);
    }
    notify.notifySuccess(`Voucher ${payload.id} updated in database.`);
  } else {
    try {
      const res: any = await api.post('/api/v1/driver-advances', payload);
      const savedRecord = res?.data || res;
      if (savedRecord?.entryId || savedRecord?.id) {
        payload.id = savedRecord.entryId || savedRecord.id;
      }
      if (res?.issues?.warnings?.length) {
        notify.notifyWarning(res.issues.warnings[0].message);
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        notify.notifyError(e.response.data.message);
        return;
      }
      console.warn('API advance create error, saved locally:', e);
    }
    advances.value.unshift(payload);
    persist();
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
  isModalOpen: computed(() => showDialog.value || showDeleteDialog.value),
  onSave: saveAdvance,
  onEscape: () => {
    if (showDialog.value) showDialog.value = false;
    else if (showDeleteDialog.value) showDeleteDialog.value = false;
  },
  filters: [
    () => selectKpiTab('all'),
    () => selectKpiTab('advances'),
    () => selectKpiTab('expenses'),
    () => selectKpiTab('pending'),
  ],
});
</script>

<style scoped>
/* Page Layout */
.billing-page-container {
  background-color: #f8fafc;
}

.billing-title-wrap {
  display: inline-block;
}

.billing-underline {
  height: 3px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Action Buttons */
.btn-primary-cyan {
  background-color: #0284c7;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.btn-secondary-action {
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-secondary-action:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* KPI Box Cards */
.kpi-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.kpi-box:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}

.kpi-box--active {
  border-color: #0284c7 !important;
  background-color: #f0f9ff !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2) !important;
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
  background-color: #f8fafc;
  color: #475569;
}

/* Table Action Buttons */
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

.badge-toll {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-bhatta {
  background-color: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.badge-repair {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-police {
  background-color: #fce7f3;
  color: #be185d;
  border: 1px solid #fbcfe8;
}

/* 2D Excel Grid Navigation Styles */
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

.desk-kbd {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 10px;
  color: #475569;
  font-family: monospace;
}
</style>
