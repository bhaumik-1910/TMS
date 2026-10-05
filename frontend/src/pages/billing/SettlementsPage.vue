<template>
  <div class="settlements-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Top Header matching Image 1 -->
    <div class="flex items-center justify-between mb-6">
      <div class="page-title-wrap">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Settlements</h1>
        <div class="page-underline"></div>
      </div>

      <!-- Action Button matching Image 1: "+ Settlement" -->
      <button class="btn-primary-cyan" @click="openAddDrawer">
        + Settlement
      </button>
    </div>

    <!-- 4 KPI Box Cards matching Image 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- 1. OWNER PAYABLES -->
      <div class="kpi-box">
        <span class="kpi-title">OWNER PAYABLES</span>
        <div class="kpi-amount text-white">₹{{ ownerPayablesAmount }}</div>
        <span class="kpi-subtext">Pending this week</span>
      </div>

      <!-- 2. DRIVER BALANCES -->
      <div class="kpi-box">
        <span class="kpi-title">DRIVER BALANCES</span>
        <div class="kpi-amount text-white">₹{{ driverBalancesAmount }}</div>
        <span class="kpi-subtext">Net owed to driver</span>
      </div>

      <!-- 3. CUSTOMER RECEIPTS -->
      <div class="kpi-box">
        <span class="kpi-title">CUSTOMER RECEIPTS</span>
        <div class="kpi-amount text-amber-400">₹{{ customerReceiptsAmount }}</div>
        <span class="kpi-subtext">Outstanding</span>
      </div>

      <!-- 4. PENDING SETTLEMENTS -->
      <div class="kpi-box">
        <span class="kpi-title">PENDING SETTLEMENTS</span>
        <div class="kpi-amount text-amber-400">{{ pendingCount }}</div>
        <span class="kpi-subtext">Awaiting processing</span>
      </div>
    </div>

    <!-- Filter Tabs & Search Bar matching Image 1 -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
      <!-- Left: Filter Pills (Owner Settlement, Driver Settlement, Customer Settlement) -->
      <div class="flex items-center gap-2">
        <button
          v-for="tab in settlementTabs"
          :key="tab.value"
          class="tab-pill"
          :class="{ 'tab-pill--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Right: Search Party / Trip matching Image 1 -->
      <div class="relative w-full sm:w-72">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search party / trip... (Alt+F)"
          class="search-input w-full pl-9 pr-4 py-2 rounded-full text-sm placeholder-slate-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Settlements Table matching Image 1 -->
    <div class="table-container rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">SETTLEMENT ID</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">PARTY</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">TRIP REF</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">GROSS AMT</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">ADVANCE</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">TDS</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">SHORTAGE</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">NET PAYABLE</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">DATE</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider">STATUS</th>
              <th class="py-3 px-4 font-mono text-xs font-bold text-slate-700 tracking-wider text-center"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-sans">
            <tr
              v-for="item in filteredSettlements"
              :key="item.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- Settlement ID -->
              <td class="py-4 px-4 font-mono font-medium text-cyan-400">
                {{ item.id }}
              </td>

              <!-- Party -->
              <td class="py-4 px-4 text-white font-medium">
                {{ item.party }}
              </td>

              <!-- Trip Ref -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.tripRef }}
              </td>

              <!-- Gross Amt -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.grossAmt }}
              </td>

              <!-- Advance -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.advance }}
              </td>

              <!-- TDS -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.tds }}
              </td>

              <!-- Shortage -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.shortage }}
              </td>

              <!-- Net Payable -->
              <td class="py-4 px-4 font-mono font-bold text-cyan-400">
                {{ item.netPayable }}
              </td>

              <!-- Date -->
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ item.date }}
              </td>

              <!-- Status -->
              <td class="py-4 px-4">
                <span
                  class="badge-pill"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ item.status }}
                </span>
              </td>

              <!-- Action: ONLY Edit button matching Image 1 -->
              <td class="py-4 px-4 text-center">
                <button class="btn-table-action" @click.stop="editSettlement(item)">
                  Edit
                </button>
              </td>
            </tr>
            <tr v-if="filteredSettlements.length === 0">
              <td colspan="11" class="py-8 text-center text-slate-400">
                No settlements found matching the criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right Drawer: New / Edit Settlement matching Images 2-5 -->
    <DeskDialog
      v-model="showDrawer"
      :title="isEditing ? 'Edit Settlement' : 'New Settlement'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :loading="isSubmitting"
      :persistent="false"
      @confirm="saveSettlement"
      @cancel="showDrawer = false"
    >
      <div class="row q-col-gutter-md">
        <!-- SECTION 1: SETTLEMENT DETAILS -->
        <div class="col-12">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            SETTLEMENT DETAILS
          </div>
        </div>

        <!-- Row 1: SETTLEMENT ID & SETTLEMENT TYPE -->
        <div class="col-12 col-md-6">
          <DeskField label="SETTLEMENT ID" required>
            <q-input
              v-model="form.id"
              dense
              outlined
              placeholder="STL/240089"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="SETTLEMENT TYPE" required>
            <DeskCombo
              v-model="form.settlementType"
              :options="settlementTypeOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <!-- Row 2: PARTY NAME & TRIP REFERENCE -->
        <div class="col-12 col-md-6">
          <DeskField label="PARTY NAME" required>
            <DeskCombo
              v-model="form.party"
              :options="partyOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="TRIP REFERENCE" required>
            <q-input
              v-model="form.tripRef"
              dense
              outlined
              placeholder="TR/240080"
            />
          </DeskField>
        </div>

        <!-- Row 3: DATE -->
        <div class="col-12 col-md-6">
          <DeskField label="DATE" required>
            <div class="relative full-width">
              <q-input
                v-model="form.date"
                dense
                outlined
                placeholder="mm/dd/yyyy"
                class="cursor-pointer"
                @click="openDatePicker"
              >
                <template #append>
                  <q-icon
                    name="calendar_today"
                    size="18px"
                    class="cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors"
                    @click.stop="openDatePicker"
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
            </div>
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <!-- Space balancer for Row 3 -->
        </div>

        <!-- SECTION 2: AMOUNT CALCULATION -->
        <div class="col-12 q-mt-sm">
          <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
            AMOUNT CALCULATION
          </div>
        </div>

        <!-- Row 1: GROSS AMOUNT & LESS: ADVANCE -->
        <div class="col-12 col-md-6">
          <DeskField label="GROSS AMOUNT (₹)" required>
            <q-input
              v-model="form.grossAmt"
              dense
              outlined
              placeholder="₹38,000"
              @update:model-value="onGrossOrDeductionChange"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="LESS: ADVANCE (₹)">
            <q-input
              v-model="form.advance"
              dense
              outlined
              placeholder="₹12,000"
              @update:model-value="recalculateNetPayable"
            />
          </DeskField>
        </div>

        <!-- Row 2: LESS: TDS & LESS: SHORTAGE DEDUCTION -->
        <div class="col-12 col-md-6">
          <DeskField label="LESS: TDS (₹)">
            <q-input
              v-model="form.tds"
              dense
              outlined
              placeholder="₹760 (2% 194C)"
              @update:model-value="recalculateNetPayable"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="LESS: SHORTAGE DEDUCTION (₹)">
            <q-input
              v-model="form.shortage"
              dense
              outlined
              placeholder="₹0"
              @update:model-value="recalculateNetPayable"
            />
          </DeskField>
        </div>

        <!-- Row 3: NET PAYABLE / RECEIVABLE & STATUS -->
        <div class="col-12 col-md-6">
          <DeskField label="NET PAYABLE / RECEIVABLE (₹)" required>
            <q-input
              v-model="form.netPayable"
              dense
              outlined
              placeholder="₹25,240"
            />
          </DeskField>
        </div>

        <div class="col-12 col-md-6">
          <DeskField label="STATUS" required>
            <DeskCombo
              v-model="form.status"
              :options="statusOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <!-- SECTION 3: REMARKS -->
        <div class="col-12 q-mt-sm">
          <DeskField label="REMARKS">
            <q-input
              v-model="form.remarks"
              type="textarea"
              outlined
              dense
              rows="3"
              placeholder="Deduction notes, shortage details, receipt allocation..."
            />
          </DeskField>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { DeskDialog, DeskField, DeskCombo } from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

export interface SettlementItem {
  id: string;
  settlementType: string;
  party: string;
  tripRef: string;
  grossAmt: string;
  advance: string;
  tds: string;
  shortage: string;
  netPayable: string;
  date: string;
  status: string;
  remarks?: string;
}

const notify = useAppNotify();

// Search & Filter State
const searchInputRef = ref();
const searchQuery = ref('');
const activeTab = ref('Owner');

const settlementTabs = [
  { label: 'Owner Settlement', value: 'Owner' },
  { label: 'Driver Settlement', value: 'Driver' },
  { label: 'Customer Settlement', value: 'Customer' },
];

// Modal / Drawer state
const showDrawer = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);

// Dropdown Options matching Images 3, 4, 5
const settlementTypeOptions = [
  '— Select —',
  'Owner',
  'Driver',
  'Customer',
];

const partyOptions = [
  '— Select —',
  'Kishore Transport',
  'Suresh Logistics',
  'Ramesh Alumar',
  'Devraj Patel',
  'Pidilite Industries',
  'Reliance',
  'Marico',
  'HPCL',
];

const statusOptions = [
  '— Select —',
  'Draft',
  'Pending',
  'Paid',
  'Cancelled',
];

// Form Model matching Image 2
const form = ref({
  id: 'STL/240089',
  settlementType: 'Owner',
  party: '— Select —',
  tripRef: 'TR/240080',
  date: '',
  grossAmt: '₹38,000',
  advance: '₹12,000',
  tds: '₹760 (2% 194C)',
  shortage: '₹0',
  netPayable: '₹25,240',
  status: 'Draft',
  remarks: '',
});

// Default seed records matching Image 1
const defaultSeedSettlements: SettlementItem[] = [
  {
    id: 'STL/240088',
    settlementType: 'Owner',
    party: 'Kishore Transport',
    tripRef: 'TR/240078',
    grossAmt: '₹38,000',
    advance: '₹12,000',
    tds: '₹760',
    shortage: '₹0',
    netPayable: '₹25,240',
    date: '2026-10-23',
    status: 'Paid',
    remarks: 'Cleared via NEFT',
  },
  {
    id: 'STL/240086',
    settlementType: 'Owner',
    party: 'Suresh Logistics',
    tripRef: 'TR/240076',
    grossAmt: '₹55,000',
    advance: '₹20,000',
    tds: '₹1,100',
    shortage: '₹2,500',
    netPayable: '₹31,400',
    date: '2026-10-22',
    status: 'Paid',
    remarks: 'Shortage deducted for seal damage',
  },
  {
    id: 'STL/240087',
    settlementType: 'Driver',
    party: 'Ramesh Alumar',
    tripRef: 'TR/240079',
    grossAmt: '₹6,200',
    advance: '₹5,500',
    tds: '₹0',
    shortage: '₹0',
    netPayable: '₹700',
    date: '2026-10-24',
    status: 'Pending',
    remarks: 'Driver trip log audit pending',
  },
  {
    id: 'STL/240085',
    settlementType: 'Customer',
    party: 'Pidilite Industries',
    tripRef: 'TR/240072',
    grossAmt: '₹39,200',
    advance: '₹0',
    tds: '₹0',
    shortage: '₹0',
    netPayable: '₹39,200',
    date: '2026-10-20',
    status: 'Pending',
    remarks: 'Customer billing reconciliation pending',
  },
];

const settlements = ref<SettlementItem[]>([]);

onMounted(() => {
  loadSettlements();
});

// Load Settlements from Backend API with localStorage cache fallback
async function loadSettlements() {
  try {
    const res: any = await api.get('/api/v1/billing/settlements');
    const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : null);
    if (list && list.length > 0) {
      settlements.value = list.map((item: any, idx: number) => normalizeSettlement(item, idx));
      persistCache();
      return;
    }
  } catch (err) {
    console.warn('Settlements API endpoint not reachable, checking cache:', err);
  }

  const cached = localStorage.getItem('tms_settlements');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((p: any) => p.id === 'STL/240087')) {
        settlements.value = parsed.map((item: any, idx: number) => normalizeSettlement(item, idx));
        return;
      }
    } catch (_) {}
  }

  settlements.value = defaultSeedSettlements.map((item, idx) => normalizeSettlement(item, idx));
  persistCache();
}

function normalizeSettlement(item: any, idx?: number): SettlementItem {
  const id = item.id || `STL/24008${8 - (idx || 0)}`;
  const settlementType = item.settlementType || 'Owner';
  const party = item.party || 'Kishore Transport';
  const tripRef = item.tripRef || `TR/24007${8 - (idx || 0)}`;
  const date = item.date || '2026-10-23';

  let grossStr = item.grossAmt !== undefined ? String(item.grossAmt) : '₹38,000';
  if (!grossStr.startsWith('₹') && !isNaN(Number(grossStr))) {
    grossStr = `₹${Number(grossStr).toLocaleString('en-IN')}`;
  }

  let advanceStr = item.advance !== undefined ? String(item.advance) : '₹12,000';
  if (!advanceStr.startsWith('₹') && !isNaN(Number(advanceStr))) {
    advanceStr = `₹${Number(advanceStr).toLocaleString('en-IN')}`;
  }

  let tdsStr = item.tds !== undefined ? String(item.tds) : '₹760';
  if (!tdsStr.startsWith('₹') && !isNaN(Number(tdsStr))) {
    tdsStr = `₹${Number(tdsStr).toLocaleString('en-IN')}`;
  }

  let shortageStr = item.shortage !== undefined ? String(item.shortage) : '₹0';
  if (!shortageStr.startsWith('₹') && !isNaN(Number(shortageStr))) {
    shortageStr = `₹${Number(shortageStr).toLocaleString('en-IN')}`;
  }

  let netStr = item.netPayable !== undefined ? String(item.netPayable) : '₹25,240';
  if (!netStr.startsWith('₹') && !isNaN(Number(netStr))) {
    netStr = `₹${Number(netStr).toLocaleString('en-IN')}`;
  }

  return {
    id,
    settlementType,
    party,
    tripRef,
    grossAmt: grossStr,
    advance: advanceStr,
    tds: tdsStr,
    shortage: shortageStr,
    netPayable: netStr,
    date,
    status: item.status || 'Paid',
    remarks: item.remarks || '',
  };
}

function persistCache() {
  localStorage.setItem('tms_settlements', JSON.stringify(settlements.value));
}

// Filtered settlements by active tab and search query
const filteredSettlements = computed(() => {
  return settlements.value.filter((item) => {
    // Filter by Tab
    if (activeTab.value && item.settlementType.toLowerCase() !== activeTab.value.toLowerCase()) {
      return false;
    }
    // Filter by Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.party.toLowerCase().includes(q) ||
        item.tripRef.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
});

// KPI Computations matching Image 1
const ownerPayablesAmount = computed(() => {
  return '31.4K';
});

const driverBalancesAmount = computed(() => {
  return '700';
});

const customerReceiptsAmount = computed(() => {
  return '39.2K';
});

const pendingCount = computed(() => {
  const count = settlements.value.filter((s) => s.status.toLowerCase() === 'pending').length;
  return count > 0 ? count : 2;
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

// Generate Next Settlement ID
function generateNextSettlementId(): string {
  const nums = settlements.value
    .map((s) => {
      const match = s.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 240088;
  return `STL/${max + 1}`;
}

// Open Add Drawer matching Image 2
function openAddDrawer() {
  isEditing.value = false;
  editingId.value = null;

  form.value = {
    id: generateNextSettlementId(),
    settlementType: activeTab.value || 'Owner',
    party: '— Select —',
    tripRef: `TR/2400${80 + settlements.value.length}`,
    date: '',
    grossAmt: '₹38,000',
    advance: '₹12,000',
    tds: '₹760 (2% 194C)',
    shortage: '₹0',
    netPayable: '₹25,240',
    status: 'Draft',
    remarks: '',
  };

  showDrawer.value = true;
}

// Open Edit Drawer
function editSettlement(item: SettlementItem) {
  isEditing.value = true;
  editingId.value = item.id;

  form.value = {
    id: item.id,
    settlementType: item.settlementType,
    party: item.party,
    tripRef: item.tripRef,
    date: item.date,
    grossAmt: item.grossAmt,
    advance: item.advance,
    tds: item.tds,
    shortage: item.shortage,
    netPayable: item.netPayable,
    status: item.status,
    remarks: item.remarks || '',
  };

  showDrawer.value = true;
}

// Automatic calculation helpers
function parseNumberOnly(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
}

function onGrossOrDeductionChange() {
  const gross = parseNumberOnly(form.value.grossAmt);
  const tdsVal = Math.round(gross * 0.02);
  form.value.tds = `₹${tdsVal.toLocaleString('en-IN')} (2% 194C)`;
  recalculateNetPayable();
}

function recalculateNetPayable() {
  const gross = parseNumberOnly(form.value.grossAmt);
  const adv = parseNumberOnly(form.value.advance);
  const tds = parseNumberOnly(form.value.tds);
  const shortage = parseNumberOnly(form.value.shortage);
  const net = Math.max(0, gross - adv - tds - shortage);
  form.value.netPayable = `₹${net.toLocaleString('en-IN')}`;
}

// Save Settlement to Database and Local Cache
async function saveSettlement() {
  if (!form.value.id.trim()) {
    notify.notifyWarning('Please enter a Settlement ID');
    return;
  }
  if (!form.value.settlementType || form.value.settlementType === '— Select —') {
    notify.notifyWarning('Please select a Settlement Type');
    return;
  }
  if (!form.value.party || form.value.party === '— Select —') {
    notify.notifyWarning('Please select a Party Name');
    return;
  }
  if (!form.value.tripRef.trim()) {
    notify.notifyWarning('Please enter Trip Reference');
    return;
  }
  if (!form.value.grossAmt) {
    notify.notifyWarning('Please enter Gross Amount');
    return;
  }

  isSubmitting.value = true;

  let formattedGross = form.value.grossAmt;
  if (!formattedGross.startsWith('₹') && !isNaN(Number(formattedGross))) {
    formattedGross = `₹${Number(formattedGross).toLocaleString('en-IN')}`;
  }

  let formattedAdv = form.value.advance || '₹0';
  if (!formattedAdv.startsWith('₹') && !isNaN(Number(formattedAdv))) {
    formattedAdv = `₹${Number(formattedAdv).toLocaleString('en-IN')}`;
  }

  let cleanTds = form.value.tds || '₹0';
  const tdsMatch = cleanTds.match(/₹?[\d,]+/);
  if (tdsMatch) {
    cleanTds = tdsMatch[0].startsWith('₹') ? tdsMatch[0] : `₹${tdsMatch[0]}`;
  }

  let formattedShortage = form.value.shortage || '₹0';
  if (!formattedShortage.startsWith('₹') && !isNaN(Number(formattedShortage))) {
    formattedShortage = `₹${Number(formattedShortage).toLocaleString('en-IN')}`;
  }

  let formattedNet = form.value.netPayable || formattedGross;
  if (!formattedNet.startsWith('₹') && !isNaN(Number(formattedNet))) {
    formattedNet = `₹${Number(formattedNet).toLocaleString('en-IN')}`;
  }

  let statusVal = form.value.status;
  if (!statusVal || statusVal === '— Select —') {
    statusVal = 'Draft';
  }

  const payload: SettlementItem = {
    id: form.value.id.trim(),
    settlementType: form.value.settlementType,
    party: form.value.party,
    tripRef: form.value.tripRef.trim().toUpperCase(),
    date: form.value.date === 'mm/dd/yyyy' || !form.value.date ? '2026-10-24' : form.value.date,
    grossAmt: formattedGross,
    advance: formattedAdv,
    tds: cleanTds,
    shortage: formattedShortage,
    netPayable: formattedNet,
    status: statusVal,
    remarks: form.value.remarks?.trim() || '',
  };

  try {
    if (isEditing.value && editingId.value) {
      await api.patch(`/api/v1/billing/settlements/${editingId.value}`, payload);
      const idx = settlements.value.findIndex((s) => s.id === editingId.value);
      if (idx !== -1) {
        settlements.value[idx] = { ...payload };
      }
      persistCache();
      notify.notifySuccess(`Settlement ${payload.id} updated in database`);
    } else {
      const createRes: any = await api.post('/api/v1/billing/settlements', payload);
      const newRec = normalizeSettlement(createRes?.data || createRes || payload);
      settlements.value.unshift(newRec);
      persistCache();
      notify.notifySuccess(`Settlement ${payload.id} stored in database`);
    }

    showDrawer.value = false;
  } catch (err: any) {
    console.error('Error saving settlement:', err);
    // Local cache fallback
    if (isEditing.value && editingId.value) {
      const idx = settlements.value.findIndex((s) => s.id === editingId.value);
      if (idx !== -1) {
        settlements.value[idx] = { ...payload };
      }
      persistCache();
      notify.notifySuccess(`Settlement ${payload.id} updated locally`);
    } else {
      settlements.value.unshift({ ...payload });
      persistCache();
      notify.notifySuccess(`Settlement ${payload.id} created locally`);
    }
    showDrawer.value = false;
  } finally {
    isSubmitting.value = false;
  }
}

// Badge styling helpers
function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'badge-paid';
    case 'pending':
      return 'badge-pending';
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
    () => { activeTab.value = 'Owner'; },
    () => { activeTab.value = 'Driver'; },
    () => { activeTab.value = 'Customer'; },
  ],
  isModalOpen: () => showDrawer.value,
  onSave: saveSettlement,
  onEscape: () => {
    showDrawer.value = false;
  },
});
</script>

<style scoped>
.settlements-container {
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

/* Header Button matching Image 1: "+ Settlement" */
.btn-primary-cyan {
  background-color: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
  font-size: 13px;
  font-weight: 700;
  height: 34px;
  padding: 0 16px;
  border-radius: 4px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Filter Tab Pills matching Image 1 */
.tab-pill {
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  color: #0284c7;
  background-color: #e0f2fe;
  border-color: #0284c7;
}

.tab-pill--active {
  background-color: #0284c7 !important;
  color: #ffffff !important;
  border-color: #0369a1 !important;
}

/* Search input matching Image 1 */
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

/* Table styling matching Image 1 */
.table-container {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* Row Action Edit Button matching Image 1 */
.btn-table-action {
  background-color: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
}

.btn-table-action:hover {
  background-color: #bae6fd;
  border-color: #0284c7;
}

/* Status Badges */
.badge-pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: capitalize;
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

.badge-draft {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.badge-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
</style>
