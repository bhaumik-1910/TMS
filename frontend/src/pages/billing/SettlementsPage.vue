<template>
  <div class="settlements-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header with Title & Action Controls (Single-Row Clean Cyber-Dark) -->
    <div class="row items-center justify-between no-wrap q-mb-md gap-3">
      <div class="min-w-0">
        <div class="text-h6 text-weight-bold text-white row items-center no-wrap q-gutter-x-sm">
          <q-icon name="payments" color="cyan" size="24px" />
          <span class="truncate">Trip Settlements & Transporter Payouts</span>
          <span class="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 hidden md:inline-flex items-center gap-1.5 ml-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            PAYOUT LEDGER ACTIVE
          </span>
        </div>
        <div class="text-caption text-grey-5 truncate">
          Attached fleet & market vehicle settlement ledger with TDS (194C) and shortage deductions
        </div>
      </div>

      <!-- Quick Export & Creation Actions (Single-Row) -->
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
          <q-tooltip>Refresh Settlements Register</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportSettlementsPdf"
        >
          <q-tooltip>Download Settlement Register in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportSettlementsCsv"
        >
          <q-tooltip>Export Settlement Register to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="New Settlement"
          class="desk-btn-primary"
          @click="openAddModal"
        >
          <q-tooltip>Generate Trip Settlement Voucher</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Main Workspace with Inner Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">SETTLED THIS MONTH</div>
          <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">₹{{ formattedSettledAmount }}</div>
          <div class="text-xs text-slate-400 font-mono">{{ paidCount }} settlements cleared</div>
          <div class="accent-bar bg-cyan-400"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">PENDING SETTLEMENTS</div>
          <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ pendingCount }}</div>
          <div class="text-xs text-slate-400 font-mono">Awaiting accounts approval</div>
          <div class="accent-bar bg-amber-400"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TDS DEDUCTED (194C)</div>
          <div class="text-3xl font-extrabold font-mono text-white my-1">₹{{ formattedTdsTotal }}</div>
          <div class="text-xs text-slate-400 font-mono">Statutory tax compliance</div>
          <div class="accent-bar bg-cyan-400"></div>
        </div>

        <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">NET DISBURSED</div>
          <div class="text-3xl font-extrabold font-mono text-emerald-400 my-1">₹{{ formattedNetDisbursed }}</div>
          <div class="text-xs text-slate-400 font-mono">Transferred via NEFT/RTGS</div>
          <div class="accent-bar bg-emerald-400"></div>
        </div>
      </div>

      <!-- Desk Keyboard Data Table -->
      <DeskDataTable
        ref="gridRef"
        title="Trip Settlements Register"
        :rows="filteredSettlements"
        :columns="tableColumns"
        row-key="id"
        selection-mode="none"
        :allow-create="false"
        :allow-export="false"
        :allow-refresh="true"
        :allow-delete="true"
        @create="openAddModal"
        @edit="viewDetails"
        @delete="confirmDeleteSettlement"
        @row-dblclick="viewDetails"
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
            popup-content-class="desk-select-menu"
            style="min-width: 140px;"
          />
        </template>

        <!-- Custom Body Cell: Settlement ID -->
        <template #body-cell-settlementId="{ value }">
          <span class="text-cyan-4 text-weight-bold font-mono">{{ value }}</span>
        </template>

        <!-- Custom Body Cell: Attached Transporter / Party -->
        <template #body-cell-party="{ value }">
          <span class="text-white text-weight-bold">{{ value }}</span>
        </template>

        <!-- Custom Body Cell: Linked Trip Ref -->
        <template #body-cell-tripRef="{ value }">
          <span class="font-mono text-cyan-3">{{ value }}</span>
        </template>

        <!-- Custom Body Cell: Gross Freight -->
        <template #body-cell-grossAmt="{ value }">
          <span class="font-mono text-slate-200">₹{{ (Number(value) || 0).toLocaleString('en-IN') }}</span>
        </template>

        <!-- Custom Body Cell: Trip Advance -->
        <template #body-cell-advance="{ value }">
          <span class="font-mono text-amber-400">₹{{ (Number(value) || 0).toLocaleString('en-IN') }}</span>
        </template>

        <!-- Custom Body Cell: TDS (194C) -->
        <template #body-cell-tds="{ value }">
          <span class="font-mono text-slate-400">₹{{ (Number(value) || 0).toLocaleString('en-IN') }}</span>
        </template>

        <!-- Custom Body Cell: Shortage / Penalty -->
        <template #body-cell-shortage="{ value }">
          <span
            class="font-mono"
            :class="Number(value) > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'"
          >
            ₹{{ (Number(value) || 0).toLocaleString('en-IN') }}
          </span>
        </template>

        <!-- Custom Body Cell: Net Payable Amount -->
        <template #body-cell-netPayable="{ value }">
          <span class="font-mono text-weight-bold text-cyan-4">₹{{ (Number(value) || 0).toLocaleString('en-IN') }}</span>
        </template>

        <!-- Custom Body Cell: Date -->
        <template #body-cell-date="{ value }">
          <span class="font-mono text-slate-400">{{ value }}</span>
        </template>

        <!-- Custom Body Cell: Status -->
        <template #body-cell-status="{ value }">
          <span
            class="desk-pill"
            :class="value === 'Paid' ? 'desk-pill-success' : 'desk-pill-warning'"
          >
            {{ value }}
          </span>
        </template>

        <!-- Custom Body Cell: Actions -->
        <template #body-cell-actions="{ props }">
          <div class="row items-center q-gutter-x-xs no-wrap justify-center">
            <button class="btn-table-action" @click.stop="viewDetails(props.row)">Voucher</button>
            <button
              class="btn-table-icon"
              @click.stop="printSettlementVoucher(props.row)"
              title="Print Official Settlement Voucher"
            >
              <q-icon name="print" size="14px" />
            </button>
            <button
              class="btn-table-icon"
              @click.stop="editSettlement(props.row)"
              title="Edit Settlement"
            >
              <q-icon name="edit" size="14px" />
            </button>
            <button
              class="btn-table-icon btn-table-icon--danger"
              @click.stop="confirmDeleteSettlement(props.row)"
              title="Delete Settlement"
            >
              <q-icon name="delete" size="14px" />
            </button>
          </div>
        </template>
      </DeskDataTable>

      <!-- Inner Loading Overlay on Settlements Register -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 12px;">
        <div class="column items-center">
          <q-spinner-dots size="48px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Reconciling Settlement Vouchers & Tax Deductions...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Querying attached carrier ledger & TDS Section 194C balance
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Create / Edit Settlement Desk Dialog matching Reference Design -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? `Edit Trip Settlement — ${editingItem?.settlementId}` : 'Generate Trip Settlement Voucher'"
      width="580px"
      :confirm-label="isEditing ? 'Update Settlement' : 'Generate Voucher'"
      cancel-label="Cancel"
      @confirm="saveSettlement"
      @cancel="showModal = false"
    >
      <DeskForm @submit="saveSettlement">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Attached Transporter / Owner" required shortcut="1">
              <DeskCombo
                v-model="form.party"
                :options="partyOptions"
                placeholder="Select or enter transporter..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Linked Trip Reference" required shortcut="2">
              <q-input
                v-model="form.tripRef"
                dense
                outlined
                placeholder="e.g. TR/240082"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Gross Agreed Freight (₹)" required shortcut="3">
              <DeskNumberInput
                v-model="form.grossAmt"
                placeholder="e.g. 45000"
                :step="500"
                :min="0"
                @update:model-value="calcTdsAndNet"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Trip Advance Deducted (₹)" shortcut="4">
              <DeskNumberInput
                v-model="form.advance"
                placeholder="e.g. 15000"
                :step="500"
                :min="0"
                @update:model-value="calcNet"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TDS Deducted (Sec 194C) (₹)" shortcut="5">
              <DeskNumberInput
                v-model="form.tds"
                placeholder="e.g. 900"
                :step="100"
                :min="0"
                @update:model-value="calcNet"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Shortage / Damage Penalty (₹)" shortcut="6">
              <DeskNumberInput
                v-model="form.shortage"
                placeholder="e.g. 0"
                :step="100"
                :min="0"
                @update:model-value="calcNet"
              />
            </DeskField>
          </div>

          <div class="col-12">
            <div class="p-3 bg-[#070c18] rounded-lg border border-cyan-500/30 flex justify-between items-center">
              <div>
                <div class="text-caption text-slate-400 uppercase tracking-wider font-mono">CALCULATED NET PAYABLE</div>
                <div class="text-xs text-grey-5 font-mono">Gross Freight &minus; Advance &minus; TDS &minus; Penalty</div>
              </div>
              <div class="text-2xl font-extrabold font-mono text-cyan-400">
                ₹{{ calculatedNet.toLocaleString('en-IN') }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Settlement Date" required shortcut="7">
              <DeskDateInput
                v-model="form.date"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Payment Settlement Status" required shortcut="8">
              <DeskCombo
                v-model="form.status"
                :options="['Pending', 'Paid']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Settlement Voucher Details Desk Dialog -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Settlement Voucher — ${selectedItem?.settlementId}`"
      width="600px"
      confirm-label="Print Settlement Voucher"
      cancel-label="Close"
      @confirm="printSettlementVoucher(selectedItem)"
      @cancel="showDetailsModal = false"
    >
      <div v-if="selectedItem" class="q-py-xs">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="text-caption text-grey-5">Settlement ID</div>
            <div class="text-h6 text-weight-bold text-white font-mono">{{ selectedItem.settlementId }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Linked Trip Reference</div>
            <div class="text-body1 font-mono text-cyan-4 font-bold">{{ selectedItem.tripRef }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Transporter / Fleet Owner</div>
            <div class="text-body1 text-white font-bold">{{ selectedItem.party }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Voucher Date</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedItem.date }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Gross Agreed Freight</div>
            <div class="text-body2 text-white font-mono">₹{{ Number(selectedItem.grossAmt).toLocaleString('en-IN') }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Trip Advance Deducted</div>
            <div class="text-body2 text-amber-400 font-mono font-bold">₹{{ Number(selectedItem.advance).toLocaleString('en-IN') }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">TDS Deducted (Sec 194C)</div>
            <div class="text-body2 text-slate-300 font-mono">₹{{ Number(selectedItem.tds).toLocaleString('en-IN') }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Shortage / Damage Penalty</div>
            <div class="text-body2 font-mono font-bold" :class="Number(selectedItem.shortage) > 0 ? 'text-rose-400' : 'text-grey-4'">
              ₹{{ Number(selectedItem.shortage).toLocaleString('en-IN') }}
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 bg-[#070c18] rounded-lg border border-cyan-500/30 flex justify-between items-center">
              <div>
                <div class="text-caption text-grey-4 uppercase font-mono">NET DISBURSED / PAYABLE AMOUNT</div>
                <div class="text-xs text-grey-5">Via NEFT / RTGS / Bank Transfer</div>
              </div>
              <div class="text-2xl font-mono font-bold text-cyan-400">
                ₹{{ Number(selectedItem.netPayable).toLocaleString('en-IN') }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-5 q-mb-xs">Settlement Status</div>
            <span
              class="desk-pill"
              :class="selectedItem.status === 'Paid' ? 'desk-pill-success' : 'desk-pill-warning'"
            >
              {{ selectedItem.status }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Desk Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Settlement"
      icon="warning"
      width="480px"
      confirm-label="Delete Settlement"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteSettlement"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Settlement Voucher
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.settlementId }}</span>
          for <strong class="text-white">{{ deletingItem?.party }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will revert all trip deduction accounts and cannot be undone.
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

export interface Settlement {
  id: string;
  settlementId: string;
  party: string;
  tripRef: string;
  grossAmt: number;
  advance: number;
  tds: number;
  shortage: number;
  netPayable: number;
  date: string;
  status: 'Paid' | 'Pending';
}

const $q = useQuasar();
const gridRef = ref<any>(null);
const isRefreshing = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const editingItem = ref<Settlement | null>(null);

const showDetailsModal = ref(false);
const selectedItem = ref<Settlement | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<Settlement | null>(null);

const statusFilter = ref('ALL');

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
];

const partyOptions = [
  'Kishore Transport',
  'Suresh Logistics',
  'Gujarat Express Fleet',
  'National Roadlines',
  'Shreeji Freightways',
  'Balaji Roadlines',
  'Om Logistics Fleet',
];

const defaultSettlements: Settlement[] = [
  {
    id: '1',
    settlementId: 'STL/240088',
    party: 'Kishore Transport',
    tripRef: 'TR/240078',
    grossAmt: 38000,
    advance: 12000,
    tds: 760,
    shortage: 0,
    netPayable: 25240,
    date: '2026-10-23',
    status: 'Paid',
  },
  {
    id: '2',
    settlementId: 'STL/240086',
    party: 'Suresh Logistics',
    tripRef: 'TR/240076',
    grossAmt: 55000,
    advance: 20000,
    tds: 1100,
    shortage: 2500,
    netPayable: 31400,
    date: '2026-10-22',
    status: 'Paid',
  },
  {
    id: '3',
    settlementId: 'STL/240085',
    party: 'Gujarat Express Fleet',
    tripRef: 'TR/240074',
    grossAmt: 42000,
    advance: 15000,
    tds: 840,
    shortage: 0,
    netPayable: 26160,
    date: '2026-10-24',
    status: 'Pending',
  },
  {
    id: '4',
    settlementId: 'STL/240084',
    party: 'National Roadlines',
    tripRef: 'TR/240071',
    grossAmt: 68000,
    advance: 25000,
    tds: 1360,
    shortage: 1200,
    netPayable: 40440,
    date: '2026-10-25',
    status: 'Pending',
  },
];

const settlements = ref<Settlement[]>([]);

function parseAmt(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.-]/g, '')) || 0;
}

onMounted(() => {
  const saved = localStorage.getItem('tms_settlements');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      settlements.value = parsed.map((item: any) => ({
        ...item,
        grossAmt: parseAmt(item.grossAmt),
        advance: parseAmt(item.advance),
        tds: parseAmt(item.tds),
        shortage: parseAmt(item.shortage),
        netPayable: parseAmt(item.netPayable),
      }));
    } catch {
      settlements.value = defaultSettlements;
    }
  } else {
    settlements.value = defaultSettlements;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_settlements', JSON.stringify(settlements.value));
}

const tableColumns: GridColumn[] = [
  { name: 'settlementId', label: 'SETTLEMENT ID', field: 'settlementId', align: 'left', sortable: true },
  { name: 'party', label: 'ATTACHED TRANSPORTER', field: 'party', align: 'left', sortable: true },
  { name: 'tripRef', label: 'TRIP REF', field: 'tripRef', align: 'left', sortable: true },
  { name: 'grossAmt', label: 'GROSS FREIGHT', field: 'grossAmt', align: 'right', sortable: true },
  { name: 'advance', label: 'ADVANCE', field: 'advance', align: 'right' },
  { name: 'tds', label: 'TDS (194C)', field: 'tds', align: 'right' },
  { name: 'shortage', label: 'SHORTAGE', field: 'shortage', align: 'right' },
  { name: 'netPayable', label: 'NET PAYABLE', field: 'netPayable', align: 'right', sortable: true },
  { name: 'date', label: 'DATE', field: 'date', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'center' },
];

const form = ref<Omit<Settlement, 'id' | 'settlementId' | 'netPayable'>>({
  party: 'Kishore Transport',
  tripRef: 'TR/240082',
  grossAmt: 45000,
  advance: 15000,
  tds: 900,
  shortage: 0,
  date: new Date().toISOString().slice(0, 10),
  status: 'Pending',
});

function calcTdsAndNet() {
  form.value.tds = Math.round((Number(form.value.grossAmt) || 0) * 0.02);
  calcNet();
}

function calcNet() {
  // auto updates reactive computed calculatedNet
}

const calculatedNet = computed(() => {
  const gross = Number(form.value.grossAmt) || 0;
  const adv = Number(form.value.advance) || 0;
  const tds = Number(form.value.tds) || 0;
  const pen = Number(form.value.shortage) || 0;
  return Math.max(0, gross - adv - tds - pen);
});

const filteredSettlements = computed(() => {
  return settlements.value.filter((item) => {
    return statusFilter.value === 'ALL' || item.status === statusFilter.value;
  });
});

const paidCount = computed(() => settlements.value.filter((s) => s.status === 'Paid').length);
const pendingCount = computed(() => settlements.value.filter((s) => s.status === 'Pending').length);

const formattedSettledAmount = computed(() => {
  const sum = settlements.value
    .filter((s) => s.status === 'Paid')
    .reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString('en-IN');
});

const formattedTdsTotal = computed(() => {
  const sum = settlements.value.reduce((acc, curr) => acc + (curr.tds || 0), 0);
  return sum.toLocaleString('en-IN');
});

const formattedNetDisbursed = computed(() => {
  const sum = settlements.value.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(2) + 'L';
  }
  return sum.toLocaleString('en-IN');
});

function onRefresh() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Settlements Register Refreshed',
      caption: 'Trip settlement vouchers, TDS (194C) and payables synchronized.',
      position: 'top-right',
      timeout: 1600,
    });
  }, 500);
}

function openAddModal() {
  isEditing.value = false;
  editingItem.value = null;
  form.value = {
    party: 'Kishore Transport',
    tripRef: `TR/2400${80 + settlements.value.length}`,
    grossAmt: 48000,
    advance: 15000,
    tds: 960,
    shortage: 0,
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending',
  };
  showModal.value = true;
}

function editSettlement(item: Settlement) {
  isEditing.value = true;
  editingItem.value = item;
  form.value = {
    party: item.party,
    tripRef: item.tripRef,
    grossAmt: item.grossAmt,
    advance: item.advance,
    tds: item.tds,
    shortage: item.shortage,
    date: item.date,
    status: item.status,
  };
  showModal.value = true;
}

function saveSettlement() {
  if (!form.value.party || !form.value.tripRef || !form.value.grossAmt) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter transporter party, trip reference, and gross freight.',
      position: 'top-right',
    });
    return;
  }

  const net = calculatedNet.value;

  if (isEditing.value && editingItem.value) {
    const idx = settlements.value.findIndex((s) => s.id === editingItem.value!.id);
    if (idx !== -1) {
      settlements.value[idx] = {
        ...settlements.value[idx],
        party: form.value.party,
        tripRef: form.value.tripRef.toUpperCase(),
        grossAmt: Number(form.value.grossAmt),
        advance: Number(form.value.advance) || 0,
        tds: Number(form.value.tds) || 0,
        shortage: Number(form.value.shortage) || 0,
        netPayable: net,
        date: form.value.date,
        status: form.value.status,
      };
      persist();
      $q.notify({
        type: 'positive',
        message: 'Settlement Updated',
        caption: `Settlement voucher ${editingItem.value.settlementId} successfully updated.`,
        position: 'top-right',
      });
    }
  } else {
    const num = 240089 + settlements.value.length;
    const newEntry: Settlement = {
      id: String(Date.now()),
      settlementId: `STL/${num}`,
      party: form.value.party,
      tripRef: form.value.tripRef.toUpperCase(),
      grossAmt: Number(form.value.grossAmt),
      advance: Number(form.value.advance) || 0,
      tds: Number(form.value.tds) || 0,
      shortage: Number(form.value.shortage) || 0,
      netPayable: net,
      date: form.value.date,
      status: form.value.status,
    };
    settlements.value.unshift(newEntry);
    persist();
    $q.notify({
      type: 'positive',
      message: 'Voucher Created',
      caption: `New settlement ${newEntry.settlementId} generated.`,
      position: 'top-right',
    });
  }

  showModal.value = false;
}

function viewDetails(item: Settlement) {
  selectedItem.value = item;
  showDetailsModal.value = true;
}

function confirmDeleteSettlement(item: Settlement) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteSettlement() {
  if (!deletingItem.value) return;
  settlements.value = settlements.value.filter((s) => s.id !== deletingItem.value!.id);
  persist();
  $q.notify({
    type: 'negative',
    message: 'Settlement Deleted',
    caption: `Voucher ${deletingItem.value.settlementId} has been removed.`,
    position: 'top-right',
  });
  showDeleteDialog.value = false;
  deletingItem.value = null;
}

function printSettlementVoucher(item: Settlement | null) {
  if (!item) return;
  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    $q.notify({
      type: 'warning',
      message: 'Popup Blocked',
      caption: 'Please allow popups to print official settlement voucher.',
      position: 'top-right',
    });
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Settlement Voucher — ${item.settlementId}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 20px;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 800;
      color: #0891b2;
      letter-spacing: 0.5px;
    }
    .company-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
    }
    .doc-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      text-align: right;
    }
    .voucher-no {
      font-size: 14px;
      font-weight: 700;
      color: #0891b2;
      font-family: monospace;
      text-align: right;
      margin-top: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .info-val {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }
    .calc-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .calc-table th {
      background: #0891b2;
      color: #ffffff;
      font-size: 11px;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }
    .calc-table td {
      padding: 11px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .calc-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .net-box {
      background: #ecfeff;
      border: 2px solid #0891b2;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .net-title {
      font-size: 13px;
      font-weight: 700;
      color: #0e7490;
      text-transform: uppercase;
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
      gap: 24px;
      margin-top: 40px;
    }
    .sign-box {
      text-align: center;
    }
    .sign-line {
      border-top: 1px dashed #64748b;
      margin-bottom: 6px;
    }
    .sign-label {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <div class="company-title">APEX GLOBAL LOGISTICS LTD</div>
        <div class="company-sub">Fleet Operations & Transport Settlements Division &bull; GSTIN: 24AABCA1234F1Z8</div>
        <div class="company-sub">Transporter Attached Payout & Advance Reconciliation</div>
      </td>
      <td style="text-align: right; vertical-align: top;">
        <div class="doc-title">TRIP SETTLEMENT VOUCHER</div>
        <div class="voucher-no">${item.settlementId}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Date: ${item.date}</div>
      </td>
    </tr>
  </table>

  <div class="info-grid">
    <div>
      <div class="info-label">Attached Transporter / Owner</div>
      <div class="info-val">${item.party}</div>
    </div>
    <div>
      <div class="info-label">Linked Trip Reference</div>
      <div class="info-val" style="font-family: monospace; color: #0891b2;">${item.tripRef}</div>
    </div>
    <div>
      <div class="info-label">Payment Settlement Status</div>
      <div class="info-val" style="color: ${item.status === 'Paid' ? '#16a34a' : '#d97706'};">${item.status}</div>
    </div>
    <div>
      <div class="info-label">Payment Mode</div>
      <div class="info-val">NEFT / RTGS Transfer</div>
    </div>
  </div>

  <table class="calc-table">
    <thead>
      <tr>
        <th>Description / Ledger Head</th>
        <th style="text-align: right;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Gross Agreed Freight</strong> for Trip ${item.tripRef}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700;">₹${Number(item.grossAmt).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="color: #b45309;">Less: Trip Advance Disbursed to Driver / Owner</td>
        <td style="text-align: right; font-family: monospace; color: #b45309;">&minus; ₹${Number(item.advance).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="color: #64748b;">Less: TDS Deducted under Section 194C</td>
        <td style="text-align: right; font-family: monospace; color: #64748b;">&minus; ₹${Number(item.tds).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="color: ${Number(item.shortage) > 0 ? '#b91c1c' : '#64748b'};">Less: Transit Shortage / Damage Penalty Deductions</td>
        <td style="text-align: right; font-family: monospace; color: ${Number(item.shortage) > 0 ? '#b91c1c' : '#64748b'};">&minus; ₹${Number(item.shortage).toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="net-box">
    <div>
      <div class="net-title">NET DISBURSED / FINAL PAYABLE AMOUNT</div>
      <div style="font-size: 11px; color: #155e75; margin-top: 2px;">Gross Freight &minus; Advance &minus; TDS &minus; Shortage Penalties</div>
    </div>
    <div class="net-val">₹${Number(item.netPayable).toLocaleString('en-IN')}</div>
  </div>

  <div class="sign-grid">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Prepared By (Accounts)</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Verified By (Operations Mgr)</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Approved By (Authorized Signatory)</div>
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

function exportSettlementsCsv() {
  exportToCsv(
    'trip_settlements_register',
    [
      { label: 'Settlement ID', field: 'settlementId' },
      { label: 'Transporter Party', field: 'party' },
      { label: 'Trip Reference', field: 'tripRef' },
      { label: 'Gross Freight', field: 'grossAmt' },
      { label: 'Trip Advance', field: 'advance' },
      { label: 'TDS (194C)', field: 'tds' },
      { label: 'Shortage Penalty', field: 'shortage' },
      { label: 'Net Payable', field: 'netPayable' },
      { label: 'Date', field: 'date' },
      { label: 'Status', field: 'status' },
    ],
    filteredSettlements.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${filteredSettlements.value.length} settlements exported to CSV.`,
    position: 'top-right',
  });
}

function exportSettlementsPdf() {
  exportToPdf({
    title: 'Trip Settlements & Payouts Register',
    subtitle: `Total Settlements: ${filteredSettlements.value.length} records`,
    columns: [
      { label: 'Settlement ID', field: 'settlementId' },
      { label: 'Transporter', field: 'party' },
      { label: 'Trip Ref', field: 'tripRef' },
      { label: 'Gross Amt', field: 'grossAmt', align: 'right' },
      { label: 'Advance', field: 'advance', align: 'right' },
      { label: 'TDS', field: 'tds', align: 'right' },
      { label: 'Net Payable', field: 'netPayable', align: 'right' },
      { label: 'Date', field: 'date' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredSettlements.value,
  });
}
</script>

<style scoped>
.settlements-page {
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
</style>
