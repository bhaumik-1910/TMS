<template>
  <div class="pod-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header matching Image 1 -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-white relative inline-block">
          POD — Proof of Delivery
          <div class="title-underline"></div>
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <button
          type="button"
          class="desk-btn-cyan-action"
          @click="openAddDialog"
        >
          <q-icon name="add" size="18px" />
          <span>POD Entry</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Stat Cards matching Image 1 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card stat-card--active p-4 rounded-xl border border-cyan-500/40 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL PODS</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">{{ pods.length }}</div>
        <div class="text-xs text-slate-400 font-mono">This month</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">PENDING POD</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ pendingCount }}</div>
        <div class="text-xs text-amber-300 font-mono">Awaiting upload</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">DISPUTED</div>
        <div class="text-3xl font-extrabold font-mono text-rose-400 my-1">{{ disputedCount }}</div>
        <div class="text-xs text-rose-300 font-mono">Shortage / damage</div>
        <div class="accent-bar bg-rose-500"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">VERIFIED</div>
        <div class="text-3xl font-extrabold font-mono text-emerald-400 my-1">{{ verifiedCount }}</div>
        <div class="text-xs text-emerald-300 font-mono">AI + manual verified</div>
        <div class="accent-bar bg-emerald-400"></div>
      </div>
    </div>

    <!-- Search Bar matching Image 1 -->
    <div class="mb-4">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        placeholder="Search LR no / customer..."
        class="desk-search-input"
        style="max-width: 320px;"
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
    </div>

    <!-- Table matching Image 1 -->
    <div class="cyber-card table-wrap relative-position">
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Proof of Delivery..."
        subtitle="Loading records from database"
      />
      <table class="cyber-table">
        <thead>
          <tr>
            <th>POD ID</th>
            <th>LR REF</th>
            <th>CUSTOMER</th>
            <th>DELIVERY DATE</th>
            <th>RECEIVER</th>
            <th>DELIVERED QTY</th>
            <th>SHORTAGE</th>
            <th>SOURCE</th>
            <th>STATUS</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pod in filteredPods" :key="pod.id || pod.podId">
            <td class="font-mono font-bold text-cyan-400">{{ pod.podId }}</td>
            <td class="font-mono text-slate-300">{{ pod.lrRef }}</td>
            <td class="text-slate-200">{{ pod.customer }}</td>
            <td class="font-mono text-slate-400">{{ pod.deliveryDate || '—' }}</td>
            <td class="text-slate-300">{{ pod.receiver || '—' }}</td>
            <td class="font-mono text-slate-300">{{ pod.deliveredQty || '—' }}</td>
            <td class="font-mono text-slate-300">{{ pod.shortage || '—' }}</td>
            <td class="text-slate-300">{{ pod.source || '—' }}</td>
            <td>
              <span class="status-pill" :class="getStatusPillClass(pod.status)">
                {{ pod.status }}
              </span>
            </td>
            <td class="text-center">
              <button class="btn-table-action" @click="editPod(pod)">Edit</button>
            </td>
          </tr>
          <tr v-if="filteredPods.length === 0">
            <td colspan="10" class="text-center py-12 text-slate-400">
              No matching POD records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right Drawer: New / Edit POD Entry matching Image 2 -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? 'Edit POD Entry' : 'New POD Entry'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="savePod"
      @cancel="showModal = false"
    >
      <DeskForm @submit="savePod">
        <div class="row q-col-gutter-md">
          <!-- SECTION 1: POD INFO -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
              POD INFO
            </div>
          </div>

          <!-- Row 1: POD ID & LR REFERENCE -->
          <div class="col-12 col-md-6">
            <DeskField label="POD ID" required>
              <q-input
                v-model="podForm.podId"
                dense
                outlined
                placeholder="POD/240048"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LR REFERENCE" required>
              <q-input
                v-model="podForm.lrRef"
                dense
                outlined
                placeholder="LR/240048"
              />
            </DeskField>
          </div>

          <!-- Row 2: CUSTOMER & DELIVERY DATE -->
          <div class="col-12 col-md-6">
            <DeskField label="CUSTOMER" required>
              <q-select
                v-model="podForm.customer"
                :options="customerOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DELIVERY DATE" required>
              <q-input
                v-model="podForm.deliveryDate"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <!-- SECTION 2: DELIVERY DETAILS -->
          <div class="col-12 q-mt-sm">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
              DELIVERY DETAILS
            </div>
          </div>

          <!-- Row 1: RECEIVER NAME & DELIVERED QUANTITY -->
          <div class="col-12 col-md-6">
            <DeskField label="RECEIVER NAME" required>
              <q-input
                v-model="podForm.receiver"
                dense
                outlined
                placeholder="Person who received goods"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DELIVERED QUANTITY" required>
              <q-input
                v-model="podForm.deliveredQty"
                dense
                outlined
                placeholder="25 MT / 500 Bags"
              />
            </DeskField>
          </div>

          <!-- Row 2: SHORTAGE QUANTITY & POD SOURCE -->
          <div class="col-12 col-md-6">
            <DeskField label="SHORTAGE QUANTITY">
              <q-input
                v-model="podForm.shortage"
                dense
                outlined
                placeholder="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="POD SOURCE" required>
              <q-select
                v-model="podForm.source"
                :options="sourceOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 3: STATUS -->
          <div class="col-12 col-md-6">
            <DeskField label="STATUS" required>
              <q-select
                v-model="podForm.status"
                :options="statusOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 4: DAMAGE / SHORTAGE REMARKS -->
          <div class="col-12">
            <DeskField label="DAMAGE / SHORTAGE REMARKS">
              <q-input
                v-model="podForm.remarks"
                type="textarea"
                rows="3"
                dense
                outlined
                placeholder="Note any shortage, damage, or receiver remarks..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import {
  DeskDialog,
  DeskForm,
  DeskField,
} from '../../framework';

export interface PodRecord {
  id?: string;
  podId: string;
  lrRef: string;
  customer: string;
  deliveryDate: string;
  receiver: string;
  deliveredQty: string;
  shortage: string;
  source: string;
  status: string;
  remarks?: string;
}

const notify = useAppNotify();

const showModal = ref(false);
const isEditing = ref(false);
const editingPod = ref<PodRecord | null>(null);

const searchQuery = ref('');
const isRefreshing = ref(false);

// Dropdown options matching Image 3, 4, 5
const customerOptions = [
  '— Select —',
  'Reliance',
  'Adani Logistics',
  'HPCL',
  'Tata Steel Ltd',
  'Pidilite Industries',
  'Marico',
];

const sourceOptions = [
  '— Select —',
  'Driver App',
  'Branch Scan',
  'Customer Upload',
  'WhatsApp',
];

const statusOptions = [
  '— Select —',
  'Pending',
  'Uploaded',
  'Verified',
  'AI Verified',
  'Disputed',
];

// Seeded Default PODs matching Image 1
const defaultPods: PodRecord[] = [
  {
    id: 'POD/240044',
    podId: 'POD/240044',
    lrRef: 'LR/240044',
    customer: 'HPCL',
    deliveryDate: '2026-10-22',
    receiver: 'Rajan Mehta',
    deliveredQty: '25 MT',
    shortage: '0',
    source: 'Driver App',
    status: 'AI Verified',
  },
  {
    id: 'POD/240043',
    podId: 'POD/240043',
    lrRef: 'LR/240043',
    customer: 'Pidilite Industries',
    deliveryDate: '2026-10-21',
    receiver: 'Akhil Sharma',
    deliveredQty: '7.8 MT',
    shortage: '0.2 MT',
    source: 'Driver App',
    status: 'Disputed',
  },
  {
    id: 'POD/240042',
    podId: 'POD/240042',
    lrRef: 'LR/240042',
    customer: 'Marico',
    deliveryDate: '2026-10-20',
    receiver: 'Vijay Nair',
    deliveredQty: '15 Pallets',
    shortage: '0',
    source: 'Branch Scan',
    status: 'Verified',
  },
  {
    id: 'POD/240047',
    podId: 'POD/240047',
    lrRef: 'LR/240047',
    customer: 'Reliance',
    deliveryDate: '—',
    receiver: '—',
    deliveredQty: '—',
    shortage: '—',
    source: '—',
    status: 'Pending',
  },
];

const pods = ref<PodRecord[]>([]);

const podForm = ref<PodRecord>({
  podId: 'POD/240048',
  lrRef: 'LR/240048',
  customer: '— Select —',
  deliveryDate: new Date().toISOString().slice(0, 10),
  receiver: '',
  deliveredQty: '',
  shortage: '0',
  source: 'Driver App',
  status: 'Pending',
  remarks: '',
});

onMounted(async () => {
  await loadPods();
});

async function loadPods() {
  isRefreshing.value = true;
  try {
    const res = await api.get('/api/v1/pod');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      pods.value = res.data;
    } else {
      pods.value = [...defaultPods];
    }
  } catch (err) {
    console.warn('API error, falling back to local:', err);
    const saved = localStorage.getItem('tms_pod_records_list');
    if (saved) {
      try {
        pods.value = JSON.parse(saved);
      } catch {
        pods.value = [...defaultPods];
      }
    } else {
      pods.value = [...defaultPods];
    }
  } finally {
    isRefreshing.value = false;
  }
}

function persistLocal() {
  localStorage.setItem('tms_pod_records_list', JSON.stringify(pods.value));
}

// KPI Counts
const pendingCount = computed(() => pods.value.filter((p) => p.status === 'Pending').length);
const disputedCount = computed(() => pods.value.filter((p) => p.status === 'Disputed').length);
const verifiedCount = computed(() => pods.value.filter((p) => p.status === 'Verified' || p.status === 'AI Verified').length);

const filteredPods = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return pods.value.filter((p) => {
    const podId = (p.podId || '').toLowerCase();
    const lr = (p.lrRef || '').toLowerCase();
    const cust = (p.customer || '').toLowerCase();
    const rec = (p.receiver || '').toLowerCase();
    return !q || podId.includes(q) || lr.includes(q) || cust.includes(q) || rec.includes(q);
  });
});

function getStatusPillClass(status: string): string {
  switch (status) {
    case 'AI Verified':
    case 'Verified':
      return 'status-pill--verified';
    case 'Disputed':
      return 'status-pill--disputed';
    case 'Pending':
      return 'status-pill--pending';
    case 'Uploaded':
      return 'status-pill--uploaded';
    default:
      return 'status-pill--default';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingPod.value = null;
  const seq = 240048 + pods.value.length;
  podForm.value = {
    id: `POD/${seq}`,
    podId: `POD/${seq}`,
    lrRef: `LR/${seq}`,
    customer: '— Select —',
    deliveryDate: new Date().toISOString().slice(0, 10),
    receiver: '',
    deliveredQty: '',
    shortage: '0',
    source: 'Driver App',
    status: 'Pending',
    remarks: '',
  };
  showModal.value = true;
}

function editPod(pod: PodRecord) {
  isEditing.value = true;
  editingPod.value = pod;
  podForm.value = {
    id: pod.id || pod.podId,
    podId: pod.podId,
    lrRef: pod.lrRef,
    customer: pod.customer || '— Select —',
    deliveryDate: pod.deliveryDate && pod.deliveryDate !== '—' ? pod.deliveryDate : new Date().toISOString().slice(0, 10),
    receiver: pod.receiver && pod.receiver !== '—' ? pod.receiver : '',
    deliveredQty: pod.deliveredQty && pod.deliveredQty !== '—' ? pod.deliveredQty : '',
    shortage: pod.shortage && pod.shortage !== '—' ? pod.shortage : '0',
    source: pod.source && pod.source !== '—' ? pod.source : 'Driver App',
    status: pod.status || 'Pending',
    remarks: pod.remarks || '',
  };
  showModal.value = true;
}

async function savePod() {
  if (
    !podForm.value.podId ||
    !podForm.value.lrRef ||
    podForm.value.customer === '— Select —' ||
    podForm.value.source === '— Select —' ||
    podForm.value.status === '— Select —'
  ) {
    notify.warning('Please enter POD ID, LR Reference, Customer, Source, and Status.');
    return;
  }

  const payload: PodRecord = {
    ...podForm.value,
    id: podForm.value.podId,
  };

  try {
    if (isEditing.value && editingPod.value) {
      const editId = editingPod.value.id || editingPod.value.podId;
      await api.patch(`/api/v1/pod/${editId}`, payload);
      const idx = pods.value.findIndex((p) => (p.id || p.podId) === editId);
      if (idx !== -1) {
        pods.value[idx] = { ...pods.value[idx], ...payload };
      }
      notify.success(`POD ${payload.podId} updated successfully.`);
    } else {
      await api.post('/api/v1/pod', payload);
      pods.value.unshift(payload);
      notify.success(`POD ${payload.podId} recorded in database.`);
    }
    persistLocal();
  } catch (err: any) {
    console.warn('API error, falling back to local:', err);
    if (isEditing.value && editingPod.value) {
      const editId = editingPod.value.id || editingPod.value.podId;
      const idx = pods.value.findIndex((p) => (p.id || p.podId) === editId);
      if (idx !== -1) {
        pods.value[idx] = { ...pods.value[idx], ...payload };
      }
      notify.success(`POD ${payload.podId} updated locally.`);
    } else {
      pods.value.unshift(payload);
      notify.success(`POD ${payload.podId} saved locally.`);
    }
    persistLocal();
  }

  showModal.value = false;
}
</script>

<style scoped>
.pod-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.title-underline {
  height: 3px;
  background: #00e5ff;
  width: 32px;
  margin-top: 5px;
  border-radius: 2px;
}

.desk-btn-cyan-action {
  background: #00e5ff;
  color: #020617;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.desk-btn-cyan-action:hover {
  background: #33ebff;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
}

.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card--active {
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.15);
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #00e5ff;
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
}

/* Cyber Card & Table matching Image 1 */
.cyber-card {
  background: #090f1d;
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
  color: #00e5ff;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.84rem;
}

.cyber-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
}

/* Status Pills matching Image 1 */
.status-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
}

.status-pill--verified {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pill--disputed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pill--pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-pill--uploaded {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-pill--default {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-table-action {
  height: 28px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid rgba(0, 229, 255, 0.4);
  background: rgba(0, 229, 255, 0.08);
  color: #00e5ff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-table-action:hover {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
}
</style>
