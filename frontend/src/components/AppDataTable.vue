<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
    <!-- Table Header Toolbar -->
    <div v-if="searchable || $slots.toolbar" class="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div v-if="searchable" class="relative w-full sm:w-72">
        <svg class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder || 'Search records...'"
          class="w-full pl-9 pr-3 py-1.5 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-600 transition-all"
        />
      </div>
      <div class="flex items-center space-x-2">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Scrollable Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <!-- Table Head -->
        <thead>
          <tr class="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
            <th v-if="selectable" class="py-3 px-4 w-10">
              <input
                type="checkbox"
                :checked="isAllSelected"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.name"
              class="py-3 px-4 font-semibold"
              :class="[
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.sortable && 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-200',
              ]"
              @click="col.sortable && toggleSort(col.name)"
            >
              <div class="inline-flex items-center space-x-1" :class="col.align === 'right' ? 'justify-end' : ''">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable && sortColumn === col.name" class="text-blue-600">
                  {{ sortAsc ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="py-12 text-center text-slate-400">
              <div class="inline-flex items-center space-x-2">
                <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs font-medium">Loading telemetry records...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="filteredRows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="py-12 text-center text-slate-500 dark:text-slate-400">
              <div class="max-w-xs mx-auto text-center">
                <p class="text-xs font-medium text-slate-800 dark:text-slate-200">No records found</p>
                <p class="text-[11px] text-slate-400 mt-1">Try refining search parameters or filters.</p>
              </div>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="rowKey ? row[rowKey] : idx"
            class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-100 group"
            :class="selectedRows.includes(row) && 'bg-blue-50/40 dark:bg-blue-950/20'"
          >
            <td v-if="selectable" class="py-3 px-4 w-10">
              <input
                type="checkbox"
                :checked="selectedRows.includes(row)"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                @change="toggleSelectRow(row)"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.name"
              class="py-3 px-4 text-xs text-slate-700 dark:text-slate-300"
              :class="[col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left']"
            >
              <slot :name="`cell-${col.name}`" :row="row" :value="getCellValue(row, col)">
                {{ getCellValue(row, col) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Pagination Footer -->
    <div v-if="filteredRows.length > 0" class="px-4 py-3 bg-slate-50/60 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
      <div>
        Showing <span class="font-medium text-slate-800 dark:text-slate-200">{{ startIndex + 1 }}</span> to
        <span class="font-medium text-slate-800 dark:text-slate-200">{{ Math.min(endIndex, filteredRows.length) }}</span> of
        <span class="font-medium text-slate-800 dark:text-slate-200">{{ filteredRows.length }}</span> records
      </div>

      <div class="flex items-center space-x-1">
        <button
          :disabled="currentPage === 1"
          class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="px-2 py-1 font-mono text-[11px]">
          {{ currentPage }} / {{ totalPages || 1 }}
        </span>
        <button
          :disabled="currentPage >= totalPages"
          class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface ColumnDef {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

const props = withDefaults(
  defineProps<{
    rows: any[];
    columns: ColumnDef[];
    rowKey?: string;
    loading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    selectable?: boolean;
    pageSize?: number;
  }>(),
  {
    loading: false,
    searchable: false,
    selectable: false,
    pageSize: 10,
  },
);

const searchQuery = ref('');
const sortColumn = ref<string | null>(null);
const sortAsc = ref(true);
const currentPage = ref(1);
const selectedRows = ref<any[]>([]);

function getCellValue(row: any, col: ColumnDef) {
  if (typeof col.field === 'function') {
    return col.field(row);
  }
  return row[col.field];
}

function toggleSort(colName: string) {
  if (sortColumn.value === colName) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortColumn.value = colName;
    sortAsc.value = true;
  }
}

const filteredRows = computed(() => {
  let result = [...props.rows];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(row => {
      return props.columns.some(col => {
        const val = getCellValue(row, col);
        return String(val ?? '').toLowerCase().includes(q);
      });
    });
  }

  if (sortColumn.value) {
    const col = props.columns.find(c => c.name === sortColumn.value);
    if (col) {
      result.sort((a, b) => {
        const valA = getCellValue(a, col);
        const valB = getCellValue(b, col);
        if (valA === valB) return 0;
        const cmp = valA > valB ? 1 : -1;
        return sortAsc.value ? cmp : -cmp;
      });
    }
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredRows.value.length / props.pageSize));
const startIndex = computed(() => (currentPage.value - 1) * props.pageSize);
const endIndex = computed(() => startIndex.value + props.pageSize);
const paginatedRows = computed(() => filteredRows.value.slice(startIndex.value, endIndex.value));

const isAllSelected = computed(() => {
  return filteredRows.value.length > 0 && selectedRows.value.length === filteredRows.value.length;
});

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  selectedRows.value = checked ? [...filteredRows.value] : [];
}

function toggleSelectRow(row: any) {
  const idx = selectedRows.value.indexOf(row);
  if (idx > -1) {
    selectedRows.value.splice(idx, 1);
  } else {
    selectedRows.value.push(row);
  }
}
</script>
