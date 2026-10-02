<template>
  <div
    class="desk-grid"
    tabindex="0"
    ref="gridRootRef"
    @keydown="onKeyDown"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <!-- Grid Action Toolbar -->
    <div class="desk-grid-toolbar row items-center justify-between no-wrap q-gutter-x-sm">
      <!-- Left: Title & Quick Search -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <div v-if="title" class="text-weight-bold text-subtitle2 text-white font-mono no-wrap tracking-wide">
          {{ title }}
        </div>
        <q-input
          ref="searchRef"
          v-model="filterText"
          dense
          outlined
          placeholder="Filter... (Alt+F)"
          class="desk-grid-search"
          @keydown="onSearchKeyDown"
        >
          <template #prepend>
            <q-icon name="search" size="16px" color="cyan" />
          </template>
          <template #append v-if="filterText">
            <q-icon
              name="cancel"
              size="16px"
              class="cursor-pointer text-slate-400 hover:text-white"
              @click.stop.prevent="filterText = ''"
              @mousedown.stop.prevent="filterText = ''"
            />
          </template>
        </q-input>
        <slot name="top-filters"></slot>
      </div>

      <!-- Right: Action Buttons & Exports -->
      <div class="row items-center q-gutter-x-xs no-wrap">
        <slot name="top-actions"></slot>

        <q-btn
          v-if="allowCreate"
          unelevated
          dense
          color="cyan-8"
          text-color="white"
          size="sm"
          icon="add"
          :label="createLabel || 'New'"
          class="q-px-sm text-weight-bold"
          @click="$emit('create')"
        >
          <q-tooltip>Add New Record (Ctrl+N)</q-tooltip>
        </q-btn>

        <q-btn
          v-if="allowExport"
          flat
          dense
          size="sm"
          icon="file_download"
          color="grey-4"
          @click="exportCsv"
        >
          <q-tooltip>Export to CSV</q-tooltip>
        </q-btn>

        <q-btn
          v-if="allowRefresh"
          flat
          dense
          round
          icon="refresh"
          color="cyan"
          class="desk-grid-refresh-btn"
          :loading="isLoading"
          @click="handleRefresh"
        >
          <template #loading>
            <q-spinner color="cyan" size="16px" />
          </template>
          <q-tooltip>Refresh Grid</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Quasar QTable without vertical cell borders -->
    <q-table
      ref="qTableRef"
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :filter="filterText"
      :loading="isLoading"
      :pagination="pagination"
      @update:pagination="onPaginationUpdate"
      :selection="selectionMode"
      v-model:selected="selectedRows"
      dense
      flat
      square
      separator="none"
      :rows-per-page-options="[15, 25, 50, 100]"
      class="full-width"
    >
      <!-- Custom Centered Empty State -->
      <template #no-data>
        <div class="full-width column items-center justify-center text-center q-pa-xl">
          <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15);">
            <q-icon name="search_off" size="28px" class="text-slate-400" />
          </div>
          <div class="text-subtitle1 text-weight-bold text-slate-200">No matching records found</div>
          <div class="text-caption text-slate-500 q-mt-xs">Try adjusting your search terms or clearing active filters.</div>
        </div>
      </template>

      <!-- Custom Loading Overlay -->
      <template #loading>
        <AppLoadingOverlay showing title="Loading Records..." subtitle="Fetching and indexing data" />
      </template>

      <!-- Header Row with column shortcuts if needed -->
      <template #header="props">
        <q-tr :props="props">
          <q-th v-if="selectionMode !== 'none'" auto-width>
            <q-checkbox v-model="props.selected" dense size="xs" />
          </q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="{ 'desk-col-num': col.align === 'right', 'desk-col-center': col.align === 'center' }"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Body Row matching Image 1 & 2 clean aesthetics -->
      <template #body="props">
        <q-tr
          :props="props"
          :class="{
            'desk-row-selected': props.selected,
            'desk-row-active': props.pageIndex === activeRow,
          }"
          @click="onRowClick(props.pageIndex, props.row)"
          @dblclick="$emit('row-dblclick', props.row)"
        >
          <q-td v-if="selectionMode !== 'none'" auto-width>
            <q-checkbox v-model="props.selected" dense size="xs" />
          </q-td>

          <q-td
            v-for="(col, cIdx) in props.cols"
            :key="col.name"
            :props="props"
            :class="{
              'desk-col-num': col.align === 'right',
              'desk-col-center': col.align === 'center',
            }"
            @click.stop="onCellClick(props.pageIndex, Number(cIdx))"
          >
            <slot :name="`body-cell-${col.name}`" :props="props" :value="props.row[col.field]">
              {{ col.format ? col.format(props.row[col.field], props.row) : props.row[col.field] }}
            </slot>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Optional Grid Keyboard Bar -->
    <div v-if="showFooterBar" class="desk-grid-footer row items-center justify-between no-wrap">
      <div class="row items-center q-gutter-x-md">
        <span>
          Row <strong>{{ activeRow + 1 }}</strong> of <strong>{{ rows.length }}</strong>
          <span v-if="selectedRows.length > 0"> ({{ selectedRows.length }} selected)</span>
        </span>
        <span class="text-caption text-secondary">
          Col: <strong>{{ columns[activeCol]?.label || activeCol + 1 }}</strong>
        </span>
      </div>

      <div class="row items-center q-gutter-x-sm text-caption">
        <span><kbd>↑/↓/←/→</kbd> Navigate</span>
        <span><kbd>Space</kbd> Select</span>
        <span><kbd>Enter</kbd> Open</span>
        <span v-if="allowDelete"><kbd>Del</kbd> Delete</span>
        <span><kbd>Alt+F</kbd> Search</span>
        <span><kbd>Alt+1/2/3</kbd> Filters</span>
        <span><kbd>Tab</kbd> Next</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { exportFile } from 'quasar';
import { useGridKeyboard } from './useGridKeyboard';
import { GridColumn } from './types';
import './desk-grid.css';

export type { GridColumn };

const props = withDefaults(
  defineProps<{
    title?: string;
    rows: any[];
    columns: GridColumn[];
    rowKey?: string;
    loading?: boolean;
    allowCreate?: boolean;
    createLabel?: string;
    allowExport?: boolean;
    allowRefresh?: boolean;
    allowDelete?: boolean;
    selectionMode?: 'none' | 'single' | 'multiple';
    showFooterBar?: boolean;
    initialPagination?: { page: number; rowsPerPage: number };
  }>(),
  {
    rowKey: 'id',
    loading: false,
    allowCreate: true,
    allowExport: true,
    allowRefresh: true,
    allowDelete: true,
    selectionMode: 'none',
    showFooterBar: false,
    initialPagination: () => ({ page: 1, rowsPerPage: 25 }),
  },
);

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', row: any): void;
  (e: 'delete', row: any): void;
  (e: 'refresh'): void;
  (e: 'row-click', row: any): void;
  (e: 'row-dblclick', row: any): void;
  (e: 'selection', selected: any[]): void;
}>();

const gridRootRef = ref<HTMLElement | null>(null);
const qTableRef = ref<any>(null);
const searchRef = ref<any>(null);
const isFocused = ref(false);
const filterText = ref('');
const selectedRows = ref<any[]>([]);

const pagination = ref({ ...props.initialPagination });

const internalLoading = ref(false);
const isLoading = computed(() => props.loading || internalLoading.value);

function handleRefresh() {
  internalLoading.value = true;
  emit('refresh');
  setTimeout(() => {
    internalLoading.value = false;
  }, 600);
}

function onPaginationUpdate(newVal: any) {
  pagination.value = newVal;
}

const rowsRef = toRef(props, 'rows');
const rowCount = computed(() => props.rows.length);
const colCount = computed(() => props.columns.length);
const pageSizeRef = computed(() => pagination.value.rowsPerPage);

const {
  activeRow,
  activeCol,
  setFocus,
  handleKeyDown: handleGridKey,
} = useGridKeyboard({
  rowCount,
  colCount,
  pageSize: pageSizeRef,
  onEnter: (rIdx) => {
    const row = props.rows[rIdx];
    if (row) {
      emit('row-dblclick', row);
      emit('edit', row);
    }
  },
  onSelect: (rIdx) => {
    const row = props.rows[rIdx];
    if (!row) return;
    if (props.selectionMode === 'none') return;

    const existingIndex = selectedRows.value.findIndex(
      (item) => item[props.rowKey] === row[props.rowKey],
    );
    if (existingIndex >= 0) {
      selectedRows.value.splice(existingIndex, 1);
    } else {
      if (props.selectionMode === 'single') {
        selectedRows.value = [row];
      } else {
        selectedRows.value.push(row);
      }
    }
    emit('selection', selectedRows.value);
  },
  onDelete: (rIdx) => {
    const row = props.rows[rIdx];
    if (row && props.allowDelete) {
      emit('delete', row);
    }
  },
});

function focusSearch() {
  const el = searchRef.value?.$el?.querySelector('input') || searchRef.value;
  if (el) {
    el.focus();
    el.select?.();
  }
}

function getToolbarFilterCombos(): HTMLElement[] {
  const toolbar = searchRef.value?.$el?.closest('.desk-grid-toolbar') as HTMLElement | null;
  if (!toolbar) return [];
  // Each .desk-filter-select wraps a DeskCombo (q-select). Find the native focusable inside each.
  const comboWrappers = Array.from(toolbar.querySelectorAll<HTMLElement>('.desk-filter-select, .desk-combo'));
  const targets: HTMLElement[] = [];
  for (const wrapper of comboWrappers) {
    // q-select renders a .q-field__native with tabindex="0" as the focusable anchor
    const native =
      wrapper.querySelector<HTMLElement>('.q-field__native[tabindex="0"]') ||
      wrapper.querySelector<HTMLElement>('.q-field__control[tabindex="0"]') ||
      wrapper.querySelector<HTMLElement>('[tabindex="0"]') ||
      (wrapper.getAttribute('tabindex') === '0' ? wrapper : null);
    if (native && native.offsetParent !== null) targets.push(native);
  }
  // Deduplicate
  return [...new Set(targets)];
}

function onSearchKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab' && !event.shiftKey) {
    // Tab: jump to first filter dropdown, not the next button in DOM
    const combos = getToolbarFilterCombos();
    if (combos.length > 0) {
      event.preventDefault();
      combos[0].focus();
    }
    // If no filter combos, let Tab work naturally
  } else if (event.key === 'Tab' && event.shiftKey) {
    // Shift+Tab from search: let it go naturally (upward)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    gridRootRef.value?.focus();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const combos = getToolbarFilterCombos();
    if (combos.length > 0) {
      combos[0].focus();
    } else {
      gridRootRef.value?.focus();
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    filterText.value = '';
    gridRootRef.value?.focus();
  }
}

function onKeyDown(event: KeyboardEvent) {
  const activeEl = document.activeElement as HTMLElement | null;
  const isInsideInput =
    activeEl &&
    (activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable);

  // Shortcut to focus search box: Alt+F, Ctrl+F, or F3
  if (
    (event.altKey && event.key.toLowerCase() === 'f') ||
    (event.ctrlKey && event.key.toLowerCase() === 'f') ||
    event.key === 'F3'
  ) {
    event.preventDefault();
    event.stopPropagation();
    focusSearch();
    return;
  }

  // Ctrl+N to create
  if (event.ctrlKey && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    emit('create');
    return;
  }

  // Table row quick action shortcuts when not inside an input
  if (!isInsideInput) {
    if (event.key.toLowerCase() === 'e') {
      const row = props.rows[activeRow.value];
      if (row) {
        event.preventDefault();
        emit('edit', row);
        return;
      }
    }
    if (event.key.toLowerCase() === 'd') {
      const row = props.rows[activeRow.value];
      if (row && props.allowDelete) {
        event.preventDefault();
        emit('delete', row);
        return;
      }
    }
  }

  // Pass to grid keyboard handler
  handleGridKey(event);
}

function onRowClick(rowIndex: number, row: any) {
  activeRow.value = rowIndex;
  emit('row-click', row);
}

function onCellClick(rowIndex: number, colIndex: number | string) {
  setFocus(rowIndex, Number(colIndex) || 0);
  gridRootRef.value?.focus();
}

function exportCsv() {
  if (props.rows.length === 0) return;

  const header = props.columns.map((c) => `"${c.label}"`).join(',');
  const lines = props.rows.map((row) => {
    return props.columns
      .map((col) => {
        let val: any;
        if (typeof col.field === 'function') {
          val = col.field(row);
        } else {
          val = row[col.field];
        }
        if (col.format) {
          val = col.format(val, row);
        }
        val = val === null || val === undefined ? '' : String(val);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const content = [header, ...lines].join('\r\n');
  const filename = `${props.title || 'export'}_${Date.now()}.csv`;
  exportFile(filename, content, 'text/csv');
}

defineExpose({
  activeRow,
  activeCol,
  selectedRows,
  focusGrid: () => gridRootRef.value?.focus(),
  focusSearch,
  exportCsv,
});
</script>

<style scoped>
kbd {
  background: var(--desk-surface-3, #e2e8f0);
  border: 1px solid var(--desk-border-color, #cbd5e1);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 10px;
  font-family: var(--desk-font-mono, monospace);
  color: var(--desk-text-muted, #475569);
}
</style>
