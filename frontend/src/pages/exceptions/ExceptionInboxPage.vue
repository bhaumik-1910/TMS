<template>
  <div class="exception-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Exception Inbox</h1>
        <div class="accent-line"></div>
      </div>
      <div class="header-stats">
        <span class="unresolved-badge">
          <span class="material-icons-outlined text-sm">error_outline</span>
          {{ activeExceptions.length }} Action Required
        </span>
      </div>
    </div>

    <!-- Filter Category Chips -->
    <div class="filter-pills-row">
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-pill"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Exceptions Feed -->
    <div class="exceptions-list">
      <div
        v-for="item in filteredExceptions"
        :key="item.id"
        class="exception-card"
        :class="{ 'resolved-card': item.resolved }"
      >
        <div class="card-left-icon">
          <span class="material-icons-outlined alert-icon" :class="item.severity.toLowerCase()">
            {{ item.resolved ? 'check_circle' : 'notifications_active' }}
          </span>
        </div>

        <div class="card-main-content">
          <div class="meta-row">
            <span class="badge-type">{{ item.category }}</span>
            <span class="badge-severity" :class="'badge-' + item.severity.toLowerCase()">
              {{ item.severity }}
            </span>
            <span class="date-stamp">{{ item.date }}</span>
            <span v-if="item.resolved" class="badge-resolved">Resolved</span>
          </div>

          <h3 class="exception-title">{{ item.title }}</h3>
          <p class="exception-desc">{{ item.description }}</p>
          <div class="reference-link">
            Ref: <span class="cyan">{{ item.ref }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-review" @click="reviewException(item)">Review</button>
          <button
            class="btn-resolve"
            :class="{ resolved: item.resolved }"
            @click="toggleResolve(item)"
          >
            {{ item.resolved ? 'Reopen' : 'Resolve ✓' }}
          </button>
        </div>
      </div>

      <div v-if="filteredExceptions.length === 0" class="no-records">
        <span class="material-icons-outlined text-4xl text-slate-500 mb-2">task_alt</span>
        <p class="text-slate-400">All exceptions in this category have been addressed.</p>
      </div>
    </div>

    <!-- Exception Review Dialog -->
    <q-dialog v-model="showReviewModal">
      <q-card class="bg-dark text-white rounded-borders q-pa-md" style="min-width: 500px; max-width: 600px; border: 1px solid rgba(239, 68, 68, 0.4);">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="warning" color="negative" size="24px" />
            <div>
              <div class="text-subtitle1 text-weight-bold text-white">{{ selectedItem?.title }}</div>
              <div class="text-caption text-grey-5">Reference: {{ selectedItem?.ref }} • Category: {{ selectedItem?.category }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-separator dark />

        <q-card-section class="q-py-md">
          <div class="q-pa-sm rounded-borders bg-black text-body2 text-grey-3" style="border: 1px solid rgba(255, 255, 255, 0.1);">
            {{ selectedItem?.description }}
          </div>
          <div class="row items-center justify-between q-mt-md">
            <span class="text-caption text-grey-5">Reported On: {{ selectedItem?.date }}</span>
            <q-badge :color="selectedItem?.severity === 'HIGH' ? 'negative' : 'warning'" text-color="white" class="text-weight-bold">
              {{ selectedItem?.severity }} SEVERITY
            </q-badge>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-sm q-gutter-x-sm">
          <q-btn flat no-caps label="Close" color="grey-5" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="selectedItem?.resolved ? 'Reopen Exception' : 'Resolve Exception'"
            :color="selectedItem?.resolved ? 'warning' : 'positive'"
            @click="resolveFromModal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const showReviewModal = ref(false);
const selectedItem = ref<ExceptionItem | null>(null);

interface ExceptionItem {
  id: string;
  category: 'Fuel Anomaly' | 'Compliance' | 'Credit Limit' | 'Route Deviation';
  severity: 'HIGH' | 'MEDIUM';
  date: string;
  title: string;
  description: string;
  ref: string;
  resolved: boolean;
}

const categories = ['All', 'Fuel Anomaly', 'Compliance', 'Credit Limit', 'Route Deviation'];
const selectedCategory = ref('All');

const exceptions = ref<ExceptionItem[]>([
  {
    id: '1',
    category: 'Fuel Anomaly',
    severity: 'HIGH',
    date: '2026-10-21',
    title: 'Fuel variance 24% on GJ-05-BT-2211',
    description: 'FE/240086: 4.2 km/L vs target 5.5. Possible odometer mismatch or over-fill at BPCL Naroda on 21 Oct.',
    ref: 'FE/240086',
    resolved: false,
  },
  {
    id: '2',
    category: 'Fuel Anomaly',
    severity: 'HIGH',
    date: '2026-10-22',
    title: 'Duplicate fill within 3h — GJ-01-AB-1122',
    description: 'FE/240082 and FE/240083 both at HPCL Adajan on 22 Oct within 2h 40m. Total 580 L — exceeds tank capacity.',
    ref: 'FE/240082',
    resolved: false,
  },
  {
    id: '3',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-24',
    title: 'Fitness certificate expired — GJ-01-AC-3444',
    description: 'Fitness expired 2023-11-02 (overdue by 700+ days). Vehicle blocked for trip allocation until renewed.',
    ref: 'VEH/GJ-01-AC-3444',
    resolved: false,
  },
  {
    id: '4',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-24',
    title: 'Insurance expired — GJ-01-AB-1122',
    description: 'Insurance expired 2025-01-10. Vehicle is currently In Transit on TR/240078. Renewal required immediately.',
    ref: 'VEH/GJ-01-AB-1122',
    resolved: false,
  },
  {
    id: '5',
    category: 'Credit Limit',
    severity: 'MEDIUM',
    date: '2026-10-23',
    title: 'Credit limit 94% utilised — Pidilite Industries',
    description: 'Outstanding ₹4,70,000 against ₹5,00,000 sanctioned limit. New LR dispatch holds enabled until clearance.',
    ref: 'CUST/PIDILITE',
    resolved: false,
  },
  {
    id: '6',
    category: 'Route Deviation',
    severity: 'MEDIUM',
    date: '2026-10-25',
    title: 'Geofence Exit: TR/240076 (MH-14-DX-9000)',
    description: 'Driver deviated +42 KM from approved NH-48 toll corridor towards Panvel bypass. Delay alert triggered.',
    ref: 'TR/240076',
    resolved: false,
  },
]);

const activeExceptions = computed(() => {
  return exceptions.value.filter(e => !e.resolved);
});

const filteredExceptions = computed(() => {
  return exceptions.value.filter(e => {
    if (selectedCategory.value === 'All') return true;
    return e.category === selectedCategory.value;
  });
});

function toggleResolve(item: ExceptionItem) {
  item.resolved = !item.resolved;
  $q.notify({
    type: item.resolved ? 'positive' : 'warning',
    message: item.resolved ? `Exception [${item.ref}] marked as resolved.` : `Exception [${item.ref}] reopened.`,
    position: 'top-right',
  });
}

function reviewException(item: ExceptionItem) {
  selectedItem.value = item;
  showReviewModal.value = true;
}

function resolveFromModal() {
  if (selectedItem.value) {
    toggleResolve(selectedItem.value);
    showReviewModal.value = false;
  }
}
</script>

<style scoped>
.exception-page {
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

.unresolved-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.filter-pills-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
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

.exceptions-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.exception-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  transition: border-color 0.2s ease;
}

.exception-card:hover {
  border-color: rgba(0, 242, 254, 0.3);
}

.resolved-card {
  opacity: 0.5;
  background: #090f1d;
}

.card-left-icon {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-icon.high {
  color: #ef4444;
}

.alert-icon.medium {
  color: #fbbf24;
}

.card-main-content {
  flex: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.4rem;
}

.badge-type {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-severity {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.badge-high {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-medium {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge-resolved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.date-stamp {
  font-size: 0.72rem;
  color: #64748b;
}

.exception-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.35rem 0;
}

.exception-desc {
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
  margin: 0 0 0.45rem 0;
}

.reference-link {
  font-size: 0.75rem;
  color: #64748b;
}

.cyan {
  color: #00f2fe;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-self: center;
}

.btn-review {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-review:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.btn-resolve {
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-resolve:hover {
  background: #00f2fe;
  color: #070c18;
}

.btn-resolve.resolved {
  background: rgba(100, 116, 139, 0.15);
  border-color: rgba(100, 116, 139, 0.3);
  color: #94a3b8;
}

.no-records {
  text-align: center;
  padding: 3rem;
  background: #0d172b;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}
</style>
