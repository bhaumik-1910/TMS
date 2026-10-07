<template>
  <div
    class="desk-grid"
    tabindex="0"
    ref="gridRootRef"
    @keydown="onKeyDown"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @focusin="onGridFocusIn"
  >
    <!-- Grid Action Toolbar -->
    <div class="desk-grid-toolbar row items-center justify-between no-wrap q-gutter-x-sm">
      <!-- Left: Title & Quick Search -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <div v-if="title" class="text-weight-bold text-subtitle2 text-slate-800 font-mono no-wrap tracking-wide">
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
          color="primary"
          class="desk-grid-refresh-btn"
          :loading="isLoading"
          @click="handleRefresh"
        >
          <template #loading>
            <q-spinner color="primary" size="16px" />
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
          <div class="text-subtitle1 text-weight-bold text-slate-800">No matching records found</div>
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
              'desk-cell-active': props.pageIndex === activeRow && Number(cIdx) === activeCol,
              'desk-cell-editing': props.pageIndex === activeRow && Number(cIdx) === activeCol && isEditing,
            }"
            @click.stop="onCellClick(props.pageIndex, Number(cIdx))"
          >
            <!-- High-Contrast Inline Cell Editor -->
            <input
              v-if="props.pageIndex === activeRow && Number(cIdx) === activeCol && isEditing"
              ref="inlineInputRef"
              v-model="inlineEditValue"
              class="desk-cell-inline-input"
              @keydown.stop="onInlineInputKey"
              @blur="onInlineInputBlur"
            />
            <template v-else>
              <slot :name="`body-cell-${col.name}`" :props="props" :value="props.row[col.field]">
                {{ col.format ? col.format(props.row[col.field], props.row) : props.row[col.field] }}
              </slot>
            </template>
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
          Col: <strong>{{ activeActionBtnLabel ? `Actions [${activeActionBtnLabel}]` : (columns[activeCol]?.label || activeCol + 1) }}</strong>
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
import { ref, computed, toRef, onMounted, onBeforeUnmount } from 'vue';
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
  (e: 'cell-change', payload: { row: any; rowIndex: number; colIndex: number; field: string; oldValue: any; newValue: any }): void;
}>();

const gridRootRef = ref<HTMLElement | null>(null);
const qTableRef = ref<any>(null);
const searchRef = ref<any>(null);
const isFocused = ref(false);
const filterText = ref('');
const selectedRows = ref<any[]>([]);

const inlineEditValue = ref('');
const inlineInputRef = ref<HTMLInputElement | null>(null);

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

function isCellEditable(rIdx: number, cIdx: number): boolean {
  const col = props.columns[cIdx];
  if (!col) return false;
  if (col.editable === false || col.name === 'actions' || col.name === 'select') return false;
  return true;
}

function handleCellCommit() {
  const row = props.rows[activeRow.value];
  const col = props.columns[activeCol.value];
  if (!row || !col) return;

  const field = typeof col.field === 'string' ? col.field : col.name;
  const oldValue = row[field];
  const newValue = inlineEditValue.value;
  if (oldValue !== newValue) {
    row[field] = newValue;
    emit('cell-change', {
      row,
      rowIndex: activeRow.value,
      colIndex: activeCol.value,
      field,
      oldValue,
      newValue,
    });
  }
}

function onInlineInputKey(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.stopPropagation();
    handleCellCommit();
    stopEdit();
    moveRight();
    return;
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    event.stopPropagation();
    handleCellCommit();
    stopEdit();
    if (event.shiftKey) {
      moveLeft();
    } else {
      moveRight();
    }
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    stopEdit();
    return;
  }
}

function onInlineInputBlur() {
  if (isEditing.value) {
    handleCellCommit();
    stopEdit();
  }
}

const {
  activeRow,
  activeCol,
  activeRowIndex,
  activeColIndex,
  activeActionIndex,
  isEditing,
  setFocus,
  moveRight,
  moveLeft,
  startEdit,
  stopEdit,
  handleKeyDown: handleGridKey,
  syncActionButtonFocus,
} = useGridKeyboard({
  rowCount,
  colCount,
  pageSize: pageSizeRef,
  gridRootRef,
  isCellEditable,
  onEdit: (rIdx, cIdx, initialChar) => {
    const row = props.rows[rIdx];
    const col = props.columns[cIdx];
    if (row && col) {
      const field = typeof col.field === 'string' ? col.field : col.name;
      inlineEditValue.value = initialChar !== undefined ? initialChar : String(row[field] ?? '');
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          if (inlineInputRef.value) {
            inlineInputRef.value.focus();
            if (initialChar === undefined) {
              inlineInputRef.value.select();
            }
          }
        });
      });
    }
  },
  onEnter: (rIdx) => {
    // When Enter is pressed on non-editable cell, trigger edit modal
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

function onGridFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  // If focus entered the search input or a filter, don't interfere
  if (target.closest('.desk-grid-toolbar')) return;

  const btn = target.closest('button, .q-btn') as HTMLElement | null;
  if (!btn) return;

  const td = btn.closest('td') as HTMLElement | null;
  if (!td) return;
  const tr = td.closest('tr') as HTMLElement | null;
  if (!tr) return;

  const tbody = tr.parentElement;
  if (!tbody) return;
  const trs = Array.from(tbody.children).filter((el) => !el.classList.contains('q-table__loading'));
  const rIdx = trs.indexOf(tr);
  const tds = Array.from(tr.children);
  const cIdx = tds.indexOf(td);

  if (rIdx >= 0 && cIdx >= 0) {
    activeRow.value = rIdx;
    activeCol.value = cIdx;
    const buttons = Array.from(
      td.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), .q-btn:not([disabled]):not([tabindex="-1"])'
      )
    );
    const btnIdx = buttons.indexOf(btn);
    if (btnIdx >= 0) {
      activeActionIndex.value = btnIdx;
      gridRootRef.value?.querySelectorAll('.desk-btn-active, .excel-btn-active').forEach((el) => {
        el.classList.remove('desk-btn-active', 'excel-btn-active');
      });
      btn.classList.add('desk-btn-active', 'excel-btn-active');
    }
  }
}

const activeActionBtnLabel = computed(() => {
  if (activeActionIndex.value < 0) return '';
  const root = gridRootRef.value;
  if (!root) return '';
  const cell = root.querySelector('.desk-cell-active') as HTMLElement | null;
  if (!cell) return '';
  const buttons = Array.from(
    cell.querySelectorAll<HTMLElement>(
      'button:not([disabled]):not([tabindex="-1"]), .q-btn:not([disabled]):not([tabindex="-1"])'
    )
  );
  const btn = buttons[activeActionIndex.value];
  if (!btn) return '';
  const text = btn.innerText?.trim();
  if (text) return text;
  const title = btn.getAttribute('title');
  if (title) return title;
  const aria = btn.getAttribute('aria-label');
  if (aria) return aria;
  return `Action ${activeActionIndex.value + 1}`;
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

  // Alt+C, Ctrl+N, or Insert to create new record (Tally standard)
  if (
    (event.altKey && event.key.toLowerCase() === 'c') ||
    (event.ctrlKey && event.key.toLowerCase() === 'n') ||
    event.key === 'Insert'
  ) {
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

onMounted(() => {
  window.addEventListener('desk:new-record', onGlobalNewRecord);
  window.addEventListener('desk:focus-search', onGlobalFocusSearch);
});

onBeforeUnmount(() => {
  window.removeEventListener('desk:new-record', onGlobalNewRecord);
  window.removeEventListener('desk:focus-search', onGlobalFocusSearch);
});

function onGlobalNewRecord() {
  if (props.allowCreate) {
    emit('create');
  }
}

function onGlobalFocusSearch() {
  focusSearch();
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
