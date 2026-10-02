<template>
  <div class="desk-pivot-container" tabindex="0" @keydown="handleKeyNavigation">
    <div class="desk-pivot-header q-pa-sm row items-center justify-between">
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="pivot_table_chart" color="cyan-4" size="18px" />
        <span class="text-subtitle2 font-mono text-weight-bold text-white">{{ title || 'PIVOT ANALYSIS' }}</span>
      </div>
      <div class="text-caption text-slate-400 font-mono">
        <kbd class="desk-key">↑</kbd> <kbd class="desk-key">↓</kbd> Navigate Rows
      </div>
    </div>

    <div class="desk-pivot-scroll-body scroll">
      <table class="desk-pivot-table">
        <thead>
          <tr>
            <th
              v-for="rowDim in config.rows"
              :key="rowDim.field"
              class="desk-pivot-th desk-dim-th"
              :style="{ width: rowDim.width }"
            >
              {{ rowDim.label }}
            </th>
            <th
              v-for="colVal in pivotResult.columnHeaders"
              :key="colVal"
              :colspan="config.measures.length"
              class="desk-pivot-th desk-col-group-th text-center"
            >
              {{ colVal }}
            </th>
          </tr>
          <tr v-if="config.measures.length > 1 || config.columns.length > 0">
            <th
              v-for="rowDim in config.rows"
              :key="`sub_${rowDim.field}`"
              class="desk-pivot-subth"
            ></th>
            <template v-for="colVal in pivotResult.columnHeaders" :key="`subhead_${colVal}`">
              <th
                v-for="m in config.measures"
                :key="`${colVal}_${m.field}`"
                class="desk-pivot-subth text-right"
              >
                {{ m.label }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rIdx) in pivotResult.matrixRows"
            :key="row.key"
            class="desk-pivot-tr"
            :class="{ 'desk-pivot-tr--active': rIdx === selectedRowIndex }"
            @click="selectedRowIndex = rIdx"
          >
            <td
              v-for="rowDim in config.rows"
              :key="rowDim.field"
              class="desk-pivot-td desk-dim-td"
            >
              {{ row.labels[rowDim.field] }}
            </td>
            <template v-for="colVal in pivotResult.columnHeaders" :key="`td_${colVal}`">
              <td
                v-for="m in config.measures"
                :key="`cell_${colVal}_${m.field}`"
                class="desk-pivot-td text-right font-mono"
              >
                {{ row.cells[config.columns[0] ? `${colVal}_${m.field}` : m.field]?.formatted ?? '-' }}
              </td>
            </template>
          </tr>
          <tr v-if="pivotResult.matrixRows.length === 0">
            <td
              :colspan="config.rows.length + pivotResult.columnHeaders.length * config.measures.length"
              class="text-center text-slate-500 q-pa-lg"
            >
              No pivot records available.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PivotConfig } from './types';
import { useDeskPivot } from './useDeskPivot';

const props = defineProps<{
  title?: string;
  data: any[];
  config: PivotConfig;
}>();

const { pivotResult, selectedRowIndex, selectNextRow, selectPrevRow } = useDeskPivot(
  () => props.data,
  () => props.config
);

function handleKeyNavigation(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectNextRow();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectPrevRow();
  }
}
</script>

<style scoped>
.desk-pivot-container {
  background: #091322;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  outline: none;
}

.desk-pivot-container:focus {
  border-color: #00f2fe;
}

.desk-pivot-header {
  background: #0d1a2d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.desk-pivot-scroll-body {
  max-height: 480px;
  overflow: auto;
}

.desk-pivot-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

.desk-pivot-th,
.desk-pivot-subth {
  background: #0b1524;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: sticky;
  top: 0;
  z-index: 2;
}

.desk-dim-th {
  color: #38bdf8;
  text-align: left;
}

.desk-col-group-th {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.desk-pivot-td {
  padding: 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.desk-dim-td {
  font-weight: 600;
  color: #e2e8f0;
}

.desk-pivot-tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.desk-pivot-tr--active {
  background: rgba(0, 242, 254, 0.12) !important;
  color: #00f2fe !important;
}

.desk-key {
  background: #1e293b;
  color: #38bdf8;
  border: 1px solid #334155;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.7rem;
}
</style>
