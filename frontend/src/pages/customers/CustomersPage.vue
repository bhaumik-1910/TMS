<template>
  <div class="party-master-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white relative-position inline-block q-pb-xs">
          Party Master
          <div class="header-underline"></div>
        </div>
      </div>
      <div class="row items-center q-gutter-x-sm no-wrap">
        <button type="button" class="btn-hdr-add" @click="openAddParty">
          + Party
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 q-mb-md">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL PARTIES</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ parties.length }}</div>
        <div class="text-xs text-slate-400 font-mono">Active {{ activeCount }}</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">CUSTOMERS</div>
        <div class="text-3xl font-extrabold font-mono text-sky-400 my-1">{{ customerCount }}</div>
        <div class="text-xs text-slate-400 font-mono">Consignors / Consignees</div>
        <div class="accent-bar bg-sky-400"></div>
      </div>
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">VENDORS</div>
        <div class="text-3xl font-extrabold font-mono text-violet-400 my-1">{{ vendorCount }}</div>
        <div class="text-xs text-slate-400 font-mono">Fuel / Tyre / Service</div>
        <div class="accent-bar bg-violet-400"></div>
      </div>
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">CREDIT EXPOSED</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ creditCount }}</div>
        <div class="text-xs text-amber-300 font-mono">With credit limits</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Sub-type filter pills -->
    <div class="filter-pills-row q-mb-sm">
      <button
        v-for="sub in subTypes"
        :key="sub"
        type="button"
        class="filter-pill"
        :class="{ 'filter-pill--active': typeFilter === sub }"
        @click="typeFilter = sub"
      >
        {{ sub }}
      </button>
    </div>

    <!-- DeskDataTable with keyboard navigation -->
    <div class="relative">
      <DeskDataTable
        ref="gridRef"
        title=""
        :rows="filteredParties"
        :columns="tableColumns"
        row-key="id"
        selection-mode="none"
        :loading="isRefreshing"
        :allow-create="false"
        :allow-export="true"
        :allow-refresh="false"
        :allow-delete="true"
        @edit="editParty"
        @delete="confirmDeleteParty"
        @row-dblclick="editParty"
      >
        <!-- Top Filters -->
        <template #top-filters>
          <DeskCombo
            ref="branchComboRef"
            v-model="branchFilter"
            :options="branchFilterOptions"
            class="desk-filter-select"
            style="min-width: 150px;"
          />
          <DeskCombo
            ref="statusComboRef"
            v-model="statusFilter"
            :options="statusFilterOptions"
            class="desk-filter-select"
            style="min-width: 130px;"
          />
        </template>

        <!-- Add Party button in actions slot -->
        <template #top-actions>
          <q-btn
            unelevated
            dense
            color="cyan-8"
            text-color="white"
            size="sm"
            icon="add"
            label="Add Party"
            class="q-px-sm text-weight-bold"
            @click="openAddParty"
          >
            <q-tooltip>Add New Party (Alt+C)</q-tooltip>
          </q-btn>
        </template>

        <!-- Name cell -->
        <template #body-cell-name="{ props, value }">
          <span class="text-white font-semibold">
            {{ value || props?.row?.name }}
          </span>
        </template>

        <!-- Sub-type pill -->
        <template #body-cell-subType="{ props, value }">
          <span class="subtype-pill" :class="getSubtypeClass(value || props?.row?.subType)">
            {{ value || props?.row?.subType || '—' }}
          </span>
        </template>

        <!-- GSTIN -->
        <template #body-cell-gstin="{ props, value }">
          <span class="font-mono text-slate-300 text-xs">
            {{ value || props?.row?.gstin || '—' }}
          </span>
        </template>

        <!-- Credit Limit -->
        <template #body-cell-creditLimit="{ props, value }">
          <span class="font-mono font-bold text-white">
            {{ value || props?.row?.creditLimit || '—' }}
          </span>
        </template>

        <!-- Status -->
        <template #body-cell-status="{ props, value }">
          <span
            class="status-pill"
            :class="(value || props?.row?.status) === 'Active' ? 'status-active' : 'status-inactive'"
          >
            {{ value || props?.row?.status || 'Active' }}
          </span>
        </template>
      </DeskDataTable>

      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Refreshing Party Master..."
        subtitle="Syncing customers, vendors, stations & credit limits"
      />
    </div>

    <!-- Add / Edit Drawer -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? 'Edit Party' : 'Add Party'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveParty"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveParty">
        <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
          <!-- BASIC INFO -->
          <div class="col-12 section-label">BASIC INFO</div>

          <div class="col-12">
            <DeskField label="PARTY NAME *" required>
              <q-input
                ref="partyNameRef"
                v-model="newParty.name"
                dense outlined
                placeholder="Full legal name"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="SUB-TYPE *" required>
              <DeskCombo
                v-model="newParty.subType"
                :options="subTypeDropdownOptions"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="BRANCH *" required>
              <DeskCombo
                v-model="newParty.branch"
                :options="branchDropdownOptions"
                placeholder="— Select —"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="MOBILE">
              <q-input v-model="newParty.mobile" dense outlined placeholder="9XXXXXXXXX" />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="EMAIL">
              <q-input v-model="newParty.email" dense outlined placeholder="billing@company.com" />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS">
              <DeskCombo
                v-model="newParty.status"
                :options="statusDropdownOptions"
                placeholder="Active"
              />
            </DeskField>
          </div>

          <!-- TAX -->
          <div class="col-12 section-label q-mt-sm">TAX</div>

          <div class="col-12 col-md-6">
            <DeskField label="GSTIN">
              <q-input
                v-model="newParty.gstin"
                dense outlined
                placeholder="24AABCR1234M1Z5"
                input-class="uppercase font-mono"
                @update:model-value="newParty.gstin = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PAN">
              <q-input
                v-model="newParty.pan"
                dense outlined
                placeholder="AABCR1234M"
                input-class="uppercase font-mono"
                @update:model-value="newParty.pan = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TDS SECTION">
              <DeskCombo
                v-model="newParty.tdsSection"
                :options="tdsSectionOptions"
                placeholder="194C"
              />
            </DeskField>
          </div>

          <!-- CREDIT -->
          <div class="col-12 section-label q-mt-sm">CREDIT</div>

          <div class="col-12 col-md-6">
            <DeskField label="CREDIT LIMIT (₹)">
              <q-input v-model="newParty.creditLimit" dense outlined placeholder="500000" />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CREDIT DAYS">
              <q-input v-model="newParty.creditDays" dense outlined placeholder="30" />
            </DeskField>
          </div>

          <!-- BANK DETAILS -->
          <div class="col-12 section-label q-mt-sm">BANK DETAILS</div>

          <div class="col-12 col-md-6">
            <DeskField label="BANK NAME">
              <q-input v-model="newParty.bankName" dense outlined placeholder="HDFC Bank" />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ACCOUNT NO">
              <q-input v-model="newParty.accountNo" dense outlined placeholder="XXXXXXXXXXXXXX" class="font-mono" />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="IFSC CODE">
              <q-input
                v-model="newParty.ifscCode"
                dense outlined
                placeholder="HDFC0001234"
                input-class="uppercase font-mono"
                @update:model-value="newParty.ifscCode = String($event || '').toUpperCase()"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Party"
      icon="warning"
      position="standard"
      width="460px"
      confirm-label="Delete Party"
      cancel-label="Cancel"
      @confirm="executeDeleteParty"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete party
          <span class="text-cyan-4 text-weight-bold">{{ deletingParty?.name }}</span>?
        </div>
        <div class="text-caption text-red-3">
          This will remove the party and all associated billing data from the database.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../api/client';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
import {
  DeskDataTable,
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
} from '../../framework';
import type { GridColumn } from '../../desk/grid/DeskDataTable.vue';

const $q = useQuasar();

// ─── State ────────────────────────────────────────────────────────────────────
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showAddModal = ref(false);
const showDeleteDialog = ref(false);
const deletingParty = ref<Party | null>(null);
const isRefreshing = ref(false);

// ─── Refs ──────────────────────────────────────────────────────────────────────
const gridRef = ref<any>(null);
const partyNameRef = ref<any>(null);
const branchComboRef = ref<any>(null);
const statusComboRef = ref<any>(null);

// ─── Filter state ─────────────────────────────────────────────────────────────
const typeFilter = ref('All');
const branchFilter = ref('ALL');
const statusFilter = ref('ALL');

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Party {
  id: string;
  name: string;
  subType: string;
  branch: string;
  mobile?: string;
  email?: string;
  status: 'Active' | 'Inactive';
  gstin: string;
  pan?: string;
  tdsSection?: string;
  creditLimit: string;
  creditDays?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
}

// ─── Options ───────────────────────────────────────────────────────────────────
const subTypes = ['All', 'Customer', 'Fuel Station', 'Driver', 'Service Centre', 'Tyre Supplier', 'Vehicle Owner', 'Spare Supplier'];

const subTypeDropdownOptions = [
  { label: '— Select —', value: '— Select —' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Fuel Station', value: 'Fuel Station' },
  { label: 'Driver', value: 'Driver' },
  { label: 'Service Centre', value: 'Service Centre' },
  { label: 'Tyre Supplier', value: 'Tyre Supplier' },
  { label: 'Vehicle Owner', value: 'Vehicle Owner' },
  { label: 'Spare Supplier', value: 'Spare Supplier' },
];

const branchDropdownOptions = [
  { label: '— Select —', value: '— Select —' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
  { label: 'Surat', value: 'Surat' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Vadodara', value: 'Vadodara' },
  { label: 'Rajkot', value: 'Rajkot' },
  { label: 'Delhi', value: 'Delhi' },
];

const statusDropdownOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const tdsSectionOptions = [
  { label: '194C', value: '194C' },
  { label: '194I', value: '194I' },
  { label: '194J', value: '194J' },
  { label: 'None', value: 'None' },
];

const branchFilterOptions = [
  { label: 'All Branches', value: 'ALL' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
  { label: 'Surat', value: 'Surat' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Vadodara', value: 'Vadodara' },
  { label: 'Rajkot', value: 'Rajkot' },
  { label: 'Delhi', value: 'Delhi' },
];

const statusFilterOptions = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

// ─── Table Columns ─────────────────────────────────────────────────────────────
const tableColumns: GridColumn[] = [
  { name: 'name',        label: 'PARTY NAME',    field: 'name',        align: 'left', sortable: true },
  { name: 'subType',     label: 'TYPE',          field: 'subType',     align: 'left', sortable: true },
  { name: 'gstin',       label: 'GSTIN',         field: 'gstin',       align: 'left' },
  { name: 'creditLimit', label: 'CREDIT LIMIT',  field: 'creditLimit', align: 'left', sortable: true },
  { name: 'branch',      label: 'BRANCH',        field: 'branch',      align: 'left', sortable: true },
  { name: 'status',      label: 'STATUS',        field: 'status',      align: 'left', sortable: true },
];

// ─── Default data ──────────────────────────────────────────────────────────────
const defaultParties: Party[] = [
  { id: '1', name: 'Reliance Retail DC',            subType: 'Customer',      gstin: '24AABCR1234M1Z5', creditLimit: '₹5,00,000', branch: 'Ahmedabad', status: 'Active',   mobile: '9825012345', email: 'billing@relianceretail.com',  pan: 'AABCR1234M',  tdsSection: '194C', creditDays: '30', bankName: 'HDFC Bank',  accountNo: '50200012345678', ifscCode: 'HDFC0001234' },
  { id: '2', name: 'HPCL Adajan',                   subType: 'Fuel Station',  gstin: '24AAACH1234N1Z2', creditLimit: '₹2,00,000', branch: 'Surat',     status: 'Active',   mobile: '9825123456', email: 'hpcl.adajan@hpcl.in',          pan: 'AAACH1234N',  tdsSection: '194C', creditDays: '15', bankName: 'SBI Bank',   accountNo: '30200098765432', ifscCode: 'SBIN0000456' },
  { id: '3', name: 'Ramesh Alumar',                 subType: 'Driver',        gstin: '—',               creditLimit: '—',          branch: 'Ahmedabad', status: 'Active',   mobile: '9712345678', email: 'ramesh.alumar@gmail.com',       pan: 'ALUMP1234R',  tdsSection: '194C', creditDays: '0',  bankName: 'Bank of Baroda', accountNo: '10200011223344', ifscCode: 'BARB0AHMEDA' },
  { id: '4', name: 'Shree Motors',                  subType: 'Service Centre',gstin: '24AAACS5678P1Z4', creditLimit: '₹1,00,000', branch: 'Vadodara',  status: 'Active',   mobile: '9898012345', email: 'service@shreemotors.com',       pan: 'AAACS5678P',  tdsSection: '194C', creditDays: '30', bankName: 'ICICI Bank', accountNo: '00110055443322', ifscCode: 'ICIC0000011' },
  { id: '5', name: 'Adani Logistics',               subType: 'Customer',      gstin: '24AAACA9999K1Z3', creditLimit: '₹8,00,000', branch: 'Ahmedabad', status: 'Active',   mobile: '9824054321', email: 'accounts@adanilogistics.com',   pan: 'AAACA9999K',  tdsSection: '194C', creditDays: '45', bankName: 'Axis Bank',  accountNo: '91200033445566', ifscCode: 'UTIB0000123' },
  { id: '6', name: 'Devraj Patel',                  subType: 'Driver',        gstin: '—',               creditLimit: '—',          branch: 'Surat',     status: 'Active',   mobile: '9723456789', email: 'devraj.patel@gmail.com',        pan: 'PATD1234K',   tdsSection: '194C', creditDays: '0',  bankName: 'Kotak Bank', accountNo: '70200077889900', ifscCode: 'KKBK0000456' },
  { id: '7', name: 'Apollo Tyres Depot',             subType: 'Tyre Supplier', gstin: '24AAACT4432K1Z8', creditLimit: '₹3,50,000', branch: 'Ahmedabad', status: 'Active',   mobile: '9825098765', email: 'depot.ahm@apollotyres.com',     pan: 'AAACT4432K',  tdsSection: '194C', creditDays: '30', bankName: 'HDFC Bank',  accountNo: '50200088776655', ifscCode: 'HDFC0001234' },
  { id: '8', name: 'Suresh Logistics (Market Fleet)',subType: 'Vehicle Owner', gstin: '24AAACS8765B1Z9', creditLimit: '—',          branch: 'Surat',     status: 'Inactive', mobile: '9879012345', email: 'suresh.fleet@yahoo.com',        pan: 'AAACS8765B',  tdsSection: '194C', creditDays: '15', bankName: 'SBI Bank',   accountNo: '20200044556677', ifscCode: 'SBIN0000123' },
];

const parties = ref<Party[]>([]);

// ─── Form state ─────────────────────────────────────────────────────────────────
const emptyParty = () => ({
  name: '',
  subType: '— Select —',
  branch: '— Select —',
  mobile: '',
  email: '',
  status: 'Active' as 'Active' | 'Inactive',
  gstin: '',
  pan: '',
  tdsSection: '194C',
  creditLimit: '',
  creditDays: '30',
  bankName: '',
  accountNo: '',
  ifscCode: '',
});

const newParty = ref(emptyParty());

// ─── KPI Computed ──────────────────────────────────────────────────────────────
const activeCount = computed(() => parties.value.filter(p => p.status === 'Active').length);
const customerCount = computed(() => parties.value.filter(p => p.subType === 'Customer').length);
const vendorCount = computed(() => parties.value.filter(p => ['Fuel Station', 'Tyre Supplier', 'Service Centre', 'Spare Supplier'].includes(p.subType)).length);
const creditCount = computed(() => parties.value.filter(p => p.creditLimit && p.creditLimit !== '—').length);

// ─── Filtered list ─────────────────────────────────────────────────────────────
const filteredParties = computed(() => {
  return parties.value.filter(p => {
    const matchType   = typeFilter.value === 'All' || p.subType === typeFilter.value;
    const matchBranch = branchFilter.value === 'ALL' || p.branch === branchFilter.value;
    const matchStatus = statusFilter.value === 'ALL' || p.status === statusFilter.value;
    return matchType && matchBranch && matchStatus;
  });
});

// ─── Subtype CSS ───────────────────────────────────────────────────────────────
function getSubtypeClass(subType: string) {
  const map: Record<string, string> = {
    'Customer':       'sub-customer',
    'Fuel Station':   'sub-fuel-station',
    'Driver':         'sub-driver',
    'Service Centre': 'sub-service-centre',
    'Tyre Supplier':  'sub-tyre-supplier',
    'Vehicle Owner':  'sub-vehicle-owner',
    'Spare Supplier': 'sub-spare-supplier',
  };
  return map[subType] || 'sub-customer';
}

// ─── Data Loading ──────────────────────────────────────────────────────────────
function normalizeParty(p: any): Party {
  const name  = p.name || p.companyName || '';
  const match = defaultParties.find(dp => dp.name.toLowerCase() === name.toLowerCase());
  return {
    id:          String(p.id || Date.now()),
    name,
    subType:     p.subType || match?.subType || 'Customer',
    branch:      p.branch  || match?.branch  || 'Ahmedabad',
    gstin:       p.gstin   || match?.gstin   || '—',
    pan:         p.pan     || match?.pan     || '',
    tdsSection:  p.tdsSection || match?.tdsSection || '194C',
    creditLimit: p.creditLimitStr || (p.creditLimit
      ? (String(p.creditLimit).startsWith('₹') ? String(p.creditLimit) : `₹${Number(p.creditLimit).toLocaleString('en-IN')}`)
      : match?.creditLimit || '—'),
    creditDays:  p.creditDays || match?.creditDays || '30',
    bankName:    p.bankName   || match?.bankName   || '',
    accountNo:   p.accountNo  || match?.accountNo  || '',
    ifscCode:    p.ifscCode   || match?.ifscCode   || '',
    mobile:      p.mobile     || p.phone || match?.mobile || '',
    email:       p.email      || match?.email      || '',
    status:      (p.status === 'ACTIVE' || p.status === 'Active') ? 'Active' : 'Inactive',
  };
}

function persist() {
  localStorage.setItem('tms_parties_directory', JSON.stringify(parties.value));
}

async function loadParties() {
  try {
    const res: any = await api.get('/api/v1/customers');
    const raw = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (raw && raw.length > 0) {
      parties.value = raw.filter((c: any) => c.companyName || c.name).map(normalizeParty);
      persist();
      return;
    }
  } catch (e) {
    console.warn('Party Master: API fallback:', e);
  }
  const saved = localStorage.getItem('tms_parties_directory');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parties.value = parsed.map(normalizeParty);
        return;
      }
    } catch { /* ignore */ }
  }
  parties.value = defaultParties.map(normalizeParty);
  persist();
}

onMounted(async () => {
  await loadParties();
  window.addEventListener('keydown', handleGlobalKeydown, { capture: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown, { capture: true });
});

// ─── Keyboard Shortcuts ────────────────────────────────────────────────────────
function handleGlobalKeydown(e: KeyboardEvent) {
  if (showAddModal.value || showDeleteDialog.value) return;
  const key = e.key.toLowerCase();

  // Alt+F or F3 → search
  if ((e.altKey && key === 'f') || e.key === 'F3') {
    e.preventDefault(); e.stopPropagation();
    gridRef.value?.focusSearch?.();
    return;
  }
  // Alt+C or Insert → Add
  if ((e.altKey && key === 'c') || e.key === 'Insert') {
    e.preventDefault(); e.stopPropagation();
    openAddParty();
    return;
  }
  // Alt+1 or Ctrl+Shift+B → Branch filter
  if ((e.altKey && key === '1') || (e.ctrlKey && e.shiftKey && key === 'b')) {
    e.preventDefault(); e.stopPropagation();
    branchComboRef.value?.focusAndOpen();
    return;
  }
  // Alt+2 or Ctrl+Shift+S → Status filter
  if ((e.altKey && key === '2') || (e.ctrlKey && e.shiftKey && key === 's')) {
    e.preventDefault(); e.stopPropagation();
    statusComboRef.value?.focusAndOpen();
    return;
  }
}

// ─── CRUD ──────────────────────────────────────────────────────────────────────
function openAddParty() {
  isEditing.value = false;
  editingId.value = null;
  newParty.value = emptyParty();
  showAddModal.value = true;
  setTimeout(() => {
    const el = partyNameRef.value?.$el?.querySelector('input') || partyNameRef.value;
    if (el && typeof el.focus === 'function') { el.focus(); el.select?.(); }
  }, 200);
}

function editParty(p: Party) {
  isEditing.value = true;
  editingId.value = p.id;
  newParty.value = {
    name:        p.name,
    subType:     p.subType    || '— Select —',
    branch:      p.branch     || '— Select —',
    mobile:      p.mobile     || '',
    email:       p.email      || '',
    status:      p.status     || 'Active',
    gstin:       p.gstin === '—' ? '' : (p.gstin || ''),
    pan:         p.pan        || '',
    tdsSection:  p.tdsSection || '194C',
    creditLimit: p.creditLimit === '—' ? '' : (p.creditLimit || ''),
    creditDays:  p.creditDays || '30',
    bankName:    p.bankName   || '',
    accountNo:   p.accountNo  || '',
    ifscCode:    p.ifscCode   || '',
  };
  showAddModal.value = true;
  setTimeout(() => {
    const el = partyNameRef.value?.$el?.querySelector('input') || partyNameRef.value;
    if (el && typeof el.focus === 'function') { el.focus(); el.select?.(); }
  }, 200);
}

async function saveParty() {
  if (!newParty.value.name.trim()) {
    $q.notify({ type: 'warning', message: 'Validation Error', caption: 'Please enter party name', position: 'top-right' });
    return;
  }

  const cleanSubType = (newParty.value.subType === '— Select —' || !newParty.value.subType) ? 'Customer' : newParty.value.subType;
  const cleanBranch  = (newParty.value.branch  === '— Select —' || !newParty.value.branch)  ? 'Ahmedabad' : newParty.value.branch;

  const payload: Party = {
    id:          editingId.value || String(Date.now()),
    name:        newParty.value.name.trim(),
    subType:     cleanSubType,
    branch:      cleanBranch,
    mobile:      newParty.value.mobile,
    email:       newParty.value.email,
    status:      newParty.value.status,
    gstin:       newParty.value.gstin.trim()       || '—',
    pan:         newParty.value.pan.trim()          || '',
    tdsSection:  newParty.value.tdsSection === '— Select —' ? '194C' : newParty.value.tdsSection,
    creditLimit: newParty.value.creditLimit.trim()
      ? (newParty.value.creditLimit.startsWith('₹') ? newParty.value.creditLimit : `₹${newParty.value.creditLimit}`)
      : '—',
    creditDays:  newParty.value.creditDays,
    bankName:    newParty.value.bankName,
    accountNo:   newParty.value.accountNo,
    ifscCode:    newParty.value.ifscCode.toUpperCase(),
  };

  const apiPayload = { ...payload, companyName: payload.name, phone: payload.mobile };

  if (isEditing.value && editingId.value) {
    const idx = parties.value.findIndex(p => p.id === editingId.value);
    if (idx !== -1) { parties.value[idx] = payload; persist(); }
    try { await api.patch(`/api/v1/customers/${editingId.value}`, apiPayload); }
    catch (e) { console.warn('Party update error:', e); }
    $q.notify({ type: 'positive', message: 'Party Updated', caption: `${payload.name} saved.`, position: 'top-right' });
  } else {
    parties.value.unshift(payload);
    persist();
    try {
      const res: any = await api.post('/api/v1/customers', apiPayload);
      if (res?.id) { payload.id = res.id; persist(); }
    } catch (e) { console.warn('Party create error:', e); }
    $q.notify({ type: 'positive', message: 'Party Added', caption: `${payload.name} created.`, position: 'top-right' });
  }

  showAddModal.value = false;
  isEditing.value = false;
  editingId.value = null;
}

function confirmDeleteParty(p: Party) {
  deletingParty.value = p;
  showDeleteDialog.value = true;
}

async function executeDeleteParty() {
  if (!deletingParty.value) return;
  const { id, name } = deletingParty.value;
  parties.value = parties.value.filter(p => p.id !== id);
  persist();
  try { await api.delete(`/api/v1/customers/${id}`); }
  catch (e) { console.warn('Party delete error:', e); }
  $q.notify({ type: 'negative', message: 'Party Deleted', caption: `${name} removed.`, position: 'top-right' });
  showDeleteDialog.value = false;
  deletingParty.value = null;
}
</script>

<style scoped>
.party-master-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.header-underline {
  position: absolute;
  bottom: 0; left: 0;
  width: 48px; height: 3px;
  background-color: #00e5ff;
  border-radius: 2px;
}

.btn-hdr-add {
  background: #00e5ff;
  color: #070c18;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-hdr-add:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}

/* ── KPI Cards ───────────────────────────────────── */
.stat-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.accent-bar {
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 3px;
  opacity: 0.7;
}

/* ── Sub-type filter pills ───────────────────────── */
.filter-pills-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.filter-pill {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-pill:hover {
  border-color: rgba(0, 242, 254, 0.4);
  color: #ffffff;
}
.filter-pill--active {
  background: #00e5ff !important;
  color: #070c18 !important;
  border-color: #00e5ff !important;
  font-weight: 700 !important;
}

/* ── Sub-type colour pills in table ─────────────── */
.subtype-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  white-space: nowrap;
}
.sub-customer      { background: rgba(56,189,248,0.12);  color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); }
.sub-fuel-station  { background: rgba(16,185,129,0.12);  color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.sub-driver        { background: rgba(251,191,36,0.12);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
.sub-service-centre{ background: rgba(99,102,241,0.15);  color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }
.sub-tyre-supplier { background: rgba(45,212,191,0.12);  color: #2dd4bf; border: 1px solid rgba(45,212,191,0.25); }
.sub-vehicle-owner { background: rgba(192,132,252,0.12); color: #c084fc; border: 1px solid rgba(192,132,252,0.25); }
.sub-spare-supplier{ background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.25); }

/* ── Status pills ────────────────────────────────── */
.status-pill {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  display: inline-block;
}
.status-active   { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.status-inactive { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

/* ── Form section labels ─────────────────────────── */
.section-label {
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  color: #00f2fe;
  letter-spacing: 0.08em;
  margin-top: 4px;
  margin-bottom: 2px;
}
</style>
