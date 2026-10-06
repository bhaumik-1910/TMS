<template>
  <div class="desk-resource-page p-3 sm:p-4 text-slate-800 font-sans">
    <!-- 1. Header with Title & Action Controls -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-slate-900 relative-position inline-block q-pb-xs">
          {{ title }}
          <div class="header-underline"></div>
        </div>
        <div v-if="subtitle" class="text-caption text-slate-500 q-mt-xs">
          {{ subtitle }}
        </div>
      </div>

      <!-- Header Action Buttons -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <slot name="header-actions" />

        <q-btn
          v-if="allowExport"
          flat
          dense
          icon="download"
          label="Export"
          no-caps
          color="slate-700"
          class="bg-white border border-slate-300 text-weight-bold q-px-sm"
          @click="onExport"
        />

        <q-btn
          v-if="allowCreate"
          color="primary"
          no-caps
          icon="add"
          :label="createLabel || '+ New'"
          class="text-weight-bold q-px-md"
          @click="$emit('new')"
        >
          <q-tooltip>Add New Record (Alt+C / Insert)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 2. KPI / Stat Cards Slot -->
    <div v-if="$slots.stats" class="q-mb-md">
      <slot name="stats" />
    </div>

    <!-- 3. Main Data Grid with Built-In Filter Toolbar -->
    <DeskDataTable
      ref="gridRef"
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :title="gridTitle || ''"
      :is-loading="loading"
      :allow-create="false"
      :allow-export="allowExport"
      :allow-refresh="true"
      :selected-mode="selectable ? 'single' : 'none'"
      @refresh="$emit('refresh')"
      @row-click="onRowClick"
      @row-double-click="onRowDblClick"
    >
      <template #top-filters>
        <slot name="filters" />
      </template>

      <!-- Forward custom column slots -->
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </DeskDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import DeskDataTable from '../grid/DeskDataTable.vue';
import type { QTableColumn } from 'quasar';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    gridTitle?: string;
    rows: any[];
    columns: QTableColumn[];
    rowKey?: string;
    loading?: boolean;
    allowCreate?: boolean;
    createLabel?: string;
    allowExport?: boolean;
    selectable?: boolean;
    shortcutAdd?: boolean;
  }>(),
  {
    rowKey: 'id',
    loading: false,
    allowCreate: true,
    allowExport: true,
    selectable: false,
    shortcutAdd: true,
  }
);

const emit = defineEmits<{
  (e: 'new'): void;
  (e: 'open', row: any): void;
  (e: 'edit', row: any): void;
  (e: 'delete', row: any): void;
  (e: 'refresh'): void;
  (e: 'export'): void;
}>();

const gridRef = ref<InstanceType<typeof DeskDataTable> | null>(null);

function onRowClick(row: any) {
  emit('open', row);
}

function onRowDblClick(row: any) {
  emit('edit', row);
}

function onExport() {
  if (gridRef.value?.exportCsv) {
    gridRef.value.exportCsv();
  }
  emit('export');
}

// Global Alt+C / Insert listener for fast Add
function handleGlobalKeyDown(e: KeyboardEvent) {
  if (!props.shortcutAdd || !props.allowCreate) return;

  const isAltC = e.altKey && e.key.toLowerCase() === 'c';
  const isInsert = e.key === 'Insert';

  if (isAltC || isInsert) {
    const active = document.activeElement as HTMLElement | null;
    const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    if (!isEditing || isInsert) {
      e.preventDefault();
      emit('new');
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});

defineExpose({
  gridRef,
  exportCsv: onExport,
});
</script>

<style scoped>
.header-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 32px;
  height: 3px;
  background: var(--q-primary, #0284c7);
  border-radius: 2px;
}
</style>
