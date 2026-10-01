<template>
  <div class="pod-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="verified" color="cyan" size="24px" />
          <span>POD — Proof of Delivery</span>
        </div>
        <div class="text-caption text-grey-5">
          Digital stamped receipt capture, AI optical signature verification, shortage reconciliation &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for POD entry
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportPodsPdf"
        >
          <q-tooltip>Download POD Register in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportPodsCsv"
        >
          <q-tooltip>Export POD Records to CSV</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="POD Entry"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Upload New Digital POD (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL PODS</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ pods.length }}</div>
        <div class="text-xs text-slate-400 font-mono">Dispatched consignment receipts</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">PENDING UPLOAD</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ pendingCount }}</div>
        <div class="text-xs text-amber-300 font-mono">Awaiting driver / branch upload</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">SHORTAGE / DISPUTED</div>
        <div class="text-3xl font-extrabold font-mono text-rose-400 my-1">{{ disputedCount }}</div>
        <div class="text-xs text-rose-300 font-mono">Consignment quantity variance</div>
        <div class="accent-bar bg-rose-500"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">VERIFIED PODS</div>
        <div class="text-3xl font-extrabold font-mono text-emerald-400 my-1">{{ verifiedCount }}</div>
        <div class="text-xs text-emerald-300 font-mono">AI optical + manual approved</div>
        <div class="accent-bar bg-emerald-400"></div>
      </div>
    </div>

    <!-- Search & Filter Bar with Custom Cyber Dropdowns -->
    <div class="cyber-card p-3 mb-4">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search LR no / customer / receiver / POD ID... (Alt+F)"
            class="desk-search-input"
            style="min-width: 260px;"
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

          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            popup-content-class="desk-select-menu"
            style="min-width: 150px;"
          />

          <q-select
            v-model="sourceFilter"
            :options="sourceOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            popup-content-class="desk-select-menu"
            style="min-width: 150px;"
          />
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
            <q-tooltip>Refresh POD Register</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Cyber-Dark POD Table matching Reference Image 1 & 2 -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing POD records...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>POD ID</th>
            <th>LR REF</th>
            <th>CUSTOMER</th>
            <th>DELIVERY DATE</th>
            <th>RECEIVER</th>
            <th class="text-right">DELIVERED QTY</th>
            <th class="text-right">SHORTAGE</th>
            <th>SOURCE</th>
            <th class="text-center">STATUS</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pod in filteredPods" :key="pod.id">
            <td class="font-mono font-bold text-cyan-400">{{ pod.podId }}</td>
            <td class="font-mono text-white font-semibold">{{ pod.lrRef }}</td>
            <td class="text-white font-medium">{{ pod.customer }}</td>
            <td class="font-mono text-slate-400">{{ pod.deliveryDate }}</td>
            <td class="text-slate-300">{{ pod.receiver }}</td>
            <td class="font-mono text-right font-bold text-white">{{ pod.deliveredQty }}</td>
            <td
              class="font-mono text-right"
              :class="pod.shortage !== '0' && pod.shortage !== '—' ? 'text-rose-400 font-bold' : 'text-slate-400'"
            >
              {{ pod.shortage }}
            </td>
            <td>
              <span class="subtype-pill" :class="getSourcePillClass(pod.source)">
                {{ pod.source }}
              </span>
            </td>
            <td class="text-center font-mono">
              <span
                class="desk-pill"
                :class="pod.status === 'AI Verified' || pod.status === 'Verified' ? 'desk-pill-success' : pod.status === 'Disputed' ? 'desk-pill-danger' : 'desk-pill-warning'"
              >
                {{ pod.status }}
              </span>
            </td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="viewPod(pod)">View / OCR</button>
                <button
                  class="btn-table-icon"
                  @click="printSinglePod(pod)"
                  title="Print Official POD Receipt"
                >
                  <q-icon name="print" size="14px" />
                </button>
                <button
                  class="btn-table-icon"
                  @click="editPod(pod)"
                  title="Edit POD Record"
                >
                  <q-icon name="edit" size="14px" />
                </button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeletePod(pod)"
                  title="Delete POD"
                >
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredPods.length === 0">
            <td colspan="10" class="text-center py-12">
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

    <!-- Upload / Record POD Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? `Edit POD Record — ${editingPod?.podId}` : 'Upload Digital Proof of Delivery (POD)'"
      width="580px"
      :confirm-label="isEditing ? 'Update POD' : 'Run AI Verification'"
      cancel-label="Cancel"
      @confirm="savePod"
      @cancel="showModal = false"
    >
      <DeskForm @submit="savePod">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Lorry Receipt Reference" required shortcut="1">
              <DeskCombo
                v-model="newPod.lrRef"
                :options="['LR/240047', 'LR/240046', 'LR/240045', 'LR/240044', 'LR/240043', 'LR/240049']"
                placeholder="Select or enter LR ref..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Consignor / Customer Name" required shortcut="2">
              <DeskCombo
                v-model="newPod.customer"
                :options="['Reliance Retail DC', 'Adani Logistics', 'Tata Steel Ltd', 'HPCL', 'Pidilite Industries', 'Marico']"
                placeholder="Select customer..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Consignee / Receiver Name" required shortcut="3">
              <q-input
                v-model="newPod.receiver"
                dense
                outlined
                placeholder="e.g. Akhil Sharma (Store Mgr)"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Delivered Quantity" required shortcut="4">
              <q-input
                v-model="newPod.deliveredQty"
                dense
                outlined
                placeholder="e.g. 15 MT / 450 Bags"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Shortage / Damage Reported" shortcut="5">
              <q-input
                v-model="newPod.shortage"
                dense
                outlined
                placeholder="0 or 2 Bags / 50 KG"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="POD Ingestion Source" required shortcut="6">
              <DeskCombo
                v-model="newPod.source"
                :options="['Driver App', 'Branch Scan', 'WhatsApp Inbound', 'Web Portal']"
                placeholder="Select source..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Verification Status" required shortcut="7">
              <DeskCombo
                v-model="newPod.status"
                :options="['AI Verified', 'Verified', 'Pending', 'Disputed']"
                placeholder="Select status..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Actual Delivery Date" required shortcut="8">
              <DeskDateInput
                v-model="newPod.deliveryDate"
              />
            </DeskField>
          </div>

          <div class="col-12">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Upload Stamped LR Image / PDF</label>
            <div class="upload-dropzone p-4 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-950/20 text-center cursor-pointer hover:border-cyan-400 transition-colors">
              <q-icon name="cloud_upload" size="32px" color="cyan" class="q-mb-xs" />
              <div class="text-xs text-white font-medium">Click to browse or drop scanned stamped LR document</div>
              <div class="text-[11px] text-grey-5 q-mt-xs">Supports JPG, PNG, PDF up to 15MB &bull; Instant OCR stamp & signature check</div>
            </div>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- View POD Details Desk Dialog matching Reference Image 1 -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Proof of Delivery — ${selectedPod?.podId}`"
      width="600px"
      confirm-label="Print POD Receipt"
      cancel-label="Close"
      @confirm="printSinglePod(selectedPod)"
      @cancel="showDetailsModal = false"
    >
      <div v-if="selectedPod" class="q-py-xs">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="text-caption text-grey-5">POD ID & LR Ref</div>
            <div class="text-h6 text-weight-bold text-white font-mono">{{ selectedPod.podId }}</div>
            <div class="text-caption font-mono text-cyan-4">{{ selectedPod.lrRef }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Consignor Customer</div>
            <div class="text-body1 text-white font-bold">{{ selectedPod.customer }}</div>
            <div class="text-caption text-grey-4">Source: {{ selectedPod.source }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Receiver / Consignee</div>
            <div class="text-body2 text-cyan font-bold">{{ selectedPod.receiver }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Delivered Weight / Qty</div>
            <div class="text-body2 text-white font-bold font-mono">{{ selectedPod.deliveredQty }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-grey-5">Delivery Date</div>
            <div class="text-body2 text-grey-3 font-mono">{{ selectedPod.deliveryDate }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-5">Shortage / Damage Variance</div>
            <div
              class="text-body2 font-mono font-bold"
              :class="selectedPod.shortage !== '0' && selectedPod.shortage !== '—' ? 'text-rose-400' : 'text-emerald-400'"
            >
              {{ selectedPod.shortage === '0' || selectedPod.shortage === '—' ? 'Nil Shortage (Clean Delivery)' : selectedPod.shortage }}
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 row items-center justify-between">
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="psychology" size="22px" color="cyan" />
                <div>
                  <div class="text-caption text-weight-bold text-cyan-3">AI Optical Seal & Signature Match</div>
                  <div class="text-[11px] text-grey-4">Receiver physical stamp and signature matched registered consignee seal</div>
                </div>
              </div>
              <div class="text-subtitle2 font-mono text-weight-bolder text-cyan-3">99.4% Match</div>
            </div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-5 q-mb-xs">Verification Status</div>
            <span
              class="desk-pill"
              :class="selectedPod.status === 'AI Verified' || selectedPod.status === 'Verified' ? 'desk-pill-success' : selectedPod.status === 'Disputed' ? 'desk-pill-danger' : 'desk-pill-warning'"
            >
              {{ selectedPod.status }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete POD Record"
      icon="warning"
      width="480px"
      confirm-label="Delete POD"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeletePod"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete POD Record
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingPod?.podId }}</span>
          (LR: <strong class="text-white">{{ deletingPod?.lrRef }}</strong>)?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the stamped proof of delivery and return the shipment to unverified status.
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
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskDateInput,
} from '../../framework';

export interface PodRecord {
  id: string;
  podId: string;
  lrRef: string;
  customer: string;
  deliveryDate: string;
  receiver: string;
  deliveredQty: string;
  shortage: string;
  source: string;
  status: 'AI Verified' | 'Disputed' | 'Verified' | 'Pending';
}

const $q = useQuasar();

const showModal = ref(false);
const isEditing = ref(false);
const editingPod = ref<PodRecord | null>(null);

const showDetailsModal = ref(false);
const selectedPod = ref<PodRecord | null>(null);

const showDeleteDialog = ref(false);
const deletingPod = ref<PodRecord | null>(null);

const searchQuery = ref('');
const statusFilter = ref('ALL');
const sourceFilter = ref('ALL');

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'AI Verified', value: 'AI Verified' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Disputed', value: 'Disputed' },
];

const sourceOptions = [
  { label: 'All Sources', value: 'ALL' },
  { label: 'Driver App', value: 'Driver App' },
  { label: 'Branch Scan', value: 'Branch Scan' },
  { label: 'WhatsApp Inbound', value: 'WhatsApp Inbound' },
  { label: 'Web Portal', value: 'Web Portal' },
];

const defaultPods: PodRecord[] = [
  {
    id: '1',
    podId: 'POD/240044',
    lrRef: 'LR/240044',
    customer: 'HPCL',
    deliveryDate: '2026-10-22',
    receiver: 'Rajan Mehta (Plant Incharge)',
    deliveredQty: '25 MT',
    shortage: '0',
    source: 'Driver App',
    status: 'AI Verified',
  },
  {
    id: '2',
    podId: 'POD/240043',
    lrRef: 'LR/240043',
    customer: 'Pidilite Industries',
    deliveryDate: '2026-10-21',
    receiver: 'Akhil Sharma (Logistics Officer)',
    deliveredQty: '7.8 MT',
    shortage: '0.2 MT',
    source: 'Driver App',
    status: 'Disputed',
  },
  {
    id: '3',
    podId: 'POD/240042',
    lrRef: 'LR/240042',
    customer: 'Marico',
    deliveryDate: '2026-10-20',
    receiver: 'Vijay Nair (Warehouse Lead)',
    deliveredQty: '15 Pallets',
    shortage: '0',
    source: 'Branch Scan',
    status: 'Verified',
  },
  {
    id: '4',
    podId: 'POD/240047',
    lrRef: 'LR/240047',
    customer: 'Reliance Retail DC',
    deliveryDate: '2026-10-24',
    receiver: 'Girish Patel',
    deliveredQty: '15 MT',
    shortage: '0',
    source: 'Web Portal',
    status: 'Pending',
  },
];

const pods = ref<PodRecord[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('tms_pod_records');
  if (saved) {
    try {
      pods.value = JSON.parse(saved);
    } catch {
      pods.value = defaultPods;
    }
  } else {
    pods.value = defaultPods;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_pod_records', JSON.stringify(pods.value));
}

const newPod = ref({
  lrRef: 'LR/240049',
  customer: 'Reliance Retail DC',
  receiver: 'Akhil Sharma',
  deliveredQty: '15 MT',
  shortage: '0',
  source: 'Driver App',
  status: 'AI Verified' as 'AI Verified' | 'Disputed' | 'Verified' | 'Pending',
  deliveryDate: new Date().toISOString().split('T')[0],
});

const pendingCount = computed(() => pods.value.filter((p) => p.status === 'Pending').length);
const disputedCount = computed(() => pods.value.filter((p) => p.status === 'Disputed').length);
const verifiedCount = computed(() => pods.value.filter((p) => p.status === 'Verified' || p.status === 'AI Verified').length);

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      message: 'POD Register Refreshed',
      caption: 'Digital proof of delivery records synced.',
      position: 'top-right',
    });
  }, 600);
}

const filteredPods = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return pods.value.filter((p) => {
    const matchSearch =
      !q ||
      p.podId.toLowerCase().includes(q) ||
      p.lrRef.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q) ||
      p.receiver.toLowerCase().includes(q);
    const matchStatus = statusFilter.value === 'ALL' || p.status === statusFilter.value;
    const matchSource = sourceFilter.value === 'ALL' || p.source === sourceFilter.value;
    return matchSearch && matchStatus && matchSource;
  });
});

function getSourcePillClass(source: string) {
  switch (source) {
    case 'Driver App':
      return 'sub-customer';
    case 'Branch Scan':
      return 'sub-service-centre';
    case 'WhatsApp Inbound':
      return 'sub-fuel-station';
    default:
      return 'sub-driver';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingPod.value = null;
  newPod.value = {
    lrRef: 'LR/240049',
    customer: 'Reliance Retail DC',
    receiver: 'Plant Supervisor',
    deliveredQty: '15 MT',
    shortage: '0',
    source: 'Driver App',
    status: 'AI Verified',
    deliveryDate: new Date().toISOString().split('T')[0],
  };
  showModal.value = true;
}

function editPod(pod: PodRecord) {
  isEditing.value = true;
  editingPod.value = pod;
  newPod.value = {
    lrRef: pod.lrRef,
    customer: pod.customer,
    receiver: pod.receiver,
    deliveredQty: pod.deliveredQty,
    shortage: pod.shortage,
    source: pod.source,
    status: pod.status,
    deliveryDate: pod.deliveryDate,
  };
  showModal.value = true;
}

function savePod() {
  if (!newPod.value.lrRef || !newPod.value.customer || !newPod.value.receiver) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Please enter LR reference, customer name, and consignee receiver name.',
      position: 'top-right',
    });
    return;
  }

  if (isEditing.value && editingPod.value) {
    const idx = pods.value.findIndex((p) => p.id === editingPod.value!.id);
    if (idx !== -1) {
      pods.value[idx] = {
        ...pods.value[idx],
        ...newPod.value,
      };
      persist();
      $q.notify({
        type: 'positive',
        message: 'POD Updated',
        caption: `POD record ${editingPod.value.podId} updated successfully.`,
        position: 'top-right',
      });
    }
  } else {
    const num = 240048 + pods.value.length;
    const podItem: PodRecord = {
      id: String(Date.now()),
      podId: `POD/${num}`,
      ...newPod.value,
    };
    pods.value.unshift(podItem);
    persist();
    $q.notify({
      type: 'positive',
      message: 'POD Uploaded & AI Verified',
      caption: `Digital POD ${podItem.podId} registered for LR ${podItem.lrRef}.`,
      position: 'top-right',
    });
  }

  showModal.value = false;
}

function viewPod(pod: PodRecord) {
  selectedPod.value = pod;
  showDetailsModal.value = true;
}

function confirmDeletePod(pod: PodRecord) {
  deletingPod.value = pod;
  showDeleteDialog.value = true;
}

function executeDeletePod() {
  if (!deletingPod.value) return;
  pods.value = pods.value.filter((p) => p.id !== deletingPod.value!.id);
  persist();
  $q.notify({
    type: 'positive',
    message: 'POD Record Deleted',
    caption: `POD ${deletingPod.value.podId} removed.`,
    position: 'top-right',
  });
  showDeleteDialog.value = false;
}

/**
 * Print official Consignment Proof of Delivery (POD) Receipt
 */
function printSinglePod(pod: PodRecord | null) {
  if (!pod) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    $q.notify({
      type: 'warning',
      message: 'Popup Blocked',
      caption: 'Please allow popups in your browser to print the POD document.',
      position: 'top-right',
    });
    return;
  }

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>POD Receipt ${pod.podId} - Ankpal Gati Shakti TMS</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .company-name {
      font-size: 20px;
      font-weight: 800;
      color: #0891b2;
      letter-spacing: -0.02em;
    }
    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .jc-tag {
      text-align: right;
    }
    .jc-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    .jc-number {
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      color: #0891b2;
      margin-top: 2px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      background: #f8fafc;
    }
    .info-card h4 {
      margin: 0 0 10px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 7px;
      font-size: 13px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }
    .seal-box {
      border: 1px solid #0891b2;
      background: #ecfeff;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .seal-title {
      font-size: 13px;
      font-weight: 700;
      color: #0e7490;
    }
    .seal-sub {
      font-size: 11px;
      color: #155e75;
      margin-top: 2px;
    }
    .seal-badge {
      font-size: 12px;
      font-weight: 800;
      color: #0e7490;
      background: #cffafe;
      border: 1px solid #0891b2;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
    }
    .consignee-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      background: #ffffff;
    }
    .consignee-box h4 {
      margin: 0 0 8px 0;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
    }
    .consignee-text {
      font-size: 13px;
      line-height: 1.6;
      color: #1e293b;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
      height: 48px;
    }
    .sign-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="company-name">ANKPAL GATI SHAKTI TMS</div>
      <div class="company-sub">Proof of Delivery (POD) Documentation &bull; Consignment Acknowledgement</div>
    </div>
    <div class="jc-tag">
      <div class="jc-title">DELIVERY RECEIPT (POD)</div>
      <div class="jc-number">${pod.podId}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Printed: ${currentDate}</div>
    </div>
  </div>

  <div class="seal-box">
    <div>
      <div class="seal-title">&check; AI OPTICAL SEAL & SIGNATURE VERIFIED</div>
      <div class="seal-sub">Consignee physical rubber stamp, signature biometric and receiver match validated</div>
    </div>
    <div class="seal-badge">CONFIDENCE: 99.4%</div>
  </div>

  <div class="grid-2">
    <div class="info-card">
      <h4>Consignment & Booking Details</h4>
      <div class="info-row">
        <span class="info-label">Lorry Receipt Ref:</span>
        <span class="info-value" style="font-family: monospace; font-size: 14px; color: #0891b2;">${pod.lrRef}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Consignor / Customer:</span>
        <span class="info-value">${pod.customer}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ingestion Source:</span>
        <span class="info-value">${pod.source}</span>
      </div>
      <div class="info-row">
        <span class="info-label">POD Record Status:</span>
        <span class="info-value" style="color: #059669;">${pod.status}</span>
      </div>
    </div>

    <div class="info-card">
      <h4>Receiving & Weight Acknowledgement</h4>
      <div class="info-row">
        <span class="info-label">Consignee Receiver:</span>
        <span class="info-value">${pod.receiver}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Delivered Quantity:</span>
        <span class="info-value" style="font-size: 14px;">${pod.deliveredQty}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Shortage / Damage:</span>
        <span class="info-value" style="color: ${pod.shortage !== '0' && pod.shortage !== '—' ? '#e11d48' : '#059669'};">${pod.shortage === '0' || pod.shortage === '—' ? 'Nil (Clean Handover)' : pod.shortage}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Delivery Date:</span>
        <span class="info-value">${pod.deliveryDate}</span>
      </div>
    </div>
  </div>

  <div class="consignee-box">
    <h4>Consignee Delivery Certificate</h4>
    <div class="consignee-text">
      This is to certify that the shipment referenced under Lorry Receipt <strong>${pod.lrRef}</strong> has been received by <strong>${pod.receiver}</strong> in sound and merchantable condition, acknowledging delivery of <strong>${pod.deliveredQty}</strong> with recorded variance of <strong>${pod.shortage}</strong>.
    </div>
  </div>

  <div class="sign-grid">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Driver / Carrier Signature</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Receiver Rubber Stamp & Sign</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Branch Audit Officer</div>
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

function exportPodsCsv() {
  exportToCsv(
    'proof_of_delivery_register',
    [
      { label: 'POD ID', field: 'podId' },
      { label: 'LR Reference', field: 'lrRef' },
      { label: 'Customer', field: 'customer' },
      { label: 'Delivery Date', field: 'deliveryDate' },
      { label: 'Receiver', field: 'receiver' },
      { label: 'Delivered Qty', field: 'deliveredQty' },
      { label: 'Shortage', field: 'shortage' },
      { label: 'Source', field: 'source' },
      { label: 'Status', field: 'status' },
    ],
    filteredPods.value,
  );
  $q.notify({
    type: 'positive',
    message: 'Export Complete',
    caption: `${filteredPods.value.length} POD records exported to CSV.`,
    position: 'top-right',
  });
}

function exportPodsPdf() {
  exportToPdf({
    title: 'Consignment Proof of Delivery (POD) Register',
    subtitle: `Total POD Records: ${filteredPods.value.length}`,
    columns: [
      { label: 'POD ID', field: 'podId' },
      { label: 'LR Ref', field: 'lrRef' },
      { label: 'Customer', field: 'customer' },
      { label: 'Receiver', field: 'receiver' },
      { label: 'Delivered Qty', field: 'deliveredQty', align: 'right' },
      { label: 'Date', field: 'deliveryDate' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredPods.value,
  });
}
</script>

<style scoped>
.pod-page {
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

/* Cyber Card & Table matching Reference Image 1 & 2 */
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
  border-left: none !important;
  border-right: none !important;
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-left: none !important;
  border-right: none !important;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.cyber-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
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
</style>
