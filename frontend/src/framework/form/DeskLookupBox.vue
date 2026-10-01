<template>
  <div class="desk-lookup-box" ref="rootRef">
    <q-input
      ref="inputRef"
      v-model="displayValue"
      :label="label"
      :hint="hint"
      :error="error"
      :error-message="errorMessage"
      :readonly="readonly"
      :disable="disable"
      dense
      outlined
      class="desk-field-input"
      @keydown="handleTriggerKeyDown"
    >
      <template #append>
        <q-btn
          flat
          dense
          round
          icon="search"
          size="sm"
          class="q-mr-xs"
          :disable="disable || readonly"
          @click="openDialog"
        >
          <q-tooltip>Press F4 to search</q-tooltip>
        </q-btn>
        <span class="desk-key-badge desk-lookup-badge" v-if="!disable">F4</span>
      </template>
    </q-input>

    <!-- Modal Lookup Dialog -->
    <q-dialog
      v-model="isOpen"
      persistent
      no-backdrop-dismiss
      @show="onDialogShow"
      @hide="onDialogHide"
    >
      <div class="desk-lookup-dialog bg-surface" ref="dialogRef">
        <div class="desk-lookup-header q-pa-sm row items-center justify-between border-bottom">
          <div class="text-subtitle2 text-weight-bold flex items-center q-gutter-x-xs">
            <q-icon name="search" size="18px" color="primary" />
            <span>{{ title || `Search ${label || 'Entity'}` }}</span>
          </div>
          <div class="row items-center q-gutter-x-xs">
            <span class="text-caption text-secondary">↑/↓ navigate • Enter select • Esc close</span>
            <q-btn flat dense round icon="close" size="sm" @click="closeDialog" />
          </div>
        </div>

        <div class="q-pa-sm border-bottom">
          <q-input
            ref="searchInputRef"
            v-model="searchQuery"
            dense
            outlined
            placeholder="Type to filter..."
            autofocus
            clearable
            class="desk-lookup-search"
            @keydown="handleSearchKeyDown"
          >
            <template #prepend>
              <q-icon name="search" size="16px" />
            </template>
          </q-input>
        </div>

        <div class="desk-lookup-body scroll">
          <table class="desk-lookup-table full-width">
            <thead>
              <tr>
                <th
                  v-for="col in columns"
                  :key="col.name"
                  :style="{ textAlign: col.align || 'left', width: col.width }"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in filteredItems"
                :key="row[rowKey] || idx"
                :class="{ 'desk-row-active': idx === selectedIndex }"
                @click="selectItem(row)"
                @mouseenter="selectedIndex = idx"
              >
                <td
                  v-for="col in columns"
                  :key="col.name"
                  :style="{ textAlign: col.align || 'left' }"
                >
                  {{ formatCell(row, col) }}
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td :colspan="columns.length" class="text-center text-secondary q-pa-md">
                  No matching records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="desk-lookup-footer q-pa-xs row items-center justify-between border-top bg-subtle">
          <span class="text-caption text-secondary">
            Showing {{ filteredItems.length }} of {{ items.length }} records
          </span>
          <div class="q-gutter-x-sm">
            <q-btn flat dense size="sm" label="Cancel (Esc)" @click="closeDialog" />
            <q-btn
              unelevated
              dense
              size="sm"
              color="primary"
              label="Select (Enter)"
              :disable="!filteredItems[selectedIndex]"
              @click="selectItem(filteredItems[selectedIndex])"
            />
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useDeskLayers } from '../layout/layers';
import { trapFocus, FocusTrapController } from '../focus/trap';

export interface LookupColumn {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: 'left' | 'center' | 'right';
  width?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: any;
    label?: string;
    hint?: string;
    error?: boolean;
    errorMessage?: string;
    readonly?: boolean;
    disable?: boolean;
    title?: string;
    rowKey?: string;
    displayField?: string;
    items?: any[];
    columns?: LookupColumn[];
  }>(),
  {
    rowKey: 'id',
    displayField: 'name',
    items: () => [],
    columns: () => [
      { name: 'name', label: 'Name', field: 'name', align: 'left' },
      { name: 'code', label: 'Code', field: 'code', align: 'left' },
    ],
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'select', row: any): void;
}>();

const { pushLayer, popLayer } = useDeskLayers();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<any>(null);
const dialogRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<any>(null);

const isOpen = ref(false);
const searchQuery = ref('');
const selectedIndex = ref(0);
let trapController: FocusTrapController | null = null;

const displayValue = computed({
  get() {
    if (!props.modelValue) return '';
    if (typeof props.modelValue === 'object') {
      return props.modelValue[props.displayField] || props.modelValue.code || '';
    }
    const found = props.items.find((item) => item[props.rowKey] === props.modelValue);
    if (found) {
      return found[props.displayField] || found.code || '';
    }
    return String(props.modelValue);
  },
  set(val) {
    if (!val) {
      emit('update:modelValue', null);
      emit('select', null);
    }
  },
});

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items;
  const q = searchQuery.value.toLowerCase().trim();
  return props.items.filter((item) => {
    return props.columns.some((col) => {
      const val = formatCell(item, col);
      return String(val || '').toLowerCase().includes(q);
    });
  });
});

function formatCell(row: any, col: LookupColumn): string {
  if (typeof col.field === 'function') {
    return col.field(row);
  }
  return row[col.field] ?? '';
}

function handleTriggerKeyDown(e: KeyboardEvent) {
  if (e.key === 'F4') {
    e.preventDefault();
    e.stopPropagation();
    openDialog();
  }
}

function handleSearchKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedIndex.value < filteredItems.value.length - 1) {
      selectedIndex.value++;
      scrollToActiveRow();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
      scrollToActiveRow();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const item = filteredItems.value[selectedIndex.value];
    if (item) {
      selectItem(item);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeDialog();
  }
}

function scrollToActiveRow() {
  nextTick(() => {
    const activeEl = dialogRef.value?.querySelector('.desk-row-active') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  });
}

function openDialog() {
  if (props.disable || props.readonly) return;
  isOpen.value = true;
  searchQuery.value = '';
  selectedIndex.value = 0;
}

function closeDialog() {
  isOpen.value = false;
}

function selectItem(row: any) {
  if (!row) return;
  emit('update:modelValue', row[props.rowKey]);
  emit('select', row);
  closeDialog();
}

function onDialogShow() {
  const layerId = `desk-lookup-${Date.now()}`;
  pushLayer({
    id: layerId,
    type: 'MODAL',
    openerElement: inputRef.value?.$el?.querySelector('input'),
    onDismiss: () => {
      closeDialog();
    },
  });

  nextTick(() => {
    if (dialogRef.value) {
      trapController = trapFocus(dialogRef.value, {
        initialFocus: searchInputRef.value?.$el?.querySelector('input'),
      });
    }
  });
}

function onDialogHide() {
  if (trapController) {
    trapController.release();
    trapController = null;
  }
  popLayer();
}
</script>

<style scoped>
.desk-lookup-box {
  width: 100%;
}

.desk-lookup-badge {
  font-size: 10px;
  background: var(--desk-surface-3, #f1f5f9);
  color: var(--desk-text-muted, #64748b);
  border: 1px solid var(--desk-border-color, #cbd5e1);
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 2px;
}

.desk-lookup-dialog {
  width: 580px;
  max-width: 95vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.desk-lookup-body {
  max-height: 380px;
  overflow-y: auto;
}

.desk-lookup-table {
  border-collapse: collapse;
  font-size: 12px;
}

.desk-lookup-table th {
  position: sticky;
  top: 0;
  background: var(--desk-surface-2, #f8fafc);
  color: var(--desk-text-muted, #64748b);
  font-weight: 600;
  padding: 6px 10px;
  border-bottom: 1px solid var(--desk-border-color, #cbd5e1);
  z-index: 1;
}

.desk-lookup-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--desk-border-subtle, #e2e8f0);
}

.desk-lookup-table tr {
  cursor: pointer;
}

.desk-lookup-table tr:hover {
  background: var(--desk-surface-2, #f1f5f9);
}

.desk-row-active {
  background: var(--desk-primary-subtle, #e0f2fe) !important;
  color: var(--desk-primary, #0284c7) !important;
  font-weight: 600;
}
</style>
