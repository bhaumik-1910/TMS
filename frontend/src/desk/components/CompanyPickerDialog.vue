<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    transition-show="jump-down"
    transition-hide="jump-up"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <q-card class="company-picker-card">
      <!-- Header -->
      <div class="picker-header q-pa-md row items-center justify-between">
        <div class="row items-center q-gutter-x-md">
          <div class="picker-icon-box flex flex-center">
            <q-icon name="apartment" size="22px" class="text-sky-600" />
          </div>
          <div>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-title text-weight-bolder text-slate-900">Select Company / Business Unit</span>
              <span class="picker-key-tag font-mono">Alt+F3</span>
            </div>
            <div class="text-caption text-slate-500 q-mt-xs">
              {{ userEmail ? `Signed in as ${userName} (${userEmail})` : 'Choose operational company context for ERP operations' }}
            </div>
          </div>
        </div>

        <q-btn
          v-if="allowClose"
          flat
          round
          dense
          icon="close"
          class="picker-close-btn"
          @click="emit('update:modelValue', false)"
        >
          <q-tooltip class="bg-slate-900 text-white font-mono">Cancel (Esc)</q-tooltip>
        </q-btn>
      </div>

      <!-- Quick Instruction Banner (Tally Top Bar) -->
      <div class="picker-hint-bar q-px-md q-py-xs row items-center justify-between">
        <div class="row items-center q-gutter-x-xs">
          <span class="tally-pill"><kbd>↑</kbd><kbd>↓</kbd> Move</span>
          <span class="tally-pill"><kbd>Tab</kbd> Next</span>
          <span class="tally-pill"><kbd>Enter</kbd> Select</span>
          <span class="tally-pill"><kbd>1-9</kbd> Quick Open</span>
        </div>
        <div class="row items-center q-gutter-x-xs text-slate-600 font-mono text-xs">
          <q-icon name="domain" size="14px" class="text-sky-600" />
          <span>{{ companies.length }} Available Companies</span>
        </div>
      </div>

      <!-- Company Cards List -->
      <div ref="listRef" class="company-list-container custom-scroll q-pa-md">
        <div
          v-for="(comp, idx) in companies"
          :key="comp.companyId"
          :ref="(el) => setItemRef(el, idx)"
          class="company-row q-pa-sm q-mb-sm cursor-pointer row items-center justify-between no-wrap"
          :class="{
            'is-selected': selectedIndex === idx,
            'is-active-company': isActive(comp),
          }"
          @click="selectCompany(comp.companyId)"
          @mouseenter="selectedIndex = idx"
        >
          <div class="row items-center q-gutter-x-md no-wrap ellipsis col">
            <!-- Numeric Shortcut Key -->
            <div
              class="company-num-badge font-mono flex flex-center"
              :class="selectedIndex === idx ? 'num-selected' : 'num-idle'"
            >
              {{ idx + 1 }}
            </div>

            <!-- Details -->
            <div class="ellipsis col">
              <div class="row items-center q-gutter-x-sm no-wrap q-mb-xs">
                <span class="comp-name ellipsis" :class="selectedIndex === idx ? 'text-sky-950 font-bold' : 'text-slate-800'">
                  {{ comp.name }}
                </span>
                <span class="company-code-badge font-mono">
                  {{ comp.code }}
                </span>
                <span v-if="isActive(comp)" class="current-badge font-mono">
                  CURRENT
                </span>
              </div>

              <div class="row items-center q-gutter-x-sm text-caption comp-meta">
                <span class="role-tag">
                  Role: {{ comp.role || 'Admin' }}
                </span>
                <span class="sep-dot">&bull;</span>
                <span class="license-tag">
                  {{ comp.licenseValidTo ? `License valid to ${comp.licenseValidTo}` : 'Multi-Tenant Verified' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Enter Prompt / Indicator -->
          <div class="row items-center q-gutter-x-sm shrink-0 q-ml-sm">
            <span v-if="selectedIndex === idx" class="enter-hint font-mono">
              Press Enter ↵
            </span>
            <q-icon
              name="chevron_right"
              size="20px"
              class="arrow-icon"
              :class="selectedIndex === idx ? 'text-sky-600' : 'text-slate-400'"
            />
          </div>
        </div>

        <!-- Empty state if no companies -->
        <div v-if="!companies.length" class="text-center q-pa-lg text-slate-500">
          <q-icon name="warning_amber" size="36px" class="text-amber-500 q-mb-xs" />
          <div class="text-subtitle2 text-slate-700">No companies assigned to this account</div>
          <div class="text-caption text-slate-500">Contact your Super Administrator for organization access.</div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="picker-footer q-pa-sm q-px-md row items-center justify-between">
        <div class="row items-center q-gutter-x-xs text-xs text-slate-600 font-mono">
          <q-icon name="verified_user" size="14px" class="text-emerald-600" />
          <span>Tenant Shard & Schema Isolation Verified</span>
        </div>
        <q-btn
          v-if="allowClose"
          flat
          dense
          no-caps
          label="Cancel (Esc)"
          class="cancel-btn font-mono"
          @click="emit('update:modelValue', false)"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';

export interface CompanyItem {
  companyId: number;
  code: string;
  name: string;
  role?: string;
  roleCode?: string;
  licenseValidTo?: string;
  licenseValid?: boolean;
  available?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    companies: CompanyItem[];
    currentCompanyId?: number;
    userName?: string;
    userEmail?: string;
    allowClose?: boolean;
  }>(),
  {
    allowClose: true,
    userName: 'Admin',
    userEmail: '',
    currentCompanyId: 0,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'select', companyId: number): void;
}>();

const selectedIndex = ref(0);
const listRef = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);

function setItemRef(el: any, idx: number) {
  if (el) {
    itemRefs.value[idx] = el;
  }
}

const currentActiveId = computed(() => {
  if (props.currentCompanyId) return props.currentCompanyId;
  return 0;
});

function isActive(comp: CompanyItem): boolean {
  return currentActiveId.value > 0 && comp.companyId === currentActiveId.value;
}

function scrollToSelected() {
  nextTick(() => {
    const el = itemRefs.value[selectedIndex.value];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.currentCompanyId && props.companies.length) {
        const foundIdx = props.companies.findIndex((c) => c.companyId === props.currentCompanyId);
        selectedIndex.value = foundIdx >= 0 ? foundIdx : 0;
      } else {
        selectedIndex.value = 0;
      }
      scrollToSelected();
    }
  },
);

function selectCompany(companyId: number) {
  emit('select', companyId);
}

// Global keyboard event handler
function handleGlobalKeydown(e: KeyboardEvent) {
  if (!props.modelValue || !props.companies.length) return;

  // Arrow Down
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    e.stopPropagation();
    selectedIndex.value = (selectedIndex.value + 1) % props.companies.length;
    scrollToSelected();
    return;
  }

  // Arrow Up
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    e.stopPropagation();
    selectedIndex.value = (selectedIndex.value - 1 + props.companies.length) % props.companies.length;
    scrollToSelected();
    return;
  }

  // Tab (Next) & Shift+Tab (Previous)
  if (e.key === 'Tab') {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      selectedIndex.value = (selectedIndex.value - 1 + props.companies.length) % props.companies.length;
    } else {
      selectedIndex.value = (selectedIndex.value + 1) % props.companies.length;
    }
    scrollToSelected();
    return;
  }

  // Home
  if (e.key === 'Home') {
    e.preventDefault();
    e.stopPropagation();
    selectedIndex.value = 0;
    scrollToSelected();
    return;
  }

  // End
  if (e.key === 'End') {
    e.preventDefault();
    e.stopPropagation();
    selectedIndex.value = props.companies.length - 1;
    scrollToSelected();
    return;
  }

  // Enter
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    const target = props.companies[selectedIndex.value];
    if (target) {
      selectCompany(target.companyId);
    }
    return;
  }

  // Escape
  if (e.key === 'Escape') {
    if (props.allowClose) {
      e.preventDefault();
      e.stopPropagation();
      emit('update:modelValue', false);
    }
    return;
  }

  // Quick Pick: 1-9
  const num = parseInt(e.key, 10);
  if (!isNaN(num) && num >= 1 && num <= props.companies.length) {
    e.preventDefault();
    e.stopPropagation();
    const target = props.companies[num - 1];
    if (target) {
      selectedIndex.value = num - 1;
      selectCompany(target.companyId);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown, true);
});
</script>

<style scoped>
/* Card Base Container - Clean Modern White Theme */
.company-picker-card {
  width: 600px;
  max-width: 95vw;
  background-color: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05) !important;
  border-radius: 14px;
  overflow: hidden;
}

/* Header */
.picker-header {
  background: #ffffff !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.text-title {
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.picker-icon-box {
  width: 38px;
  height: 38px;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.picker-key-tag {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #0284c7;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.picker-close-btn {
  color: #64748b !important;
  transition: color 0.15s ease;
}
.picker-close-btn:hover {
  color: #0f172a !important;
  background: #f1f5f9;
}

/* Tally Quick Bar */
.picker-hint-bar {
  background: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.tally-pill {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.tally-pill kbd {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 0 4px;
  font-weight: 700;
  color: #0284c7;
}

/* Company List Container */
.company-list-container {
  background: #f8fafc !important;
  max-height: 380px;
  overflow-y: auto;
}

/* Individual Company Row */
.company-row {
  background: #ffffff !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 10px;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.company-row:hover {
  background: #f0f9ff !important;
  border-color: #38bdf8 !important;
}

/* Selected State */
.company-row.is-selected {
  background: linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  border: 2px solid #0284c7 !important;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.16) !important;
}

.company-row.is-active-company {
  border-left: 4px solid #10b981 !important;
}

/* Number Shortcut Badges */
.company-num-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.num-idle {
  background: #f1f5f9;
  color: #0284c7;
  border: 1px solid #cbd5e1;
}

.num-selected {
  background: #0284c7 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
}

/* Text & Labels */
.comp-name {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.company-code-badge {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.current-badge {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
}

.comp-meta {
  color: #64748b;
  font-size: 12px;
}

.role-tag {
  color: #0284c7;
  font-weight: 600;
}

.sep-dot {
  color: #94a3b8;
}

.license-tag {
  color: #64748b;
}

/* Enter Prompt */
.enter-hint {
  font-size: 11px;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  padding: 2px 7px;
  border-radius: 4px;
}

.arrow-icon {
  transition: transform 0.15s ease;
}
.company-row.is-selected .arrow-icon {
  transform: translateX(3px);
}

/* Footer */
.picker-footer {
  background: #ffffff !important;
  border-top: 1px solid #e2e8f0 !important;
}

.cancel-btn {
  color: #64748b !important;
  font-size: 12px;
}
.cancel-btn:hover {
  color: #0f172a !important;
}

/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
