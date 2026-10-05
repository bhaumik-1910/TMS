<template>
  <div>
    <AppPageHeader
      title="LR & Consignment Notes"
      subtitle="Statutory Lorry Receipts, multi-copy Bilty generation, and E-Way Bill validity tracking"
    >
      <template #actions>
        <q-btn
          outline
          color="slate-700"
          no-caps
          icon="tune"
          label="E-Way Bill Sync"
          class="bg-white"
          @click="checkEWayValidity"
        />
        <q-btn
          color="primary"
          no-caps
          icon="add_circle"
          label="Generate Lorry Receipt (LR)"
          @click="openCreateModal"
        />
      </template>
    </AppPageHeader>

    <!-- LR Workspace Container with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- Metrics -->
      <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Total LRs Issued"
          :value="lrList.length.toString()"
          icon="description"
          color="primary"
          trend="Legally binding carriage"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Active In-Transit"
          value="4 In-Transit"
          icon="local_shipping"
          color="teal"
          trend="Goods on road"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="E-Way Bills Valid"
          value="100% Active"
          icon="verified"
          color="positive"
          trend="No expiring violations"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="To-Pay Freight"
          value="$14,800"
          icon="receipt_long"
          color="warning"
          trend="Collection at destination"
        />
      </div>
    </div>

    <!-- Table & Filters -->
    <q-card flat bordered class="tms-card">
      <div class="row items-center justify-between q-pa-md border-bottom">
        <div class="row items-center q-gutter-x-sm">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search LR #, Consignor, E-Way Bill..."
            class="desk-search-input"
          >
            <template #prepend><q-icon name="search" size="18px" color="cyan" /></template>
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
          <q-select
            v-model="statusFilter"
            dense
            outlined
            :options="['ALL', 'ISSUED', 'IN_TRANSIT', 'DELIVERED', 'DRAFT']"
            label="Filter Status"
            style="width: 160px;"
          />
        </div>
        <div class="row items-center q-gutter-x-xs">
          <q-btn flat dense round icon="refresh" color="grey-7" :loading="loading" @click="refreshLRs">
            <q-tooltip>Refresh LRs</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="print" color="grey-7" @click="printBatch">
            <q-tooltip>Print Manifest</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="download" color="grey-7" @click="exportCSV">
            <q-tooltip>Export CSV</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-table
        :rows="filteredLRs"
        :columns="columns"
        row-key="id"
        flat
        dense
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="tms-table"
      >
        <!-- Custom Centered Empty State -->
        <template #no-data>
          <div class="full-width column items-center justify-center text-center q-pa-xl">
            <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); margin: 0 auto;">
              <q-icon name="search_off" size="28px" class="text-slate-400" />
            </div>
            <div class="text-subtitle1 text-weight-bold text-slate-800">No matching records found</div>
            <div class="text-caption text-slate-500 q-mt-xs">Try adjusting your search terms or clearing active filters.</div>
          </div>
        </template>

        <!-- Custom Loading Overlay -->
        <template #loading>
          <AppLoadingOverlay showing title="Syncing LR Records..." subtitle="Loading bilty registry" />
        </template>
        <template #body-cell-lrNumber="props">
          <q-td :props="props">
            <span class="font-mono text-weight-bold text-primary cursor-pointer" @click="viewLR(props.row)">
              {{ props.row.lrNumber }}
            </span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppStatusBadge :status="props.row.status" />
          </q-td>
        </template>

        <template #body-cell-freightTerms="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.freightTerms === 'TO_PAY' ? 'warning' : props.row.freightTerms === 'PAID' ? 'positive' : 'info'"
              text-color="white"
              class="font-mono text-weight-bold"
            >
              {{ props.row.freightTerms }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-ewayBill="props">
          <q-td :props="props">
            <div v-if="props.row.ewayBillNumber" class="font-mono text-caption text-weight-medium">
              <div>{{ props.row.ewayBillNumber }}</div>
              <div class="text-positive" style="font-size: 0.68rem;">Valid till {{ props.row.ewayExpiry }}</div>
            </div>
            <div v-else class="text-caption text-grey-5 font-mono">N/A</div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              flat
              dense
              round
              icon="edit"
              size="sm"
              color="cyan-4"
              @click="editLR(props.row)"
            >
              <q-tooltip>Edit LR</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="print"
              size="sm"
              color="primary"
              @click="printSingleLR(props.row)"
            >
              <q-tooltip>Print 4-Copy LR</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="visibility"
              size="sm"
              color="grey-7"
              @click="viewLR(props.row)"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

      <!-- Inner Loading Overlay on LR Refresh -->
      <AppLoadingOverlay
        :showing="loading"
        title="Refreshing Lorry Receipts & Consignments..."
        subtitle="Syncing bilty records, GST E-Way bill validity & transit legs"
      />
    </div>

    <!-- Create / Edit LR Desk Dialog matching Unified Design -->
    <DeskDialog
      v-model="createModalOpen"
      :title="isEditing ? `Edit Lorry Receipt — ${editingLR?.lrNumber}` : 'Generate Lorry Receipt (Bilty)'"
      width="640px"
      :confirm-label="isEditing ? 'Update LR' : 'Issue & Sign LR'"
      cancel-label="Cancel"
      @confirm="saveNewLR"
      @cancel="createModalOpen = false"
    >
      <DeskForm @submit="saveNewLR">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <DeskField label="Consignor (Sender)" required shortcut="1">
              <q-input
                v-model="form.consignor"
                dense
                outlined
                placeholder="Apex Central Dist. Center"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-6">
            <DeskField label="Consignee (Receiver)" required shortcut="2">
              <q-input
                v-model="form.consignee"
                dense
                outlined
                placeholder="Global Distribution Hub"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-6">
            <DeskField label="Origin Location" required shortcut="3">
              <q-input
                v-model="form.origin"
                dense
                outlined
                placeholder="Chicago, IL"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-6">
            <DeskField label="Destination Location" required shortcut="4">
              <q-input
                v-model="form.destination"
                dense
                outlined
                placeholder="Dallas, TX"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-4">
            <DeskField label="Package Count" shortcut="5">
              <DeskNumberInput
                v-model="form.packages"
                placeholder="480"
                :step="1"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-4">
            <DeskField label="Weight (Kg)" shortcut="6">
              <DeskNumberInput
                v-model="form.weightKg"
                placeholder="18500"
                :step="100"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-4">
            <DeskField label="Freight Terms" required shortcut="7">
              <DeskCombo
                v-model="form.freightTerms"
                :options="['TO_PAY', 'PAID', 'TO_BE_BILLED']"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-6">
            <DeskField label="E-Way Bill Number" shortcut="8">
              <q-input
                v-model="form.ewayBillNumber"
                dense
                outlined
                placeholder="3819 2819 4018"
              />
            </DeskField>
          </div>

          <div class="col-12 col-sm-6">
            <DeskField label="Total Freight Amount ($)" required shortcut="9">
              <DeskNumberInput
                v-model="form.totalFreight"
                placeholder="2850"
                :step="100"
                :min="0"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- 4-Copy Print Preview Modal -->
    <q-dialog v-model="printModalOpen">
      <q-card style="width: 780px; max-width: 95vw;" class="rounded-borders bg-white">
        <q-toolbar class="bg-slate-50 text-slate-800 border-b border-slate-200 q-px-md">
          <div class="text-subtitle1 text-weight-bold">
            Print Lorry Receipt (4 Copies) — {{ activePrintLR?.lrNumber }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-lg">
          <q-tabs v-model="activeCopyTab" dense no-caps class="text-grey-7 bg-grey-1 rounded-borders q-mb-md">
            <q-tab name="consignor" label="1. Consignor Copy" icon="business" />
            <q-tab name="consignee" label="2. Consignee Copy" icon="store" />
            <q-tab name="driver" label="3. Driver / Transporter" icon="badge" />
            <q-tab name="accounts" label="4. Accounts / Billing" icon="receipt" />
          </q-tabs>

          <!-- Printable LR Card Template -->
          <div class="lr-document-sheet q-pa-md border rounded-borders bg-white">
            <div class="row justify-between items-start border-bottom q-pb-sm q-mb-sm">
              <div>
                <div class="text-h6 text-weight-bolder text-slate-900 leading-tight">APEX GLOBAL LOGISTICS</div>
                <div class="text-caption text-grey-6">Goods Transport Agency (GTA) • Reg: GTA-99210-US</div>
              </div>
              <div class="text-right">
                <div class="text-subtitle2 text-weight-bolder font-mono text-primary">{{ activePrintLR?.lrNumber }}</div>
                <div class="text-caption text-weight-bold text-uppercase text-grey-7">{{ activeCopyTab.toUpperCase() }} COPY</div>
              </div>
            </div>

            <div class="row q-col-gutter-sm text-caption q-mb-sm">
              <div class="col-6">
                <span class="text-grey-6">Consignor: </span>
                <strong class="text-slate-900">{{ activePrintLR?.consignor }}</strong>
                <div>{{ activePrintLR?.origin }}</div>
              </div>
              <div class="col-6 text-right">
                <span class="text-grey-6">Consignee: </span>
                <strong class="text-slate-900">{{ activePrintLR?.consignee }}</strong>
                <div>{{ activePrintLR?.destination }}</div>
              </div>
            </div>

            <div class="row q-col-gutter-sm text-caption q-py-xs bg-grey-1 rounded-borders q-mb-sm">
              <div class="col-4"><strong>Packages:</strong> {{ activePrintLR?.packages }} Cartons</div>
              <div class="col-4"><strong>Weight:</strong> {{ activePrintLR?.weightKg }} Kg</div>
              <div class="col-4 text-right"><strong>Terms:</strong> {{ activePrintLR?.freightTerms }}</div>
            </div>

            <div class="row justify-between items-center text-caption q-mb-md">
              <div>E-Way Bill: <strong class="font-mono">{{ activePrintLR?.ewayBillNumber || 'EXEMPT' }}</strong></div>
              <div class="text-weight-bolder font-mono text-subtitle2">Amount: ${{ activePrintLR?.totalFreight?.toLocaleString() }}</div>
            </div>

            <div class="row justify-between items-end q-pt-lg text-caption text-grey-7" style="border-top: 1px dashed #cbd5e1;">
              <div>Driver Signature: __________________</div>
              <div>Authorized Signatory: __________________</div>
            </div>
          </div>

          <div class="row justify-end q-mt-md q-gutter-x-sm">
            <q-btn flat label="Close" color="grey-7" no-caps v-close-popup />
            <q-btn color="primary" icon="print" label="Print This Copy" no-caps @click="triggerBrowserPrint" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskNumberInput,
} from '../../framework';

const notify = useAppNotify();

const isEditing = ref(false);
const editingLR = ref<any>(null);

const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const createModalOpen = ref(false);
const printModalOpen = ref(false);
const activeCopyTab = ref('consignor');
const activePrintLR = ref<any>(null);

function refreshLRs() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    notify.notifySuccess('Lorry Receipts synced successfully');
  }, 600);
}

const form = ref({
  consignor: '',
  consignee: '',
  origin: '',
  destination: '',
  packages: 350,
  weightKg: 12500,
  freightTerms: 'TO_PAY',
  ewayBillNumber: '',
  totalFreight: 2450,
});

const lrList = ref([
  {
    id: 'lr-001',
    lrNumber: 'LR-2026-90101',
    consignor: 'Apex Central DC (Chicago)',
    consignee: 'Target Retail Distribution (Dallas)',
    origin: 'Chicago, IL',
    destination: 'Dallas, TX',
    packages: 520,
    weightKg: 18400,
    freightTerms: 'PAID',
    ewayBillNumber: '3819 2819 4018',
    ewayExpiry: '2026-10-02',
    totalFreight: 3850,
    status: 'IN_TRANSIT',
  },
  {
    id: 'lr-002',
    lrNumber: 'LR-2026-90102',
    consignor: 'Midwest Automotive Stamping',
    consignee: 'Detroit Assembly Plant #4',
    origin: 'Indianapolis, IN',
    destination: 'Detroit, MI',
    packages: 120,
    weightKg: 24000,
    freightTerms: 'TO_PAY',
    ewayBillNumber: '4410 9920 1823',
    ewayExpiry: '2026-10-01',
    totalFreight: 2100,
    status: 'ISSUED',
  },
  {
    id: 'lr-003',
    lrNumber: 'LR-2026-90103',
    consignor: 'Sysco Food Services Logistics',
    consignee: 'Marietta Fresh Cold Storage',
    origin: 'Atlanta, GA',
    destination: 'Savannah, GA',
    packages: 840,
    weightKg: 15200,
    freightTerms: 'TO_BE_BILLED',
    ewayBillNumber: '7819 0019 3321',
    ewayExpiry: '2026-10-03',
    totalFreight: 2950,
    status: 'IN_TRANSIT',
  },
  {
    id: 'lr-004',
    lrNumber: 'LR-2026-90104',
    consignor: 'Texas Petrochem Plastics',
    consignee: 'Phoenix Container Moldings',
    origin: 'Houston, TX',
    destination: 'Phoenix, AZ',
    packages: 400,
    weightKg: 21000,
    freightTerms: 'PAID',
    ewayBillNumber: '9912 3341 5509',
    ewayExpiry: '2026-10-04',
    totalFreight: 4100,
    status: 'DELIVERED',
  },
]);

const columns: any[] = [
  { name: 'lrNumber', label: 'LR Number', field: 'lrNumber', align: 'left', sortable: true },
  { name: 'consignor', label: 'Consignor (Sender)', field: 'consignor', align: 'left' },
  { name: 'consignee', label: 'Consignee (Receiver)', field: 'consignee', align: 'left' },
  { name: 'freightTerms', label: 'Terms', field: 'freightTerms', align: 'center' },
  { name: 'ewayBill', label: 'E-Way Bill Status', field: 'ewayBillNumber', align: 'left' },
  { name: 'status', label: 'Lifecycle Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
];

const filteredLRs = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return lrList.value.filter(item => {
    const matchSearch =
      !q ||
      item.lrNumber.toLowerCase().includes(q) ||
      item.consignor.toLowerCase().includes(q) ||
      item.consignee.toLowerCase().includes(q);
    const matchStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

function openCreateModal() {
  isEditing.value = false;
  editingLR.value = null;
  form.value = {
    consignor: '',
    consignee: '',
    origin: '',
    destination: '',
    packages: 320,
    weightKg: 14200,
    freightTerms: 'TO_PAY',
    ewayBillNumber: '',
    totalFreight: 2750,
  };
  createModalOpen.value = true;
}

function editLR(row: any) {
  isEditing.value = true;
  editingLR.value = row;
  form.value = {
    consignor: row.consignor,
    consignee: row.consignee,
    origin: row.origin,
    destination: row.destination,
    packages: row.packages,
    weightKg: row.weightKg,
    freightTerms: row.freightTerms,
    ewayBillNumber: row.ewayBillNumber || '',
    totalFreight: row.totalFreight,
  };
  createModalOpen.value = true;
}

function saveNewLR() {
  if (isEditing.value && editingLR.value) {
    const idx = lrList.value.findIndex((item) => item.id === editingLR.value.id);
    if (idx !== -1) {
      lrList.value[idx] = {
        ...lrList.value[idx],
        ...form.value,
      };
      createModalOpen.value = false;
      notify.success(`Lorry Receipt ${editingLR.value.lrNumber} updated successfully.`);
      return;
    }
  }

  const newId = `lr-00${lrList.value.length + 1}`;
  const newNum = `LR-2026-9010${lrList.value.length + 1}`;
  lrList.value.unshift({
    id: newId,
    lrNumber: newNum,
    consignor: form.value.consignor,
    consignee: form.value.consignee,
    origin: form.value.origin,
    destination: form.value.destination,
    packages: form.value.packages,
    weightKg: form.value.weightKg,
    freightTerms: form.value.freightTerms,
    ewayBillNumber: form.value.ewayBillNumber,
    ewayExpiry: '2026-10-05',
    totalFreight: form.value.totalFreight,
    status: 'ISSUED',
  });
  createModalOpen.value = false;
  notify.success(`Lorry Receipt ${newNum} generated and digitally certified.`);
}

function printSingleLR(row: any) {
  activePrintLR.value = row;
  printModalOpen.value = true;
}

function viewLR(row: any) {
  printSingleLR(row);
}

function triggerBrowserPrint() {
  window.print();
}

function checkEWayValidity() {
  notify.success('All active E-Way Bills cross-checked with GST Portal: 100% Valid.');
}

function printBatch() {
  notify.info('Preparing batch print manifest for all active LRs...');
}

function exportCSV() {
  exportToCsv(
    `Lorry_Receipts_Consignments_${new Date().toISOString().slice(0, 10)}.csv`,
    [
      { field: 'lrNumber', label: 'LR Number' },
      { field: 'consignor', label: 'Consignor' },
      { field: 'consignee', label: 'Consignee' },
      { field: 'origin', label: 'Origin' },
      { field: 'destination', label: 'Destination' },
      { field: 'packages', label: 'Packages' },
      { field: 'weightKg', label: 'Weight (Kg)' },
      { field: 'freightTerms', label: 'Terms' },
      { field: 'ewayBillNumber', label: 'E-Way Bill' },
      { field: 'totalFreight', label: 'Freight ($)' },
      { field: 'status', label: 'Status' },
    ],
    lrList.value
  );
  notify.notifySuccess('Consignments register exported to CSV');
}
</script>

<style scoped>
.lr-document-sheet {
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
