<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    transition-show="jump-down"
    transition-hide="jump-up"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @keydown.stop="handleDialogKeydown"
  >
    <q-card class="keys-dialog-card bg-slate-900 text-white border border-slate-700 shadow-2xl">
      <!-- Header -->
      <div class="q-pa-md row items-center justify-between border-b border-slate-800 bg-slate-950">
        <div class="row items-center q-gutter-x-sm">
          <div class="keys-icon-box flex flex-center">
            <q-icon name="keyboard" size="20px" class="text-amber-400" />
          </div>
          <div>
            <div class="row items-center q-gutter-x-xs">
              <span class="text-subtitle1 text-weight-bold text-white">Keyboard Shortcuts & Commands</span>
              <span class="keys-tag font-mono text-xs">Ctrl+Alt+K</span>
            </div>
            <div class="text-caption text-slate-400 text-xs">
              Tally-speed keyboard-driven workflow & ERP navigation shortcuts
            </div>
          </div>
        </div>

        <q-btn flat round dense icon="close" color="grey-5" @click="emit('update:modelValue', false)" />
      </div>

      <!-- Controls Bar: Preset & Search -->
      <div class="q-pa-sm q-px-md bg-slate-800/80 row items-center justify-between border-b border-slate-700/60 no-wrap q-gutter-x-md">
        <!-- Preset Selector -->
        <div class="row items-center q-gutter-x-sm">
          <span class="text-caption text-slate-300 font-mono text-xs text-weight-medium">Preset:</span>
          <q-btn-dropdown
            flat
            dense
            no-caps
            class="preset-dropdown font-mono text-xs"
            :label="currentPresetLabel"
            color="cyan-4"
          >
            <q-list class="bg-slate-900 text-white border border-slate-700">
              <q-item
                v-for="p in TMS_PRESETS"
                :key="p.id"
                clickable
                v-close-popup
                :active="activePresetId === p.id"
                active-class="bg-cyan-900/40 text-cyan-300"
                @click="onSelectPreset(p.id)"
              >
                <q-item-section>
                  <q-item-label class="text-xs font-mono">{{ p.label }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="activePresetId === p.id">
                  <q-icon name="check" size="14px" color="cyan-4" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- Search Input -->
        <div class="col max-w-xs">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            dark
            placeholder="Search action or key..."
            class="search-input text-xs"
          >
            <template #prepend>
              <q-icon name="search" size="16px" color="grey-5" />
            </template>
            <template #append v-if="searchQuery">
              <q-icon name="clear" size="14px" class="cursor-pointer text-grey-5" @click="searchQuery = ''" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Live Key Capture Notice -->
      <div v-if="capturing" class="capture-banner q-pa-sm q-px-md bg-amber-500/10 border-b border-amber-500/30 text-amber-300 row items-center justify-between">
        <div class="row items-center q-gutter-x-sm">
          <q-spinner-dots size="16px" color="amber" />
          <span class="text-caption font-mono text-xs">
            Press new keys for <strong>{{ capturing.action }}</strong> &bull; <kbd class="bg-slate-800 px-1 rounded text-white">Esc</kbd> cancels
          </span>
        </div>
        <q-btn flat dense no-caps label="Cancel" color="amber-4" size="sm" @click="capturing = null" />
      </div>

      <!-- Conflict Warning -->
      <div v-if="conflictWarning" class="warning-banner q-pa-xs q-px-md bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs">
        <q-icon name="warning" size="14px" class="q-mr-xs" />
        {{ conflictWarning }}
      </div>

      <!-- Shortcuts List / Table -->
      <div class="q-pa-none custom-scroll table-container" style="max-height: 380px; overflow-y: auto;">
        <table class="shortcuts-table w-full text-left text-xs font-mono">
          <thead class="sticky-thead bg-slate-950/90 text-slate-400 border-b border-slate-800">
            <tr>
              <th class="q-pa-sm q-pl-md" style="width: 55%;">Action / Operation</th>
              <th class="q-pa-sm" style="width: 30%;">Keyboard Shortcut</th>
              <th class="q-pa-sm q-pr-md text-right" style="width: 15%;">Source</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.id"
              class="shortcut-row hover:bg-slate-800/60 cursor-pointer transition-colors border-b border-slate-800/40"
              :class="{ 'is-capturing': capturing?.id === row.id }"
              @click="startCapture(row)"
            >
              <td class="q-pa-sm q-pl-md">
                <div class="text-white text-weight-medium font-sans text-xs">{{ row.action }}</div>
                <div class="text-slate-500 font-mono text-2xs">{{ row.id }}</div>
              </td>
              <td class="q-pa-sm">
                <span v-if="row.keys" class="key-pill font-mono font-bold text-xs">
                  {{ row.keys }}
                </span>
                <span v-else class="text-slate-600 text-2xs italic">Unbound</span>
              </td>
              <td class="q-pa-sm q-pr-md text-right">
                <span
                  class="source-badge font-mono text-2xs uppercase px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-slate-800 text-slate-400': row.source === 'preset',
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30': row.source === 'custom',
                    'bg-amber-500/20 text-amber-300': row.source === 'desk',
                  }"
                >
                  {{ row.source }}
                </span>
              </td>
            </tr>

            <tr v-if="!filteredRows.length">
              <td colspan="3" class="text-center q-pa-lg text-slate-500">
                No shortcut actions matching "{{ searchQuery }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Buttons -->
      <div class="q-pa-sm q-px-md bg-slate-950 row items-center justify-between border-t border-slate-800">
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            dense
            no-caps
            label="Reset to Preset"
            icon="restart_alt"
            color="grey-5"
            size="sm"
            @click="onReset"
          />
        </div>

        <div class="row items-center q-gutter-x-sm">
          <span class="text-caption text-slate-500 font-mono text-xs">Click any row to remap key</span>
          <q-btn flat dense no-caps label="Close (Esc)" color="cyan-4" size="sm" @click="emit('update:modelValue', false)" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TMS_PRESETS } from './presets';
import { comboToPreset, formatCombo, keyInputOf, toCombo } from './combo';
import {
  deskBindingRows,
  deskConflicts,
  deskPresetId,
  resetDeskBindings,
  setDeskBinding,
  setDeskPreset,
  type DeskBindingRow,
} from './deskKeymap';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const searchQuery = ref('');
const capturing = ref<DeskBindingRow | null>(null);
const conflictWarning = ref('');

const activePresetId = computed(() => deskPresetId());
const currentPresetLabel = computed(() => {
  const found = TMS_PRESETS.find((p) => p.id === activePresetId.value);
  return found ? found.label : 'Custom';
});

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const all = deskBindingRows();
  if (!query) return all;
  return all.filter((r) => r.action.toLowerCase().includes(query) || r.keys.toLowerCase().includes(query) || r.id.toLowerCase().includes(query));
});

function onSelectPreset(id: string) {
  setDeskPreset(id);
  conflictWarning.value = '';
}

function startCapture(row: DeskBindingRow) {
  conflictWarning.value = '';
  capturing.value = row;
}

function onReset() {
  resetDeskBindings();
  conflictWarning.value = '';
  capturing.value = null;
}

function handleDialogKeydown(e: KeyboardEvent) {
  if (capturing.value) {
    e.preventDefault();
    e.stopPropagation();
    const combo = toCombo(keyInputOf(e));
    if (!combo) return;
    if (combo === 'escape') {
      capturing.value = null;
      return;
    }
    const target = capturing.value;
    setDeskBinding(target.id, comboToPreset(combo));
    const others = deskConflicts(target.id, combo);
    conflictWarning.value = others.length
      ? `${formatCombo(combo)} is also used by ${others.join(', ')}.`
      : '';
    capturing.value = null;
    return;
  }

  if (e.key === 'Escape') {
    emit('update:modelValue', false);
  }
}
</script>

<style scoped>
.keys-dialog-card {
  width: 680px;
  max-width: 95vw;
  border-radius: 10px;
  overflow: hidden;
}

.keys-icon-box {
  width: 32px;
  height: 32px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 6px;
}

.keys-tag {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.3);
  color: #38bdf8;
  padding: 1px 6px;
  border-radius: 4px;
}

.preset-dropdown {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.8);
  border-radius: 4px;
}

.shortcuts-table {
  border-collapse: collapse;
}

.sticky-thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

.key-pill {
  display: inline-block;
  background: #1e293b;
  border: 1px solid #475569;
  color: #38bdf8;
  padding: 2px 7px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.shortcut-row.is-capturing {
  background: rgba(245, 158, 11, 0.15) !important;
  border-color: #f59e0b !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #090e1f;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
</style>
