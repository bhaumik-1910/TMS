<template>
  <div class="exception-page min-h-screen text-slate-100 p-6">
    <!-- Header with cyan underline bar matching user screenshot -->
    <div class="page-title-wrap mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Exception Inbox</h1>
      <div class="page-underline"></div>
    </div>

    <!-- 3 KPI Box Cards matching Row 1 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 1. OPEN EXCEPTIONS -->
      <div class="kpi-box">
        <span class="kpi-title">OPEN EXCEPTIONS</span>
        <div class="kpi-amount text-amber-400">{{ openCount }}</div>
        <span class="kpi-subtext">Requires action</span>
      </div>

      <!-- 2. HIGH SEVERITY -->
      <div class="kpi-box">
        <span class="kpi-title">HIGH SEVERITY</span>
        <div class="kpi-amount text-amber-400">{{ highSeverityCount }}</div>
        <span class="kpi-subtext">Fuel, compliance, overdue</span>
      </div>

      <!-- 3. RESOLVED TODAY -->
      <div class="kpi-box">
        <span class="kpi-title">RESOLVED TODAY</span>
        <div class="kpi-amount text-white">{{ resolvedTodayCount }}</div>
        <span class="kpi-subtext">Cleared exceptions</span>
      </div>
    </div>

    <!-- Filter Pills matching user screenshot -->
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

      <!-- Category / Type Filters: All Types, Fuel Anomaly, Compliance, etc. -->
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

    <!-- Exceptions Feed List matching user screenshot -->
    <div class="flex flex-col gap-3.5">
      <div
        v-for="item in filteredExceptions"
        :key="item.id"
        class="exception-row-card"
        :class="{ 'exception-row-card--resolved': item.resolved }"
      >
        <!-- Left Column: Siren / Alarm Icon Box -->
        <div class="siren-box flex-shrink-0">
          <svg class="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
            <!-- Siren / Alarm beacon SVG matching user screenshot -->
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
            <span class="font-mono text-xs text-slate-400">
              {{ item.date }}
            </span>

            <span v-if="item.resolved" class="badge-resolved-pill">
              Resolved ✓
            </span>
          </div>

          <!-- Exception Title -->
          <h3 class="text-sm font-bold text-white mb-1 tracking-tight">
            {{ item.title }}
          </h3>

          <!-- Exception Description -->
          <p class="text-xs text-slate-400 mb-1.5 leading-relaxed">
            {{ item.description }}
          </p>

          <!-- Reference Link -->
          <div class="text-[11px] font-mono text-slate-500">
            {{ item.ref }}
          </div>
        </div>

        <!-- Right Column: Action Buttons matching user screenshot -->
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
      <div v-if="filteredExceptions.length === 0" class="py-12 text-center text-slate-400 bg-[#091224] rounded-xl border border-slate-800">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div class="font-bold text-white text-base">{{ selectedItem.title }}</div>
            <div class="text-xs text-slate-400 font-mono mt-0.5">{{ selectedItem.ref }} • Reported {{ selectedItem.date }}</div>
          </div>
          <span
            class="badge-severity"
            :class="selectedItem.severity === 'HIGH' ? 'badge-severity--high' : 'badge-severity--medium'"
          >
            {{ selectedItem.severity }}
          </span>
        </div>

        <div class="p-3.5 rounded-lg bg-[#060c18] border border-slate-800/80 text-slate-300 text-xs leading-relaxed font-mono">
          {{ selectedItem.description }}
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span class="text-slate-400 block mb-1">INCIDENT CATEGORY</span>
            <span class="font-bold text-white">{{ selectedItem.category }}</span>
          </div>
          <div class="p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span class="text-slate-400 block mb-1">AUDIT STATUS</span>
            <span :class="selectedItem.resolved ? 'text-emerald-400' : 'text-amber-400'" class="font-bold">
              {{ selectedItem.resolved ? 'Resolved' : 'Requires Investigation' }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppNotify } from '../../composables/useAppNotify';
import { DeskDialog } from '../../framework';

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

// Initial exception records matching user screenshot
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
    date: '2026-10-24',
    title: 'Fitness certificate expired — GJ-01-AC-3444',
    description: 'Fitness expired 2023-11-02 (overdue by 700+ days). Vehicle blocked for trip allocation until renewed.',
    ref: 'Ref: VEH/GJ-01-AC-3444',
    resolved: false,
  },
  {
    id: '4',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-24',
    title: 'Insurance expired — GJ-01-AB-1122',
    description: 'Insurance expired 2025-01-10. Vehicle is currently In Transit on TR/240078. Renewal required immediately.',
    ref: 'Ref: VEH/GJ-01-AB-1122',
    resolved: false,
  },
  {
    id: '5',
    category: 'Credit Limit',
    severity: 'MEDIUM',
    date: '2026-10-23',
    title: 'Credit limit 94% utilised — Pidilite Industries',
    description: 'Outstanding ₹4,70,000 against ₹5,00,000 sanctioned limit. New LR dispatch holds enabled until clearance.',
    ref: 'Ref: CUST/PIDILITE',
    resolved: false,
  },
  {
    id: '6',
    category: 'Overdue Invoice',
    severity: 'MEDIUM',
    date: '2026-10-22',
    title: 'Invoice overdue by 45 days — Marico Ltd',
    description: 'INV/24/1045 for ₹62,000 pending payment since due date 08 Sep 2026. Follow-up reminder dispatched.',
    ref: 'Ref: INV/24/1045',
    resolved: false,
  },
  {
    id: '7',
    category: 'Advance Limit',
    severity: 'MEDIUM',
    date: '2026-10-21',
    title: 'Driver cash advance exceeded limit — TR/240075',
    description: 'Total advance requested ₹18,000 exceeds maximum route advance policy ₹15,000 for driver Ramesh Alumar.',
    ref: 'Ref: ADV/240092',
    resolved: false,
  },
  {
    id: '8',
    category: 'POD',
    severity: 'MEDIUM',
    date: '2026-10-20',
    title: 'POD delivery document missing — LR/240040',
    description: 'Trip completed 4 days ago. Consignee signed physical or digital proof of delivery not uploaded.',
    ref: 'Ref: LR/240040',
    resolved: false,
  },
  {
    id: '9',
    category: 'Compliance',
    severity: 'HIGH',
    date: '2026-10-24',
    title: 'Speed telemetry violation on NH-48 toll corridor',
    description: 'Speed recorded 88 km/h in 60 km/h speed zone near Bharuch. Driver acknowledged warning.',
    ref: 'Ref: TEL/99482',
    resolved: true,
  },
]);

// KPI Computations matching Image 1
const openCount = computed(() => {
  return exceptions.value.filter((e) => !e.resolved).length;
});

const highSeverityCount = computed(() => {
  return exceptions.value.filter((e) => !e.resolved && e.severity === 'HIGH').length;
});

const resolvedTodayCount = computed(() => {
  return exceptions.value.filter((e) => e.resolved).length;
});

// Filtered exceptions by status and type
const filteredExceptions = computed(() => {
  return exceptions.value.filter((e) => {
    // Status Filter
    if (selectedStatus.value === 'Open' && e.resolved) return false;
    if (selectedStatus.value === 'Resolved' && !e.resolved) return false;

    // Type Filter
    if (selectedType.value !== 'All Types' && e.category !== selectedType.value) {
      return false;
    }

    return true;
  });
});

function toggleResolve(item: ExceptionItem) {
  item.resolved = !item.resolved;
  if (item.resolved) {
    notify.notifySuccess(`Exception [${item.ref}] marked as resolved.`);
  } else {
    notify.notifyInfo(`Exception [${item.ref}] reopened.`);
  }
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
</script>

<style scoped>
.exception-page {
  background-color: #050b18;
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
  background-color: #00e5ff;
  border-radius: 2px;
  margin-top: 4px;
}

/* KPI Box Cards */
.kpi-box {
  background: #091224;
  border: 1px solid #162540;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
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
  background-color: #0b1728;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  color: #ffffff;
  background-color: #12223a;
}

.tab-pill--active {
  background-color: #00e5ff !important;
  color: #050b18 !important;
  border-color: #00e5ff !important;
}

.tab-pill--cyan-active {
  background-color: rgba(0, 229, 255, 0.12) !important;
  color: #00e5ff !important;
  border-color: #00e5ff !important;
}

/* Exception Row Card */
.exception-row-card {
  background: #091224;
  border: 1px solid #162540;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.exception-row-card:hover {
  border-color: #1e3a66;
}

.exception-row-card--resolved {
  opacity: 0.65;
  background: #070e1c;
}

/* Siren Alarm Icon Box */
.siren-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
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
  background-color: #381a1f;
  color: #f87171;
}

.badge-category--compliance {
  background-color: #372813;
  color: #f59e0b;
}

.badge-category--credit {
  background-color: #241c38;
  color: #a78bfa;
}

.badge-category--overdue {
  background-color: #361d2a;
  color: #f472b6;
}

.badge-category--advance {
  background-color: #162a38;
  color: #38bdf8;
}

.badge-category--pod {
  background-color: #1a2e28;
  color: #34d399;
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
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Right Action Buttons matching user screenshot */
.btn-action-review {
  background-color: transparent;
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
}

.btn-action-review:hover {
  background-color: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

.btn-action-resolve {
  background-color: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.14);
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
  background-color: rgba(16, 185, 129, 0.1);
}

.btn-action-resolve--done {
  border-color: #f59e0b;
  color: #f59e0b;
}
</style>
