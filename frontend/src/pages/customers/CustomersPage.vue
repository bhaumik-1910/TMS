<template>
  <div class="party-master-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Party Master</h1>
        <div class="accent-line"></div>
      </div>
      <button class="btn-primary" @click="openAddParty">
        <span class="material-icons-outlined">add</span>
        Add Party
      </button>
    </div>

    <!-- Filter Category Pills matching Figma -->
    <div class="filter-pills-row">
      <button
        v-for="sub in subTypes"
        :key="sub"
        class="filter-pill"
        :class="{ active: selectedSubType === sub }"
        @click="selectedSubType = sub"
      >
        {{ sub }}
      </button>
    </div>

    <!-- Search & Branch Filter -->
    <div class="filter-bar row items-center justify-between no-wrap">
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Search party / GSTIN / PAN..."
          class="desk-search-input"
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
              @mousedown.stop.prevent="searchQuery = ''"
            />
          </template>
        </q-input>
        <select v-model="selectedBranch" class="cyber-select">
          <option value="ALL">All Branches</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Surat">Surat</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      <div class="row items-center q-gutter-x-xs no-wrap">
        <q-btn
          flat
          dense
          icon="refresh"
          class="desk-grid-refresh-btn"
          :loading="isRefreshing"
          @click="onRefresh"
        >
          <q-tooltip>Refresh Parties Register</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Parties Table matching Figma -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing party records...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>SUB-TYPE</th>
            <th>GSTIN</th>
            <th>CREDIT LIMIT</th>
            <th>BRANCH</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredParties" :key="p.id">
            <td class="name-cell font-bold">{{ p.name }}</td>
            <td>
              <span class="subtype-pill" :class="'sub-' + p.subType.toLowerCase().replace(/\s+/g, '-')">
                {{ p.subType }}
              </span>
            </td>
            <td class="gstin-cell font-mono">{{ p.gstin }}</td>
            <td class="credit-cell font-bold text-white">{{ p.creditLimit }}</td>
            <td class="branch-cell">{{ p.branch }}</td>
            <td>
              <span class="status-badge badge-active">{{ p.status }}</span>
            </td>
            <td>
              <button class="btn-action" @click="editParty(p)">Edit</button>
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

    <!-- Create / Edit Party Desk Dialog matching Reference Design -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? `Edit Party Profile — ${newParty.name}` : 'Add New Party Profile'"
      width="580px"
      :confirm-label="isEditing ? 'Update Party' : 'Save Party'"
      cancel-label="Cancel"
      @confirm="saveParty"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveParty">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <DeskField label="Party Legal Name" required shortcut="1">
              <q-input
                v-model="newParty.name"
                dense
                outlined
                placeholder="e.g. Tata Steel Ltd"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Party Sub-Type" required shortcut="2">
              <DeskCombo
                v-model="newParty.subType"
                :options="['Customer', 'Fuel Station', 'Driver', 'Service Centre', 'Tyre Supplier', 'Vehicle Owner', 'Spare Supplier']"
                placeholder="Select sub-type..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Operating Branch" required shortcut="3">
              <DeskCombo
                v-model="newParty.branch"
                :options="['Ahmedabad', 'Surat', 'Vadodara', 'Mumbai']"
                placeholder="Select branch..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="GSTIN (15 Digits)" shortcut="4">
              <q-input
                v-model="newParty.gstin"
                dense
                outlined
                placeholder="e.g. 24AAACS5678P1Z4"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Sanctioned Credit Limit (₹)" shortcut="5">
              <DeskNumberInput
                v-model="newParty.creditLimit"
                placeholder="e.g. 500000"
                :step="10000"
                :min="0"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { exportToCsv } from '../../utils/exportCsv';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskNumberInput,
} from '../../framework';

const $q = useQuasar();
const isEditing = ref(false);
const editingId = ref<string | null>(null);

function openAddParty() {
  isEditing.value = false;
  editingId.value = null;
  newParty.value = {
    name: '',
    subType: 'Customer',
    gstin: '',
    creditLimit: '',
    branch: 'Ahmedabad',
  };
  showAddModal.value = true;
}

interface Party {
  id: string;
  name: string;
  subType: string;
  gstin: string;
  creditLimit: string;
  branch: string;
  status: 'Active' | 'Inactive';
}

const showAddModal = ref(false);
const searchQuery = ref('');
const selectedSubType = ref('All');
const selectedBranch = ref('ALL');

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

const parties = ref<Party[]>([
  {
    id: '1',
    name: 'Reliance Retail DC',
    subType: 'Customer',
    gstin: '24AABCR1234M1Z5',
    creditLimit: '₹5,00,000',
    branch: 'Ahmedabad',
    status: 'Active',
  },
  {
    id: '2',
    name: 'HPCL Adajan',
    subType: 'Fuel Station',
    gstin: '24AAACH1234N1Z2',
    creditLimit: '₹2,00,000',
    branch: 'Surat',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Ramesh Alumar',
    subType: 'Driver',
    gstin: '—',
    creditLimit: '—',
    branch: 'Ahmedabad',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Shree Motors',
    subType: 'Service Centre',
    gstin: '24AAACS5678P1Z4',
    creditLimit: '₹1,00,000',
    branch: 'Vadodara',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Adani Logistics',
    subType: 'Customer',
    gstin: '24AAACA9999K1Z3',
    creditLimit: '₹8,00,000',
    branch: 'Ahmedabad',
    status: 'Active',
  },
  {
    id: '6',
    name: 'Devraj Patel',
    subType: 'Driver',
    gstin: '—',
    creditLimit: '—',
    branch: 'Surat',
    status: 'Active',
  },
  {
    id: '7',
    name: 'Apollo Tyres Depot',
    subType: 'Tyre Supplier',
    gstin: '24AAACT4432K1Z8',
    creditLimit: '₹3,50,000',
    branch: 'Ahmedabad',
    status: 'Active',
  },
  {
    id: '8',
    name: 'Suresh Logistics (Market Fleet)',
    subType: 'Vehicle Owner',
    gstin: '24AAACS8765B1Z9',
    creditLimit: '—',
    branch: 'Surat',
    status: 'Active',
  },
]);

const newParty = ref({
  name: '',
  subType: 'Customer',
  gstin: '',
  creditLimit: '',
  branch: 'Ahmedabad',
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      message: 'Parties Register Refreshed',
      caption: 'Customer & vendor profiles synced.',
      position: 'top-right',
    });
  }, 600);
}

const filteredParties = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return parties.value.filter(p => {
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.gstin.toLowerCase().includes(q);
    const matchType = selectedSubType.value === 'All' || p.subType === selectedSubType.value;
    const matchBranch = selectedBranch.value === 'ALL' || p.branch === selectedBranch.value;
    return matchSearch && matchType && matchBranch;
  });
});

function editParty(p: Party) {
  isEditing.value = true;
  editingId.value = p.id;
  newParty.value = {
    name: p.name,
    subType: p.subType,
    gstin: p.gstin === '—' ? '' : p.gstin,
    creditLimit: p.creditLimit.replace(/[^0-9]/g, ''),
    branch: p.branch,
  };
  showAddModal.value = true;
}

function saveParty() {
  if (!newParty.value.name) return;

  if (isEditing.value && editingId.value) {
    const idx = parties.value.findIndex((p) => p.id === editingId.value);
    if (idx !== -1) {
      parties.value[idx] = {
        ...parties.value[idx],
        name: newParty.value.name,
        subType: newParty.value.subType,
        gstin: newParty.value.gstin || '—',
        creditLimit: newParty.value.creditLimit ? `₹${Number(newParty.value.creditLimit).toLocaleString('en-IN')}` : '—',
        branch: newParty.value.branch,
      };
      $q.notify({
        type: 'positive',
        message: 'Party Profile Updated',
        caption: `${newParty.value.name} details saved.`,
        position: 'top-right',
      });
    }
  } else {
    parties.value.unshift({
      id: String(Date.now()),
      name: newParty.value.name,
      subType: newParty.value.subType,
      gstin: newParty.value.gstin || '—',
      creditLimit: newParty.value.creditLimit ? `₹${Number(newParty.value.creditLimit).toLocaleString('en-IN')}` : '—',
      branch: newParty.value.branch,
      status: 'Active',
    });
    $q.notify({
      type: 'positive',
      message: 'New Party Created',
      caption: `${newParty.value.name} added to directory.`,
      position: 'top-right',
    });
  }

  showAddModal.value = false;
  isEditing.value = false;
  editingId.value = null;
  newParty.value = { name: '', subType: 'Customer', gstin: '', creditLimit: '', branch: 'Ahmedabad' };
}

function exportPartiesCsv() {
  exportToCsv(
    'parties_customers_master',
    [
      { label: 'Party Name', field: 'name' },
      { label: 'Category / SubType', field: 'subType' },
      { label: 'GSTIN Number', field: 'gstin' },
      { label: 'Credit Limit', field: 'creditLimit' },
      { label: 'Operating Branch', field: 'branch' },
      { label: 'Status', field: 'status' },
    ],
    parties.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Customer Directory Exported',
    caption: `${parties.value.length} records exported to CSV.`,
    position: 'top-right',
  });
}
</script>

<style scoped>
.party-master-page {
  padding: 1.5rem;
  background-color: #070c18;
  min-height: calc(100vh - 64px);
  color: #e2e8f0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.accent-line {
  width: 44px;
  height: 3px;
  background: #00f2fe;
  border-radius: 2px;
  margin-top: 6px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #00f2fe;
  color: #070c18;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #38bdf8;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
}

.btn-secondary {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
}

.filter-pills-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.filter-pill {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill.active {
  background: #00f2fe;
  color: #070c18;
  border-color: #00f2fe;
  font-weight: 700;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input-wrap {
  position: relative;
  width: 340px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.1rem;
}

.cyber-input {
  width: 100%;
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.15s ease;
}

.search-input-wrap .cyber-input {
  padding-left: 2.2rem;
}

.cyber-input:focus {
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
}

.cyber-select {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
}

.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
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

.name-cell {
  color: #ffffff;
}

.subtype-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
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

.gstin-cell {
  color: #94a3b8;
}

.status-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 6px;
}

.badge-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.btn-action {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-action:hover {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: #0d172b;
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 12px;
  width: 520px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.25rem;
}

.modal-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
