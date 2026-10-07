<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Branches &amp; Hubs</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          :disabled="isLoading"
          @click="loadBranches"
        >
          <q-icon name="refresh" size="16px" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          class="btn-primary-cyan"
          @click="openBranchDialog()"
        >
          <q-icon name="add" size="18px" />
          <span>Branch</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Stat Cards matching Billing Page -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Card 1: TOTAL BRANCHES (Active cyan glowing border) -->
      <div class="kpi-box kpi-box--active">
        <div class="kpi-title text-sky-600">TOTAL BRANCHES</div>
        <div class="kpi-amount text-sky-700">{{ branches.length }}</div>
        <div class="kpi-subtext">Active network stations</div>
      </div>

      <!-- Card 2: HEAD OFFICE -->
      <div class="kpi-box">
        <div class="kpi-title">HEAD OFFICE</div>
        <div class="kpi-amount text-slate-800">{{ headOfficeBranch?.code || 'HO-AHM' }}</div>
        <div class="kpi-subtext">{{ headOfficeBranch?.city || 'Ahmedabad Central' }}</div>
      </div>

      <!-- Card 3: ACTIVE HUBS -->
      <div class="kpi-box">
        <div class="kpi-title">ACTIVE HUBS</div>
        <div class="kpi-amount text-emerald-600">{{ activeBranchesCount }}</div>
        <div class="kpi-subtext">Operational stations</div>
      </div>

      <!-- Card 4: STATES COVERED -->
      <div class="kpi-box">
        <div class="kpi-title">STATES COVERED</div>
        <div class="kpi-amount text-slate-800">{{ statesCount }}</div>
        <div class="kpi-subtext">Pan-India logistics reach</div>
      </div>
    </div>

    <!-- Search input matching Billing Page -->
    <div class="mb-5">
      <div class="relative max-w-sm">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sky-500">
          <q-icon name="search" size="18px" />
        </span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input w-full pl-9 pr-8 py-2 text-sm rounded-lg"
          placeholder="Search branch code, name, city, GSTIN... (Alt+F)"
          @keydown.esc="searchQuery = ''"
        />
        <button
          v-if="searchQuery"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
          @click="searchQuery = ''"
        >
          <q-icon name="close" size="16px" />
        </button>
      </div>
    </div>

    <!-- Table matching Billing Page -->
    <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
              <th class="py-3 px-4 font-bold">BRANCH CODE</th>
              <th class="py-3 px-4 font-bold">BRANCH NAME</th>
              <th class="py-3 px-4 font-bold">CITY / STATE</th>
              <th class="py-3 px-4 font-bold">GSTIN</th>
              <th class="py-3 px-4 font-bold">PHONE</th>
              <th class="py-3 px-4 font-bold">TYPE</th>
              <th class="py-3 px-4 font-bold">STATUS</th>
              <th class="py-3 px-4 font-bold text-center">ACTION</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="branch in filteredBranches"
              :key="branch.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- Branch Code -->
              <td class="py-4 px-4 font-semibold text-sky-700 font-mono">
                {{ branch.code }}
              </td>

              <!-- Branch Name -->
              <td class="py-4 px-4 font-medium text-slate-900">
                {{ branch.name }}
              </td>

              <!-- City / State -->
              <td class="py-4 px-4 text-slate-700">
                {{ branch.city }} <span class="text-xs text-slate-400 font-mono">({{ branch.stateCode }})</span>
              </td>

              <!-- GSTIN -->
              <td class="py-4 px-4 font-mono text-slate-600 text-xs">
                {{ branch.gstin || '—' }}
              </td>

              <!-- Phone -->
              <td class="py-4 px-4 font-mono text-slate-600 text-xs">
                {{ branch.phone || '—' }}
              </td>

              <!-- Type (Badge) -->
              <td class="py-4 px-4">
                <span
                  class="badge-pill"
                  :class="branch.isHeadOffice ? 'badge-sky' : 'badge-draft'"
                >
                  {{ branch.isHeadOffice ? 'Head Office' : 'Branch Hub' }}
                </span>
              </td>

              <!-- Status (Badge) -->
              <td class="py-4 px-4">
                <span
                  class="badge-pill"
                  :class="branch.status === 'active' ? 'badge-paid' : 'badge-draft'"
                >
                  {{ branch.status.toUpperCase() }}
                </span>
              </td>

              <!-- Action Buttons -->
              <td class="py-4 px-4 text-center">
                <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                  <button class="btn-table-action" @click.stop="openBranchDialog(branch)">
                    Edit
                  </button>
                  <button
                    v-if="!branch.isHeadOffice"
                    class="btn-table-icon btn-table-icon--danger"
                    title="Delete Branch"
                    @click.stop="confirmDelete(branch)"
                  >
                    <q-icon name="delete" size="14px" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredBranches.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                <q-icon name="storefront" size="40px" class="text-slate-400 mb-2" />
                <div class="text-base font-medium text-slate-700">No branches found</div>
                <div class="text-xs text-slate-500 mt-1">Try adjusting your search criteria</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Branch Modal matching Desk Dialog standard -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 520px; max-width: 650px;" class="q-pa-md bg-white text-slate-800 rounded-xl">
        <q-card-section class="row items-center justify-between border-b border-slate-200 pb-3 q-mb-sm">
          <div class="text-lg font-bold text-slate-900">
            {{ editingBranch ? 'Edit Transport Branch' : 'New Transport Branch' }}
          </div>
          <q-btn flat round dense icon="close" color="grey-6" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="form.code"
                label="Branch Code *"
                dense
                outlined
                class="font-mono"
                placeholder="e.g. BR-SUR"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.name"
                label="Branch Name *"
                dense
                outlined
                placeholder="e.g. Surat Hub"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="form.city"
                label="City"
                dense
                outlined
                placeholder="Surat"
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="form.stateCode"
                label="State Code"
                dense
                outlined
                maxlength="2"
                placeholder="GJ"
              />
            </div>
            <div class="col-3">
              <q-select
                v-model="form.status"
                :options="['active', 'inactive']"
                label="Status"
                dense
                outlined
              />
            </div>
          </div>

          <q-input
            v-model="form.gstin"
            label="Branch GSTIN"
            dense
            outlined
            placeholder="24AAACT1234F1Z1"
          />

          <q-input
            v-model="form.address"
            type="textarea"
            rows="2"
            label="Physical Address"
            dense
            outlined
            placeholder="Yard No 4, Transport Nagar..."
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="form.phone"
                label="Phone"
                dense
                outlined
                placeholder="+91 98765 43210"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.email"
                label="Email"
                dense
                outlined
                placeholder="branch@tms.com"
              />
            </div>
          </div>

          <q-checkbox
            v-model="form.isHeadOffice"
            label="Designate as Company Head Office (HO)"
            dense
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="border-t border-slate-200 pt-3 q-mt-sm">
          <button
            type="button"
            class="btn-secondary-action mr-2"
            v-close-popup
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn-primary-cyan"
            :disabled="isSaving"
            @click="saveBranch"
          >
            <q-spinner v-if="isSaving" size="14px" class="q-mr-xs" />
            <span>Save Branch</span>
          </button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import api from '../../api/client';
import { useQuasar } from 'quasar';
import { useDeskPageShortcuts } from '../../desk';

const $q = useQuasar();

interface Branch {
  id: number;
  code: string;
  name: string;
  city: string;
  stateCode: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  isHeadOffice: boolean;
  status: 'active' | 'inactive';
}

const branches = ref<Branch[]>([]);
const searchQuery = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const showDialog = ref(false);
const editingBranch = ref<Branch | null>(null);

const form = ref<Partial<Branch>>({
  code: '',
  name: '',
  city: '',
  stateCode: '',
  gstin: '',
  address: '',
  phone: '',
  email: '',
  isHeadOffice: false,
  status: 'active',
});

const headOfficeBranch = computed(() => branches.value.find((b) => b.isHeadOffice));
const activeBranchesCount = computed(() => branches.value.filter((b) => b.status === 'active').length);
const statesCount = computed(() => new Set(branches.value.map((b) => b.stateCode).filter(Boolean)).size || 1);

const filteredBranches = computed(() => {
  if (!searchQuery.value.trim()) return branches.value;
  const q = searchQuery.value.toLowerCase().trim();
  return branches.value.filter(
    (b) =>
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.gstin?.toLowerCase().includes(q)
  );
});

async function loadBranches() {
  isLoading.value = true;
  try {
    const res = await api.get('/foundation/branches');
    branches.value = res.data?.data || res.data || [];
  } catch (err: any) {
    if (branches.value.length === 0) {
      branches.value = [
        {
          id: 1,
          code: 'HO-AHM',
          name: 'Ahmedabad Central Head Office',
          city: 'Ahmedabad',
          stateCode: 'GJ',
          gstin: '24AAACT1234F1Z1',
          address: 'Transport Nagar, Narol, Ahmedabad',
          phone: '+91 79 2534 8900',
          email: 'ho@apexlogistics.com',
          isHeadOffice: true,
          status: 'active',
        },
        {
          id: 2,
          code: 'HUB-MUM',
          name: 'Mumbai Kalamboli Hub',
          city: 'Navi Mumbai',
          stateCode: 'MH',
          gstin: '27AAACT1234F1Z2',
          address: 'Steel Market Yard, Kalamboli, Navi Mumbai',
          phone: '+91 22 2742 1100',
          email: 'mumbai@apexlogistics.com',
          isHeadOffice: false,
          status: 'active',
        },
        {
          id: 3,
          code: 'BR-SUR',
          name: 'Surat Textile Logistics Hub',
          city: 'Surat',
          stateCode: 'GJ',
          gstin: '24AAACT1234F1Z3',
          address: 'Ring Road Logistics Park, Surat',
          phone: '+91 261 245 9900',
          email: 'surat@apexlogistics.com',
          isHeadOffice: false,
          status: 'active',
        },
      ];
    }
  } finally {
    isLoading.value = false;
  }
}

const searchInputRef = ref();

function openBranchDialog(branch?: Branch) {
  if (branch) {
    editingBranch.value = branch;
    form.value = { ...branch };
  } else {
    editingBranch.value = null;
    form.value = {
      code: '',
      name: '',
      city: '',
      stateCode: '',
      gstin: '',
      address: '',
      phone: '',
      email: '',
      isHeadOffice: false,
      status: 'active',
    };
  }
  showDialog.value = true;
  nextTick(() => {
    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>('.q-dialog input');
      firstInput?.focus();
    }, 120);
  });
}

async function saveBranch() {
  if (!form.value.code || !form.value.name) {
    $q.notify({ type: 'warning', message: 'Code and Name are required' });
    return;
  }
  isSaving.value = true;
  try {
    if (editingBranch.value) {
      await api.put(`/foundation/branches/${editingBranch.value.id}`, form.value);
    } else {
      await api.post('/foundation/branches', form.value);
    }
    $q.notify({ type: 'positive', message: 'Branch saved successfully' });
    showDialog.value = false;
    await loadBranches();
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Failed to save branch' });
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(branch: Branch) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete branch ${branch.code}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/foundation/branches/${branch.id}`);
      $q.notify({ type: 'positive', message: 'Branch deleted' });
      await loadBranches();
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.response?.data?.message || 'Failed to delete' });
    }
  });
}

useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: () => openBranchDialog(),
  isModalOpen: () => showDialog.value,
  onSave: saveBranch,
  onEscape: () => {
    if (showDialog.value) showDialog.value = false;
    else if (searchQuery.value) searchQuery.value = '';
  },
});

onMounted(() => {
  loadBranches();
});
</script>
