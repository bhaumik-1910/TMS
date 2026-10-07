<template>
  <div class="exception-page min-h-screen text-slate-800 p-6 bg-slate-50">
    <!-- Header with underline bar -->
    <div class="page-title-wrap mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Exception Inbox</h1>
      <div class="page-underline"></div>
    </div>

    <!-- 3 KPI Box Cards matching Row 1 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 1. OPEN EXCEPTIONS -->
      <div class="kpi-box">
        <span class="kpi-title">OPEN EXCEPTIONS</span>
        <div class="kpi-amount text-amber-600">{{ openCount }}</div>
        <span class="kpi-subtext">Requires action</span>
      </div>

      <!-- 2. HIGH SEVERITY -->
      <div class="kpi-box">
        <span class="kpi-title">HIGH SEVERITY</span>
        <div class="kpi-amount text-rose-600">{{ highSeverityCount }}</div>
        <span class="kpi-subtext">Fuel, compliance, overdue</span>
      </div>

      <!-- 3. RESOLVED TODAY -->
      <div class="kpi-box">
        <span class="kpi-title">RESOLVED TODAY</span>
        <div class="kpi-amount text-slate-900">{{ resolvedTodayCount }}</div>
        <span class="kpi-subtext">Cleared exceptions</span>
      </div>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <!-- Status Filters: All, Open, Resolved -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="st in statusFilters"
          :key="st"
          class="tab-pill"
          :class="{ 'tab-pill--active': selectedStatus === st }"
          @click="selectedStatus = st"
        >
          {{ st }}
        </button>
      </div>

      <!-- Category / Type Filters -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="tp in typeFilters"
          :key="tp"
          class="tab-pill"
          :class="{ 'tab-pill--cyan-active': selectedType === tp }"
          @click="selectedType = tp"
        >
          {{ tp }}
        </button>
      </div>
    </div>

    <!-- Exceptions Feed List -->
    <div class="flex flex-col gap-3.5">
      <div
        v-for="item in filteredExceptions"
        :key="item.id"
        class="exception-row-card"
        :class="{ 'exception-row-card--resolved': item.resolved }"
      >
        <!-- Left Column: Siren / Alarm Icon Box -->
        <div class="siren-box flex-shrink-0">
          <svg class="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4zm-2 5V6a2 2 0 1 1 4 0v1h-4zm-4 7v1a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5v-1H6zm6 7a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
          </svg>
        </div>

        <!-- Middle Column: Content & Metadata -->
        <div class="flex-1 min-w-0 pr-4">
          <!-- Top Metadata Row -->
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <!-- Category Badge -->
            <span
              class="badge-category"
              :class="getCategoryBadgeClass(item.category)"
            >
              {{ item.category }}
            </span>

            <!-- Severity Badge -->
            <span
              class="badge-severity"
              :class="item.severity === 'HIGH' ? 'badge-severity--high' : 'badge-severity--medium'"
            >
              {{ item.severity }}
            </span>

            <!-- Date -->
            <span class="font-mono text-xs text-slate-500">
              {{ item.date }}
            </span>

            <span v-if="item.resolved" class="badge-resolved-pill">
              Resolved ✓
            </span>
          </div>

          <!-- Exception Title -->
          <h3 class="text-sm font-bold text-slate-900 mb-1 tracking-tight">
            {{ item.title }}
          </h3>

          <!-- Exception Description -->
          <p class="text-xs text-slate-600 mb-1.5 leading-relaxed">
            {{ item.description }}
          </p>

          <!-- Reference Link -->
          <div class="text-[11px] font-mono text-slate-400">
            {{ item.ref }}
          </div>
        </div>

        <!-- Right Column: Action Buttons -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button class="btn-action-review" @click="reviewException(item)">
            Review
          </button>
          <button
            class="btn-action-resolve"
            :class="{ 'btn-action-resolve--done': item.resolved }"
            @click="toggleResolve(item)"
          >
            {{ item.resolved ? 'Reopen' : 'Resolve ✓' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredExceptions.length === 0" class="py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">No exceptions matching the selected criteria.</p>
      </div>
    </div>

    <!-- Review Dialog -->
    <DeskDialog
      v-model="showReviewModal"
      title="Exception Incident Audit"
      width="560px"
      :confirm-label="selectedItem?.resolved ? 'Reopen Exception' : 'Resolve Incident'"
      cancel-label="Close"
      @confirm="resolveFromModal"
      @cancel="showReviewModal = false"
    >
      <div v-if="selectedItem" class="flex flex-col gap-4 text-sm font-sans">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div class="font-bold text-slate-900 text-base">{{ selectedItem.title }}</div>
            <div class="text-xs text-slate-500 font-mono mt-0.5">{{ selectedItem.ref }} • Reported {{ selectedItem.date }}</div>
          </div>
          <span
            class="badge-severity"
            :class="selectedItem.severity === 'HIGH' ? 'badge-severity--high' : 'badge-severity--medium'"
          >
            {{ selectedItem.severity }}
          </span>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed font-mono">
          {{ selectedItem.description }}
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 rounded bg-white border border-slate-200 shadow-sm">
            <span class="text-slate-500 block mb-1 font-semibold">INCIDENT CATEGORY</span>
            <span class="font-bold text-slate-900">{{ selectedItem.category }}</span>
          </div>
          <div class="p-2.5 rounded bg-white border border-slate-200 shadow-sm">
            <span class="text-slate-500 block mb-1 font-semibold">AUDIT STATUS</span>
            <span :class="selectedItem.resolved ? 'text-emerald-600' : 'text-amber-600'" class="font-bold">
              {{ selectedItem.resolved ? 'Resolved' : 'Requires Investigation' }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppNotify } from '../../composables/useAppNotify';
import { DeskDialog } from '../../framework';
import { useDeskPageShortcuts } from '../../desk';
import api from '../../api/client';

interface ExceptionItem {
  id: string;
  category: 'Fuel Anomaly' | 'Compliance' | 'Credit Limit' | 'Overdue Invoice' | 'Advance Limit' | 'POD';
  severity: 'HIGH' | 'MEDIUM';
  date: string;
  title: string;
  description: string;
  ref: string;
  resolved: boolean;
}

const notify = useAppNotify();

const statusFilters = ['All', 'Open', 'Resolved'];
const selectedStatus = ref('Open');

const typeFilters = [
  'All Types',
  'Fuel Anomaly',
  'Compliance',
  'Credit Limit',
  'Overdue Invoice',
  'Advance Limit',
  'POD',
];
const selectedType = ref('All Types');

const showReviewModal = ref(false);
const selectedItem = ref<ExceptionItem | null>(null);

// Initial exception records
const exceptions = ref<ExceptionItem[]>([
  {
    id: '1',
    category: 'Fuel Anomaly',
    severity: 'HIGH',
    date: '2026-10-21',
    title: 'Fuel variance 24% on GJ-05-BT-2211',
    description: 'FE/2400086: 4.2 km/L vs target 5.5. Possible odometer mismatch or over-fill at BPCL Naroda on 21 Oct.',
    ref: 'Ref: FE/2400086',
    resolved: false,
  },
  {
    id: '2',
    category: 'Fuel Anomaly',
    severity: 'HIGH',
    date: '2026-10-22',
    title: 'Duplicate fill within 3h — GJ-01-AB-1122',
    description: 'FE/2400082 and FE/2400083 both at HPCL Adajan on 22 Oct within 2h 40m. Total 580 L — exceeds tank capacity.',
    ref: 'Ref: FE/2400082',
    resolved: false,
  },
  {
    id: '3',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-20',
    title: 'Insurance expired — GJ-01-AB-1122',
    description: 'National Insurance policy #48100 expired on 2025-01-10. Vehicle is currently on active trip TR/240081.',
    ref: 'Ref: VAHAN-2218',
    resolved: false,
  },
  {
    id: '4',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-18',
    title: 'Fitness expired — GJ-01-AC-3444',
    description: 'RTO Fitness expired on 2023-11-02. Penalties accruing at ₹50/day. Immediate renewal inspection required.',
    ref: 'Ref: VAHAN-1102',
    resolved: false,
  },
  {
    id: '5',
    category: 'Credit Limit',
    severity: 'HIGH',
    date: '2026-10-22',
    title: 'Credit limit breach: Adani Wilmar ₹12.4L / ₹10L',
    description: 'Outstanding exceeds credit limit by ₹2.40L (24% over limit). 3 invoices overdue >45 days.',
    ref: 'Ref: CUST-ADANI',
    resolved: false,
  },
  {
    id: '6',
    category: 'Overdue Invoice',
    severity: 'MEDIUM',
    date: '2026-10-23',
    title: 'Invoice INV/2400041 overdue by 38 days — Nirma Ltd',
    description: 'Amount ₹88,500 due on 15 Sep 2026. Payment reminder sent via WhatsApp on 5 Oct; no response recorded.',
    ref: 'Ref: INV/2400041',
    resolved: false,
  },
  {
    id: '7',
    category: 'Advance Limit',
    severity: 'MEDIUM',
    date: '2026-10-20',
    title: 'Driver advance breach — Ramesh Alumar ₹18,000 / ₹15,000',
    description: 'Unsettled advance balance ₹18,000 across trips TR/240076 and TR/240080. Max per-driver advance is ₹15,000.',
    ref: 'Ref: DRV-RAMESH',
    resolved: false,
  },
  {
    id: '8',
    category: 'POD',
    severity: 'MEDIUM',
    date: '2026-10-19',
    title: 'POD overdue >7 days — LR/2400088 (Tata Steel)',
    description: 'Trip completed on 12 Oct at Sanand hub. Physical signed bilty or digital upload pending for 7 days.',
    ref: 'Ref: LR/2400088',
    resolved: false,
  },
]);

// Computed Counts
const openCount = computed(() => exceptions.value.filter((e) => !e.resolved).length);
const highSeverityCount = computed(() => exceptions.value.filter((e) => !e.resolved && e.severity === 'HIGH').length);
const resolvedTodayCount = computed(() => exceptions.value.filter((e) => e.resolved).length);

// Filtered List
const filteredExceptions = computed(() => {
  return exceptions.value.filter((item) => {
    // Status Filter
    if (selectedStatus.value === 'Open' && item.resolved) return false;
    if (selectedStatus.value === 'Resolved' && !item.resolved) return false;

    // Type Filter
    if (selectedType.value !== 'All Types' && item.category !== selectedType.value) return false;

    return true;
  });
});

function getCategoryBadgeClass(category: string) {
  switch (category) {
    case 'Fuel Anomaly':
      return 'badge-category--fuel';
    case 'Compliance':
      return 'badge-category--compliance';
    case 'Credit Limit':
      return 'badge-category--credit';
    case 'Overdue Invoice':
      return 'badge-category--overdue';
    case 'Advance Limit':
      return 'badge-category--advance';
    case 'POD':
      return 'badge-category--pod';
    default:
      return 'badge-category--fuel';
  }
}

async function toggleResolve(item: ExceptionItem) {
  const previousState = item.resolved;
  item.resolved = !item.resolved;
  try {
    if (item.resolved && !isNaN(Number(item.id))) {
      await api.post(`/foundation/exceptions/${item.id}/resolve`);
    }
    if (item.resolved) {
      notify.success(`Exception "${item.title}" marked as resolved.`);
    } else {
      notify.info(`Exception "${item.title}" reopened.`);
    }
  } catch (err: any) {
    item.resolved = previousState;
    notify.error('Failed to update exception status');
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/foundation/exceptions');
    const realItems = res.data?.data || res.data || [];
    if (realItems && realItems.length > 0) {
      const mapped: ExceptionItem[] = realItems.map((e: any) => ({
        id: String(e.id),
        category: (e.type ? e.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Compliance') as any,
        severity: ((e.severity || 'high').toUpperCase()) as any,
        date: e.occurredOn || new Date().toISOString().split('T')[0],
        title: e.title,
        description: e.detail || '',
        ref: e.refType ? `Ref: ${e.refType} #${e.refId}` : 'Ref: SYSTEM',
        resolved: !!e.resolvedAt,
      }));
      exceptions.value = [...mapped, ...exceptions.value];
    }
  } catch (_) {
    // Keep baseline default items
  }
});

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

// Keyboard shortcuts for Tally experience
useDeskPageShortcuts({
  isModalOpen: () => showReviewModal.value,
  onEscape: () => {
    showReviewModal.value = false;
  },
  onSave: resolveFromModal,
});
</script>

<style scoped>
.exception-page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header */
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

/* KPI Box Cards */
.kpi-box {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
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
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Filter Tab Pills */
.tab-pill {
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.tab-pill--active {
  background-color: #0284c7 !important;
  color: #ffffff !important;
  border-color: #0284c7 !important;
}

.tab-pill--cyan-active {
  background-color: #f0f9ff !important;
  color: #0369a1 !important;
  border-color: #0284c7 !important;
}

/* Exception Row Card */
.exception-row-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.exception-row-card:hover {
  border-color: #0284c7;
}

.exception-row-card--resolved {
  opacity: 0.65;
  background: #f8fafc;
}

/* Siren Alarm Icon Box */
.siren-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

/* Badges */
.badge-category {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.badge-category--fuel {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-category--compliance {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-category--credit {
  background-color: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.badge-category--overdue {
  background-color: #fdf2f8;
  color: #be185d;
  border: 1px solid #fbcfe8;
}

.badge-category--advance {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-category--pod {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.badge-severity {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  font-family: monospace, sans-serif;
}

.badge-severity--high {
  background-color: #ef4444;
  color: #ffffff;
}

.badge-severity--medium {
  background-color: #f59e0b;
  color: #ffffff;
}

.badge-resolved-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

/* Right Action Buttons */
.btn-action-review {
  background-color: #ffffff;
  color: #0284c7;
  border: 1px solid #0284c7;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
}

.btn-action-review:hover {
  background-color: #f0f9ff;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.15);
}

.btn-action-resolve {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
}

.btn-action-resolve:hover {
  border-color: #10b981;
  color: #10b981;
  background-color: #f0fdf4;
}

.btn-action-resolve--done {
  border-color: #f59e0b;
  color: #f59e0b;
  background-color: #fffbeb;
}
</style>
