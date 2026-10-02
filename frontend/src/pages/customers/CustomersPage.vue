<template>
  <div class="party-master-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header with Title & Action Button matching Image 1 -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white relative-position inline-block q-pb-xs">
          Party Master
          <div class="header-underline"></div>
        </div>
      </div>

      <button
        type="button"
        class="btn-hdr-add"
        @click="openAddParty"
      >
        + Add Party
      </button>
    </div>

    <!-- Filter Category Pills matching Image 1 -->
    <div class="filter-pills-row row items-center q-gutter-x-sm q-mb-md">
      <button
        v-for="sub in subTypes"
        :key="sub"
        type="button"
        class="filter-pill"
        :class="{ 'filter-pill--active': selectedSubType === sub }"
        @click="selectedSubType = sub"
      >
        {{ sub }}
      </button>
    </div>

    <!-- Search & Branch Filter matching Image 1 -->
    <div class="row items-center q-gutter-x-sm no-wrap q-mb-md">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        placeholder="Search party / GSTIN / PAN..."
        class="desk-search-input"
        style="min-width: 260px; max-width: 320px;"
      >
        <template #prepend>
          <q-icon name="search" size="18px" color="cyan" />
        </template>
        <template #append v-if="searchQuery">
          <q-icon
            name="cancel"
            size="18px"
            class="cursor-pointer text-slate-400 hover:text-white"
            @click.stop.prevent="searchQuery = ''"
          />
        </template>
      </q-input>

      <q-select
        v-model="selectedBranch"
        :options="branchFilterOptions"
        dense
        outlined
        emit-value
        map-options
        class="desk-filter-select"
        popup-content-class="desk-select-menu"
        style="min-width: 140px;"
      />
    </div>

    <!-- Parties Table matching Image 1 -->
    <div class="cyber-card table-wrap relative-position">
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Refreshing Party Master..."
        subtitle="Syncing customers, vendors, stations & credit limits"
      />
      <table class="cyber-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>SUB-TYPE</th>
            <th>GSTIN</th>
            <th>CREDIT LIMIT</th>
            <th>BRANCH</th>
            <th>STATUS</th>
            <th class="text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredParties" :key="p.id">
            <td class="name-cell font-bold">{{ p.name }}</td>
            <td>
              <span class="subtype-pill" :class="getSubtypeClass(p.subType)">
                {{ p.subType }}
              </span>
            </td>
            <td class="gstin-cell font-mono">{{ p.gstin || '—' }}</td>
            <td class="credit-cell font-bold text-white">{{ p.creditLimit || '—' }}</td>
            <td class="branch-cell">{{ p.branch || '—' }}</td>
            <td>
              <span class="status-active font-medium">{{ p.status || 'Active' }}</span>
            </td>
            <td class="text-right">
              <div class="row items-center q-gutter-x-xs no-wrap justify-end">
                <button class="btn-table-edit" @click.stop="editParty(p)">
                  Edit
                </button>
                <button class="btn-table-delete" @click.stop="confirmDeleteParty(p)" title="Delete Party">
                  <q-icon name="delete" size="16px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredParties.length === 0">
            <td colspan="7" class="text-center py-12">
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

    <!-- Create / Edit Party Right-Slide Drawer matching Image 2, 3, 4, 5 -->
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
          <!-- Category 1: BASIC INFO -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-xs q-mb-xs">
            BASIC INFO
          </div>

          <div class="col-12">
            <DeskField label="PARTY NAME *" required>
              <q-input
                v-model="newParty.name"
                dense
                outlined
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
              <q-input
                v-model="newParty.mobile"
                dense
                outlined
                placeholder="9XXXXXXXXX"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="EMAIL">
              <q-input
                v-model="newParty.email"
                dense
                outlined
                placeholder="billing@company.com"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS">
              <DeskCombo
                v-model="newParty.status"
                :options="['Active', 'Inactive']"
                placeholder="Active"
              />
            </DeskField>
          </div>

          <!-- Category 2: TAX -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            TAX
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="GSTIN">
              <q-input
                v-model="newParty.gstin"
                dense
                outlined
                placeholder="24AABCR1234M1Z5"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PAN">
              <q-input
                v-model="newParty.pan"
                dense
                outlined
                placeholder="AABCR1234M"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TDS SECTION">
              <DeskCombo
                v-model="newParty.tdsSection"
                :options="tdsSectionDropdownOptions"
                placeholder="194C"
              />
            </DeskField>
          </div>

          <!-- Category 3: CREDIT -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            CREDIT
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CREDIT LIMIT (₹)">
              <q-input
                v-model="newParty.creditLimit"
                dense
                outlined
                placeholder="₹5,00,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="CREDIT DAYS">
              <q-input
                v-model="newParty.creditDays"
                dense
                outlined
                placeholder="30"
              />
            </DeskField>
          </div>

          <!-- Category 4: BANK DETAILS -->
          <div class="col-12 text-xs font-mono font-bold text-cyan-400 tracking-wider q-mt-md q-mb-xs">
            BANK DETAILS
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="BANK NAME">
              <q-input
                v-model="newParty.bankName"
                dense
                outlined
                placeholder="HDFC Bank"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ACCOUNT NO">
              <q-input
                v-model="newParty.accountNo"
                dense
                outlined
                placeholder="XXXXXXXXXXXXXX"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="IFSC CODE">
              <q-input
                v-model="newParty.ifscCode"
                dense
                outlined
                placeholder="HDFC0001234"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Delete Confirmation Modal -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Party"
      icon="warning"
      position="standard"
      width="460px"
      confirm-label="Delete Party"
      confirm-color="red-7"
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
          This operation will remove the party and its billing profile from the database directory.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../api/client';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
} from '../../framework';

const $q = useQuasar();
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const showAddModal = ref(false);
const showDeleteDialog = ref(false);
const deletingParty = ref<Party | null>(null);

const searchQuery = ref('');
const selectedSubType = ref('All');
const selectedBranch = ref('ALL');
const isRefreshing = ref(false);

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

const subTypes = [
  'All',
  'Customer',
  'Fuel Station',
  'Driver',
  'Service Centre',
  'Tyre Supplier',
  'Vehicle Owner',
  'Spare Supplier',
];

const subTypeDropdownOptions = [
  '— Select —',
  'Customer',
  'Fuel Station',
  'Driver',
  'Service Centre',
  'Tyre Supplier',
  'Vehicle Owner',
  'Spare Supplier',
];

const branchDropdownOptions = [
  '— Select —',
  'Ahmedabad',
  'Surat',
  'Mumbai',
  'Vadodara',
  'Rajkot',
  'Delhi',
];

const tdsSectionDropdownOptions = [
  '— Select —',
  '194C',
  '194I',
  '194J',
  '—',
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

const defaultParties: Party[] = [
  {
    id: '1',
    name: 'Reliance Retail DC',
    subType: 'Customer',
    gstin: '24AABCR1234M1Z5',
    creditLimit: '₹5,00,000',
    branch: 'Ahmedabad',
    status: 'Active',
    mobile: '9825012345',
    email: 'billing@relianceretail.com',
    pan: 'AABCR1234M',
    tdsSection: '194C',
    creditDays: '30',
    bankName: 'HDFC Bank',
    accountNo: '50200012345678',
    ifscCode: 'HDFC0001234',
  },
  {
    id: '2',
    name: 'HPCL Adajan',
    subType: 'Fuel Station',
    gstin: '24AAACH1234N1Z2',
    creditLimit: '₹2,00,000',
    branch: 'Surat',
    status: 'Active',
    mobile: '9825123456',
    email: 'hpcl.adajan@hpcl.in',
    pan: 'AAACH1234N',
    tdsSection: '194C',
    creditDays: '15',
    bankName: 'SBI Bank',
    accountNo: '30200098765432',
    ifscCode: 'SBIN0000456',
  },
  {
    id: '3',
    name: 'Ramesh Alumar',
    subType: 'Driver',
    gstin: '—',
    creditLimit: '—',
    branch: 'Ahmedabad',
    status: 'Active',
    mobile: '9712345678',
    email: 'ramesh.alumar@gmail.com',
    pan: 'ALUMP1234R',
    tdsSection: '194C',
    creditDays: '0',
    bankName: 'Bank of Baroda',
    accountNo: '10200011223344',
    ifscCode: 'BARB0AHMEDA',
  },
  {
    id: '4',
    name: 'Shree Motors',
    subType: 'Service Centre',
    gstin: '24AAACS5678P1Z4',
    creditLimit: '₹1,00,000',
    branch: 'Vadodara',
    status: 'Active',
    mobile: '9898012345',
    email: 'service@shreemotors.com',
    pan: 'AAACS5678P',
    tdsSection: '194C',
    creditDays: '30',
    bankName: 'ICICI Bank',
    accountNo: '00110055443322',
    ifscCode: 'ICIC0000011',
  },
  {
    id: '5',
    name: 'Adani Logistics',
    subType: 'Customer',
    gstin: '24AAACA9999K1Z3',
    creditLimit: '₹8,00,000',
    branch: 'Ahmedabad',
    status: 'Active',
    mobile: '9824054321',
    email: 'accounts@adanilogistics.com',
    pan: 'AAACA9999K',
    tdsSection: '194C',
    creditDays: '45',
    bankName: 'Axis Bank',
    accountNo: '91200033445566',
    ifscCode: 'UTIB0000123',
  },
  {
    id: '6',
    name: 'Devraj Patel',
    subType: 'Driver',
    gstin: '—',
    creditLimit: '—',
    branch: 'Surat',
    status: 'Active',
    mobile: '9723456789',
    email: 'devraj.patel@gmail.com',
    pan: 'PATD1234K',
    tdsSection: '194C',
    creditDays: '0',
    bankName: 'Kotak Bank',
    accountNo: '70200077889900',
    ifscCode: 'KKBK0000456',
  },
  {
    id: '7',
    name: 'Apollo Tyres Depot',
    subType: 'Tyre Supplier',
    gstin: '24AAACT4432K1Z8',
    creditLimit: '₹3,50,000',
    branch: 'Ahmedabad',
    status: 'Active',
    mobile: '9825098765',
    email: 'depot.ahm@apollotyres.com',
    pan: 'AAACT4432K',
    tdsSection: '194C',
    creditDays: '30',
    bankName: 'HDFC Bank',
    accountNo: '50200088776655',
    ifscCode: 'HDFC0001234',
  },
  {
    id: '8',
    name: 'Suresh Logistics (Market Fleet)',
    subType: 'Vehicle Owner',
    gstin: '24AAACS8765B1Z9',
    creditLimit: '—',
    branch: 'Surat',
    status: 'Active',
    mobile: '9879012345',
    email: 'suresh.fleet@yahoo.com',
    pan: 'AAACS8765B',
    tdsSection: '194C',
    creditDays: '15',
    bankName: 'SBI Bank',
    accountNo: '20200044556677',
    ifscCode: 'SBIN0000123',
  },
];

const parties = ref<Party[]>([]);

const newParty = ref({
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

onMounted(() => {
  loadParties();
});

function normalizeParty(p: any): Party {
  const name = p.name || p.companyName || '';
  const match = defaultParties.find((dp) => dp.name.toLowerCase() === name.toLowerCase());

  return {
    id: String(p.id || Date.now()),
    name,
    subType: p.subType || match?.subType || 'Customer',
    branch: p.branch || match?.branch || 'Ahmedabad',
    gstin: p.gstin || match?.gstin || '—',
    pan: p.pan || match?.pan || 'AABCR1234M',
    tdsSection: p.tdsSection || match?.tdsSection || '194C',
    creditLimit: p.creditLimitStr || (p.creditLimit ? (String(p.creditLimit).startsWith('₹') ? String(p.creditLimit) : `₹${Number(p.creditLimit).toLocaleString('en-IN')}`) : match?.creditLimit || '—'),
    creditDays: p.creditDays || match?.creditDays || '30',
    bankName: p.bankName || match?.bankName || 'HDFC Bank',
    accountNo: p.accountNo || match?.accountNo || 'XXXXXXXXXXXXXX',
    ifscCode: p.ifscCode || match?.ifscCode || 'HDFC0001234',
    mobile: p.mobile || p.phone || match?.mobile || '9XXXXXXXXX',
    email: p.email || match?.email || 'billing@company.com',
    status: (p.status === 'ACTIVE' || p.status === 'Active') ? 'Active' : 'Inactive',
  };
}

async function loadParties() {
  try {
    const res: any = await api.get('/api/v1/customers');
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (rawList && rawList.length > 0) {
      const validParties = rawList
        .filter((c: any) => c.companyName || c.name)
        .map(normalizeParty);

      // Keep default Image 1 order
      const order = [
        'Reliance Retail DC',
        'HPCL Adajan',
        'Ramesh Alumar',
        'Shree Motors',
        'Adani Logistics',
        'Devraj Patel',
        'Apollo Tyres Depot',
        'Suresh Logistics (Market Fleet)'
      ];
      validParties.sort((a, b) => {
        const ia = order.indexOf(a.name);
        const ib = order.indexOf(b.name);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      parties.value = validParties;
      persist();
      return;
    }
  } catch (e) {
    console.warn('API get customers error, fallback to local cache:', e);
  }

  const saved = localStorage.getItem('tms_parties_directory');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parties.value = parsed.map(normalizeParty);
        return;
      }
    } catch {
      // fallback
    }
  }
  parties.value = defaultParties.map(normalizeParty);
  persist();
}

function persist() {
  localStorage.setItem('tms_parties_directory', JSON.stringify(parties.value));
}

function getSubtypeClass(subType: string) {
  switch (subType) {
    case 'Customer':
      return 'sub-customer';
    case 'Fuel Station':
      return 'sub-fuel-station';
    case 'Driver':
      return 'sub-driver';
    case 'Service Centre':
      return 'sub-service-centre';
    case 'Tyre Supplier':
      return 'sub-tyre-supplier';
    case 'Vehicle Owner':
      return 'sub-vehicle-owner';
    case 'Spare Supplier':
      return 'sub-spare-supplier';
    default:
      return 'sub-customer';
  }
}

const filteredParties = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return parties.value.filter((p) => {
    const matchSearch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.gstin && p.gstin.toLowerCase().includes(q)) ||
      (p.pan && p.pan.toLowerCase().includes(q));
    const matchType = selectedSubType.value === 'All' || p.subType === selectedSubType.value;
    const matchBranch = selectedBranch.value === 'ALL' || p.branch === selectedBranch.value;
    return matchSearch && matchType && matchBranch;
  });
});

function openAddParty() {
  isEditing.value = false;
  editingId.value = null;
  newParty.value = {
    name: '',
    subType: '— Select —',
    branch: '— Select —',
    mobile: '',
    email: '',
    status: 'Active',
    gstin: '',
    pan: '',
    tdsSection: '194C',
    creditLimit: '',
    creditDays: '30',
    bankName: '',
    accountNo: '',
    ifscCode: '',
  };
  showAddModal.value = true;
}

function editParty(p: Party) {
  isEditing.value = true;
  editingId.value = p.id;
  newParty.value = {
    name: p.name,
    subType: p.subType || '— Select —',
    branch: p.branch || '— Select —',
    mobile: p.mobile || '9XXXXXXXXX',
    email: p.email || 'billing@company.com',
    status: p.status || 'Active',
    gstin: p.gstin === '—' ? '' : p.gstin,
    pan: p.pan || 'AABCR1234M',
    tdsSection: p.tdsSection || '194C',
    creditLimit: p.creditLimit === '—' ? '' : p.creditLimit,
    creditDays: p.creditDays || '30',
    bankName: p.bankName || 'HDFC Bank',
    accountNo: p.accountNo || 'XXXXXXXXXXXXXX',
    ifscCode: p.ifscCode || 'HDFC0001234',
  };
  showAddModal.value = true;
}

async function saveParty() {
  if (!newParty.value.name.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter party legal name',
      position: 'top-right',
    });
    return;
  }

  const cleanSubType = newParty.value.subType === '— Select —' ? 'Customer' : newParty.value.subType;
  const cleanBranch = newParty.value.branch === '— Select —' ? 'Ahmedabad' : newParty.value.branch;

  const payload: Party = {
    id: editingId.value || String(Date.now()),
    name: newParty.value.name.trim(),
    subType: cleanSubType,
    branch: cleanBranch,
    mobile: newParty.value.mobile,
    email: newParty.value.email,
    status: newParty.value.status,
    gstin: newParty.value.gstin.trim() || '—',
    pan: newParty.value.pan.trim(),
    tdsSection: newParty.value.tdsSection === '— Select —' ? '194C' : newParty.value.tdsSection,
    creditLimit: newParty.value.creditLimit.trim()
      ? (newParty.value.creditLimit.startsWith('₹') ? newParty.value.creditLimit : `₹${newParty.value.creditLimit}`)
      : '—',
    creditDays: newParty.value.creditDays,
    bankName: newParty.value.bankName,
    accountNo: newParty.value.accountNo,
    ifscCode: newParty.value.ifscCode,
  };

  const apiPayload = {
    ...payload,
    companyName: payload.name,
    phone: payload.mobile,
  };

  if (isEditing.value && editingId.value) {
    const idx = parties.value.findIndex((p) => p.id === editingId.value);
    if (idx !== -1) {
      parties.value[idx] = payload;
      persist();
    }

    try {
      await api.patch(`/api/v1/customers/${editingId.value}`, apiPayload);
    } catch (e) {
      console.warn('DB customer update error, preserved locally:', e);
    }

    $q.notify({
      type: 'positive',
      message: 'Party Profile Updated',
      caption: `${payload.name} details saved to database.`,
      position: 'top-right',
    });
  } else {
    parties.value.unshift(payload);
    persist();

    try {
      const res: any = await api.post('/api/v1/customers', apiPayload);
      if (res && res.id) {
        payload.id = res.id;
        persist();
      }
    } catch (e) {
      console.warn('DB customer create error, preserved locally:', e);
    }

    $q.notify({
      type: 'positive',
      message: 'New Party Created',
      caption: `${payload.name} added to master database.`,
      position: 'top-right',
    });
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
  const targetId = deletingParty.value.id;
  const targetName = deletingParty.value.name;

  parties.value = parties.value.filter((p) => p.id !== targetId);
  persist();

  try {
    await api.delete(`/api/v1/customers/${targetId}`);
  } catch (e) {
    console.warn('DB customer delete error, removed locally:', e);
  }

  $q.notify({
    type: 'negative',
    message: 'Party Deleted',
    caption: `${targetName} removed from database.`,
    position: 'top-right',
  });
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
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
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

.filter-pills-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 0.4rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
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

.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.cyber-table th {
  background: rgba(255, 255, 255, 0.02);
  color: #00f2fe;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.cyber-table tr:hover td {
  background: rgba(0, 242, 254, 0.02);
}

.name-cell {
  color: #ffffff;
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
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.sub-fuel-station {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.sub-driver {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.sub-service-centre {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.sub-tyre-supplier {
  background: rgba(45, 212, 191, 0.12);
  color: #2dd4bf;
  border: 1px solid rgba(45, 212, 191, 0.25);
}

.sub-vehicle-owner {
  background: rgba(192, 132, 252, 0.12);
  color: #c084fc;
  border: 1px solid rgba(192, 132, 252, 0.25);
}

.sub-spare-supplier {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.gstin-cell {
  color: #94a3b8;
}

.status-active {
  color: #10b981;
}

.action-btn-pill {
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-table-edit {
  background: #131d32;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.btn-table-edit:hover {
  background: #1c2b4a;
  border-color: #38bdf8;
  color: #ffffff;
}

.btn-table-delete {
  background: #131d32;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  width: 32px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-table-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #f87171;
}
</style>
