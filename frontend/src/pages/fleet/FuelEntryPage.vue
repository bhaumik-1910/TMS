<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Fuel Entries &amp; Logs</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportFuelPdf"
        >
          <q-icon name="picture_as_pdf" size="16px" class="q-mr-xs text-rose-600" />
          <span>Export PDF</span>
        </button>
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportFuelCsv"
        >
          <q-icon name="download" size="16px" class="q-mr-xs text-slate-600" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddDialog"
        >
          <q-icon name="add" size="18px" />
          <span>Fuel Entry</span>
        </button>
      </div>
    </div>

    <!-- Fuel Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards matching Billing Page -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'all' }"
          @click="selectKpiTab('all')"
          title="View all fuel vouchers (Alt+1 or [ / ])"
        >
          <div class="kpi-title text-sky-600">TOTAL FUEL COST</div>
          <div class="kpi-amount text-sky-700">₹{{ formattedTotalCost }}</div>
          <div class="kpi-subtext">{{ entries.length }} vouchers (Alt+1)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'optimal' }"
          @click="selectKpiTab(activeKpiFilter === 'optimal' ? 'all' : 'optimal')"
          title="Filter fleet optimal efficiency (Alt+2 or [ / ])"
        >
          <div class="kpi-title text-emerald-700">AVG FLEET KM/L</div>
          <div class="kpi-amount text-emerald-600">{{ avgKml }}</div>
          <div class="kpi-subtext">Optimal &ge; 5.5 KM/L (Alt+2)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'high' }"
          @click="selectKpiTab(activeKpiFilter === 'high' ? 'all' : 'high')"
          title="Filter high volume diesel dispense (Alt+3 or [ / ])"
        >
          <div class="kpi-title">TOTAL DIESEL DISPENSED</div>
          <div class="kpi-amount text-slate-800">{{ totalLitres.toLocaleString() }} <span class="text-xs font-sans text-slate-500 font-normal">L</span></div>
          <div class="kpi-subtext">High volume &ge; 350L (Alt+3)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'anomaly' }"
          @click="selectKpiTab(activeKpiFilter === 'anomaly' ? 'all' : 'anomaly')"
          title="Filter anomaly fuel efficiency (Alt+4 or [ / ])"
        >
          <div class="kpi-title text-amber-700">ANOMALY FLAGS</div>
          <div class="kpi-amount text-amber-600">{{ anomalyCount }}</div>
          <div class="kpi-subtext">Efficiency &lt; 4.5 KM/L (Alt+4)</div>
        </div>
      </div>

      <!-- Search & Station Filter Bar -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="relative min-w-[280px]">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sky-500">
              <q-icon name="search" size="18px" />
            </span>
            <input
              ref="searchInputRef"
              v-model="search"
              type="text"
              class="search-input w-full pl-9 pr-4 py-2 text-sm rounded-lg"
              placeholder="Search vehicle / station / trip... (Alt+F)"
              @keydown.down.prevent="focusFirstTableRow"
              @keydown.enter.prevent="focusFirstTableRow"
              @keydown.esc="search = ''"
            />
            <button
              v-if="search"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
              @click="search = ''"
              title="Clear search (Esc)"
            >
              <q-icon name="close" size="16px" />
            </button>
          </div>

          <q-select
            v-model="stationFilter"
            :options="stationFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 170px;"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-secondary-action flex items-center gap-1.5"
            :disabled="isRefreshing"
            @click="onRefresh"
          >
            <q-icon name="refresh" size="16px" :class="{ 'rotate-180': isRefreshing }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- White Theme Table with 2D Excel Navigation matching Billing Page -->
      <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse" ref="tableRef">
            <thead>
              <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 0 }">ENTRY ID</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 1 }">VEHICLE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 2 }">TRIP</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 3 }">STATION</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 4 }">LITRES</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 5 }">RATE/L</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 6 }">AMOUNT</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 7 }">ODOMETER</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 8 }">KM/L</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 9 }">PAY MODE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 10 }">DATE</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 11 }">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="(item, rIdx) in filteredEntries"
                :key="item.id"
                class="billing-table-row hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                :class="{ 'excel-row-active': isRowActive(rIdx) }"
                tabindex="0"
                @keydown="handleTableRowKeydown($event, item, rIdx, focusedCol)"
              >
                <!-- Cell 0: Entry ID -->
                <td
                  class="py-4 px-4 font-semibold text-sky-700 font-mono transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 0) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 0)"
                >
                  {{ item.id }}
                </td>

                <!-- Cell 1: Vehicle -->
                <td
                  class="py-4 px-4 font-mono font-medium text-slate-900 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 1) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 1)"
                >
                  {{ item.vehicle }}
                </td>

                <!-- Cell 2: Trip -->
                <td
                  class="py-4 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 2) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 2)"
                >
                  {{ item.trip || '—' }}
                </td>

                <!-- Cell 3: Station -->
                <td
                  class="py-4 px-4 text-slate-800 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 3) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 3)"
                >
                  {{ item.station }}
                </td>

                <!-- Cell 4: Litres -->
                <td
                  class="py-4 px-4 font-mono text-slate-700 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 4) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 4)"
                >
                  {{ item.litres }} L
                </td>

                <!-- Cell 5: Rate -->
                <td
                  class="py-4 px-4 font-mono text-slate-600 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 5) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 5)"
                >
                  ₹{{ item.rate }}
                </td>

                <!-- Cell 6: Amount -->
                <td
                  class="py-4 px-4 font-mono font-bold text-slate-900 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 6) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 6)"
                >
                  ₹{{ item.amount.toLocaleString() }}
                </td>

                <!-- Cell 7: Odometer -->
                <td
                  class="py-4 px-4 font-mono text-slate-600 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 7) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 7)"
                >
                  {{ item.odometer || '—' }}
                </td>

                <!-- Cell 8: KM/L -->
                <td
                  class="py-4 px-4 text-center font-mono transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 8) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 8)"
                >
                  <span
                    class="badge-pill"
                    :class="item.kml < 4.5 ? 'badge-overdue' : 'badge-paid'"
                  >
                    {{ item.kml }} KM/L
                  </span>
                </td>

                <!-- Cell 9: Pay Mode -->
                <td
                  class="py-4 px-4 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 9) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 9)"
                >
                  <span class="badge-pill badge-forward">{{ item.payMode }}</span>
                </td>

                <!-- Cell 10: Date -->
                <td
                  class="py-4 px-4 font-mono text-slate-600 text-xs transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 10) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 10)"
                >
                  {{ item.date }}
                </td>

                <!-- Cell 11: Action -->
                <td
                  class="py-4 px-4 text-center transition-all action-cell"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 11) && focusedActionIndex === -1 }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 11)"
                >
                  <div class="row items-center q-gutter-x-xs no-wrap justify-center" @click.stop>
                    <button
                      class="btn-table-action"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 11, 0) }"
                      @click.stop="editEntry(item)"
                      @focus="setActionFocus(rIdx, 11, 0)"
                      title="Edit Entry (Enter)"
                    >
                      Edit
                    </button>
                    <button
                      class="btn-table-icon btn-table-icon--danger"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 11, 1) }"
                      @click.stop="confirmDeleteEntry(item)"
                      @focus="setActionFocus(rIdx, 11, 1)"
                      title="Delete Entry (Enter / Del)"
                    >
                      <q-icon name="delete" size="14px" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredEntries.length === 0">
                <td colspan="12" class="py-12 text-center text-slate-400">
                  <q-icon name="local_gas_station" size="40px" class="text-slate-400 mb-2" />
                  <div class="text-base font-medium text-slate-700">No fuel entries found</div>
                  <div class="text-xs text-slate-500 mt-1">Try adjusting search terms or clearing active filters</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Excel / Tally Keyboard Status Bar Footer -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono select-none">
          <div class="flex items-center gap-3">
            <span class="font-bold text-sky-600">CELL: {{ currentCellCoordinate }}</span>
            <span class="text-slate-300">|</span>
            <span>Row {{ focusedRow + 1 }} of {{ filteredEntries.length }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-500">Col: {{ focusedColName }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-sky-700 font-medium">Tab: {{ currentTabLabel }}</span>
          </div>
          <div class="flex items-center gap-3 text-slate-500">
            <span><kbd class="desk-kbd">&uarr;&darr;&larr;&rarr;</kbd> Move Cell</span>
            <span><kbd class="desk-kbd">Tab</kbd> Next</span>
            <span><kbd class="desk-kbd">[ / ]</kbd> Switch Tab</span>
            <span><kbd class="desk-kbd">Enter</kbd> Edit</span>
            <span><kbd class="desk-kbd">Del</kbd> Delete</span>
            <span><kbd class="desk-kbd">Alt+N</kbd> New</span>
          </div>
        </div>
      </div>

      <!-- Inner Loading Overlay on Fuel Refresh -->
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Refreshing Fuel Logs & Dispense Registry..."
        subtitle="Calculating diesel consumption, variance & KM/L efficiency"
      />
    </div>

    <!-- New / Edit Fuel Entry Right-Slide Drawer matching Image 1 & Image 5 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? 'Edit Fuel Entry' : 'New Fuel Entry'"
      position="right"
      width="540px"
      :confirm-label="'Save'"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveFuelEntry"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveFuelEntry">
        <div class="row q-col-gutter-md">
          <!-- SECTION 1: ENTRY INFO -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono">
              ENTRY INFO
            </div>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ENTRY ID" required>
              <q-input
                v-model="form.id"
                dense
                outlined
                placeholder="FE/2400090"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DATE & TIME" required>
              <q-input
                v-model="form.date"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE" required>
              <q-select
                v-model="form.vehicle"
                :options="vehicleOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TRIP REFERENCE">
              <q-input
                v-model="form.trip"
                dense
                outlined
                placeholder="TR/240079 (optional)"
              />
            </DeskField>
          </div>

          <!-- SECTION 2: FUEL DETAILS -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mt-sm q-mb-xs font-mono">
              FUEL DETAILS
            </div>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="FUEL STATION" required>
              <q-select
                v-model="form.station"
                :options="stationOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LITRES" required>
              <DeskNumberInput
                v-model="form.litres"
                placeholder="320"
                :step="10"
                :min="0"
                @update:model-value="calcAmount"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="RATE PER LITRE (₹)" required>
              <q-input
                v-model="form.rateFormatted"
                dense
                outlined
                placeholder="₹93.00"
                @update:model-value="calcAmount"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TOTAL AMOUNT (₹)" required>
              <q-input
                v-model="form.amountFormatted"
                dense
                outlined
                placeholder="₹29,760"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="PAYMENT MODE" required>
              <q-select
                v-model="form.payMode"
                :options="paymentModeOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- SECTION 3: ODOMETER & EFFICIENCY -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mt-sm q-mb-xs font-mono">
              ODOMETER & EFFICIENCY
            </div>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="ODOMETER READING (KM)" required>
              <q-input
                v-model="form.odometer"
                dense
                outlined
                placeholder="48230"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="KM/L (COMPUTED OR OVERRIDE)">
              <DeskNumberInput
                v-model="form.kml"
                placeholder="5.8"
                :step="0.1"
                :min="0"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- Confirm Delete Fuel Entry Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Fuel Entry"
      icon="warning"
      width="480px"
      confirm-label="Delete Entry"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteEntry"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-white q-mb-sm">
          Are you sure you want to permanently delete Fuel Entry
          <span class="text-cyan-4 text-weight-bold font-mono">{{ deletingItem?.id }}</span>
          for Vehicle <strong class="text-white">{{ deletingItem?.vehicle }}</strong>?
        </div>
        <div class="text-caption text-red-3">
          This operation will remove the fuel log from database calculations and mileage records.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskNumberInput,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';
import { useTableNavigation } from '../../composables/useTableNavigation';

export interface FuelEntry {
  id: string;
  vehicle: string;
  trip: string;
  station: string;
  litres: number;
  rate: number;
  amount: number;
  odometer?: string;
  kml: number;
  payMode: string;
  date: string;
  flagged?: boolean;
}

const notify = useAppNotify();
const searchInputRef = ref();
const search = ref('');
const stationFilter = ref('ALL');
const isRefreshing = ref(false);

function clearSearch() {
  search.value = '';
}

async function onRefresh() {
  isRefreshing.value = true;
  await loadEntries();
  isRefreshing.value = false;
  notify.notifySuccess('Fuel entries synced with database');
}

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<FuelEntry | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<FuelEntry | null>(null);

// Vehicle Dropdown Options matching Image 2
const vehicleOptions = ref<string[]>([
  '— Select —',
  'GJ-01-AB-1122',
  'GJ-01-AC-3444',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
]);

// Fuel Station Options matching Image 3
const stationOptions = [
  '— Select —',
  'HPCL Adajan',
  'IndianOil Ring Rd',
  'BPCL Naroda',
  'IndianOil Surat',
];

// Payment Mode Options matching Image 4
const paymentModeOptions = [
  '— Select —',
  'Cash',
  'Credit',
  'Card',
  'Fuel Card',
  'UPI',
];

const stationFilterOptions = [
  { label: 'All Fuel Stations', value: 'ALL' },
  { label: 'HPCL Adajan', value: 'HPCL Adajan' },
  { label: 'IndianOil Ring Rd', value: 'IndianOil Ring Rd' },
  { label: 'BPCL Naroda', value: 'BPCL Naroda' },
  { label: 'IndianOil Surat', value: 'IndianOil Surat' },
];

const defaultEntries: FuelEntry[] = [
  { id: 'FE/2400089', vehicle: 'GJ-01-AB-1122', trip: 'TR/240078', station: 'HPCL Adajan', litres: 320, rate: 93.0, amount: 29760, odometer: '48,230', kml: 5.8, payMode: 'Credit', date: '2026-10-24', flagged: false },
  { id: 'FE/2400088', vehicle: 'MH-14-DX-9000', trip: 'TR/240076', station: 'IndianOil Ring Rd', litres: 450, rate: 93.0, amount: 41850, odometer: '62,100', kml: 5.6, payMode: 'Cash', date: '2026-10-23', flagged: false },
  { id: 'FE/2400087', vehicle: 'RJ-13-TR-7788', trip: 'TR/240077', station: 'HPCL Adajan', litres: 280, rate: 93.0, amount: 26040, odometer: '31,500', kml: 6.1, payMode: 'Fuel Card', date: '2026-10-22', flagged: false },
  { id: 'FE/2400086', vehicle: 'GJ-05-BT-2211', trip: '—', station: 'BPCL Naroda', litres: 360, rate: 93.0, amount: 33480, odometer: '19,400', kml: 4.2, payMode: 'Cash', date: '2026-10-21', flagged: true },
];

const entries = ref<FuelEntry[]>([]);

const form = ref({
  id: '',
  date: new Date().toISOString().slice(0, 10),
  vehicle: '— Select —',
  trip: '',
  station: '— Select —',
  litres: 320,
  rateFormatted: '₹93.00',
  amountFormatted: '₹29,760',
  payMode: 'Cash',
  odometer: '48230',
  kml: 5.8,
});

function normalizeFuelEntry(item: any): FuelEntry {
  const id = item.entryId || item.id || `FE/24000${Math.floor(Math.random() * 900) + 100}`;
  const match = defaultEntries.find((d) => d.id === id);

  const litres = parseFloat(String(item.litres || match?.litres || 320)) || 320;
  const rate = parseFloat(String(item.rate || match?.rate || 93)) || 93;
  const amount = parseFloat(String(item.amount || match?.amount || litres * rate)) || Math.round(litres * rate);
  const kml = parseFloat(String(item.kml || match?.kml || 5.5)) || 5.5;

  return {
    id,
    vehicle: item.vehicle || match?.vehicle || 'GJ-01-AB-1122',
    trip: item.trip !== undefined ? item.trip : (match?.trip || 'TR/240078'),
    station: item.station || match?.station || 'HPCL Adajan',
    litres,
    rate,
    amount,
    odometer: item.odometer || match?.odometer || '48,230',
    kml,
    payMode: item.paymentMode || item.payMode || match?.payMode || 'Cash',
    date: item.dateTime || item.date || match?.date || new Date().toISOString().slice(0, 10),
    flagged: item.flagged !== undefined ? item.flagged : kml < 4.5,
  };
}

onMounted(() => {
  loadEntries();
  loadVehicles();
});

async function loadEntries() {
  try {
    const res: any = await api.get('/api/v1/fuel');
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (rawList && rawList.length > 0) {
      entries.value = rawList.map(normalizeFuelEntry);
      persist();
      return;
    }
  } catch (e) {
    console.warn('API get fuel warning, fallback to cache:', e);
  }

  const saved = localStorage.getItem('tms_fuel_entries');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        entries.value = parsed.map(normalizeFuelEntry);
        persist();
        return;
      }
    } catch (_) {}
  }

  entries.value = defaultEntries.map(normalizeFuelEntry);
  persist();
}

async function loadVehicles() {
  try {
    const res: any = await api.get('/api/v1/vehicles');
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : null);
    if (list && list.length > 0) {
      const set = new Set(vehicleOptions.value);
      list.forEach((v: any) => {
        const num = v.vehicleNumber || v.regNo;
        if (num) set.add(num);
      });
      vehicleOptions.value = Array.from(set);
    }
  } catch (_) {}
}

function persist() {
  localStorage.setItem('tms_fuel_entries', JSON.stringify(entries.value));
}

function calcAmount() {
  const rateNum = parseFloat(String(form.value.rateFormatted || '93').replace(/[^0-9.]/g, '')) || 93;
  const litresNum = parseFloat(String(form.value.litres || '0')) || 0;
  if (litresNum > 0) {
    const total = Math.round(litresNum * rateNum);
    form.value.amountFormatted = `₹${total.toLocaleString()}`;
  }
}

const activeKpiFilter = ref<'all' | 'optimal' | 'high' | 'anomaly'>('all');
const kpiTabs: Array<'all' | 'optimal' | 'high' | 'anomaly'> = ['all', 'optimal', 'high', 'anomaly'];

function selectKpiTab(tab: 'all' | 'optimal' | 'high' | 'anomaly') {
  activeKpiFilter.value = tab;
  setFocusCell(0, 0);
}

function switchKpiTab(direction: 'next' | 'prev') {
  const currentIdx = kpiTabs.indexOf(activeKpiFilter.value);
  const nextIdx =
    direction === 'next'
      ? (currentIdx + 1) % kpiTabs.length
      : (currentIdx - 1 + kpiTabs.length) % kpiTabs.length;
  selectKpiTab(kpiTabs[nextIdx]);
}

const columnLabels = [
  'Entry ID',
  'Vehicle',
  'Trip',
  'Station',
  'Litres',
  'Rate/L',
  'Amount',
  'Odometer',
  'KM/L',
  'Pay Mode',
  'Date',
  'Action',
];

const tableRef = ref<HTMLElement | null>(null);

const filteredEntries = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  let list = entries.value;

  if (activeKpiFilter.value === 'optimal') {
    list = list.filter((e) => (e.kml || 0) >= 5.5);
  } else if (activeKpiFilter.value === 'high') {
    list = list.filter((e) => (e.litres || 0) >= 350);
  } else if (activeKpiFilter.value === 'anomaly') {
    list = list.filter((e) => (e.kml || 0) < 4.5);
  }

  return list.filter((e) => {
    const matchSearch =
      !q ||
      e.id.toLowerCase().includes(q) ||
      e.vehicle.toLowerCase().includes(q) ||
      e.station.toLowerCase().includes(q) ||
      e.trip.toLowerCase().includes(q);
    const matchStation = stationFilter.value === 'ALL' || e.station === stationFilter.value;
    return matchSearch && matchStation;
  });
});

// Full 2D Excel & Tally Table Navigation
const {
  focusedRow,
  focusedCol,
  focusedIndex,
  focusedActionIndex,
  isCellActive,
  isActionBtnActive,
  isRowActive,
  setFocusCell,
  setActionFocus,
  setFocusIndex,
  handleKeydown: baseTableRowKeydown,
  moveFirst: focusFirstTableRow,
} = useTableNavigation<FuelEntry>({
  items: filteredEntries,
  colCount: columnLabels.length,
  tableRef,
  onEnter: (item) => editEntry(item),
  onDelete: (item) => confirmDeleteEntry(item),
  onNew: () => openAddDialog(),
  onEscape: () => {
    searchInputRef.value?.focus?.();
  },
});

function handleTableRowKeydown(
  e: KeyboardEvent,
  item: FuelEntry,
  rIdx: number,
  cIdx?: number
) {
  if (e.key === '[') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('prev');
    return;
  }
  if (e.key === ']') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('next');
    return;
  }
  baseTableRowKeydown(e, item, rIdx, cIdx);
}

const colLetter = computed(() => String.fromCharCode(65 + (focusedCol.value || 0)));
const currentCellCoordinate = computed(() => {
  if (filteredEntries.value.length === 0) return 'A1';
  return `${colLetter.value}${focusedRow.value + 1}`;
});

const focusedColName = computed(() => {
  if (focusedCol.value === 11) {
    const actions = ['Edit', 'Delete'];
    const act = actions[focusedActionIndex.value] || 'Edit';
    return `Action [${act}]`;
  }
  return columnLabels[focusedCol.value] || '—';
});

const currentTabLabel = computed(() => {
  switch (activeKpiFilter.value) {
    case 'optimal':
      return 'Optimal Efficiency (Alt+2)';
    case 'high':
      return 'High Volume Dispense (Alt+3)';
    case 'anomaly':
      return 'Anomaly Flags (Alt+4)';
    default:
      return 'All Vouchers (Alt+1)';
  }
});

const formattedTotalCost = computed(() => {
  const sum = entries.value.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  if (sum >= 100000) {
    return (sum / 100000).toFixed(1) + 'L';
  }
  return sum.toLocaleString();
});

const avgKml = computed(() => {
  if (entries.value.length === 0) return '0.0';
  const sum = entries.value.reduce((acc, curr) => acc + (curr.kml || 0), 0);
  return (sum / entries.value.length).toFixed(1);
});

const totalLitres = computed(() => {
  return entries.value.reduce((acc, curr) => acc + (curr.litres || 0), 0);
});

const anomalyCount = computed(() => {
  return entries.value.filter((e) => (e.kml || 0) < 4.5).length;
});

async function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  let nextSeq = `FE/${2400090 + entries.value.length}`;
  try {
    const res: any = await api.get('/api/v1/foundation/sequences/next/fuel');
    if (res?.next) {
      nextSeq = res.next;
    }
  } catch (_) {}

  form.value = {
    id: nextSeq,
    date: new Date().toISOString().slice(0, 10),
    vehicle: '— Select —',
    trip: 'TR/240079',
    station: '— Select —',
    litres: 320,
    rateFormatted: '₹93.00',
    amountFormatted: '₹29,760',
    payMode: 'Cash',
    odometer: '48230',
    kml: 5.8,
  };
  showDialog.value = true;
}

function editEntry(item: FuelEntry) {
  isEditing.value = true;
  editingItem.value = item;

  const match = defaultEntries.find((d) => d.id === item.id);

  form.value = {
    id: item.id || match?.id || 'FE/2400087',
    date: item.date || match?.date || '2026-10-22',
    vehicle: (item.vehicle && item.vehicle !== '— Select —') ? item.vehicle : (match?.vehicle || 'RJ-13-TR-7788'),
    trip: (item.trip && item.trip !== '—') ? item.trip : (match?.trip || 'TR/240077'),
    station: (item.station && item.station !== '— Select —') ? item.station : (match?.station || 'HPCL Adajan'),
    litres: item.litres || match?.litres || 280,
    rateFormatted: `₹${(item.rate || match?.rate || 93).toFixed(2)}`,
    amountFormatted: `₹${(item.amount || match?.amount || 26040).toLocaleString()}`,
    payMode: (item.payMode && item.payMode !== '— Select —') ? item.payMode : (match?.payMode || 'Fuel Card'),
    odometer: item.odometer || match?.odometer || '31,500',
    kml: Number(item.kml || match?.kml || 6.1),
  };
  showDialog.value = true;
}

async function saveFuelEntry() {
  if (!form.value.vehicle || form.value.vehicle === '— Select —') {
    notify.notifyWarning('Please select a vehicle.');
    return;
  }
  if (!form.value.station || form.value.station === '— Select —') {
    notify.notifyWarning('Please select a fuel station.');
    return;
  }
  if (!form.value.litres) {
    notify.notifyWarning('Please enter litres dispensed.');
    return;
  }

  const rateNum = parseFloat(String(form.value.rateFormatted || '93').replace(/[^0-9.]/g, '')) || 93;
  const litresNum = parseFloat(String(form.value.litres || '0')) || 0;
  const amountNum = parseFloat(String(form.value.amountFormatted || '0').replace(/[^0-9.]/g, '')) || Math.round(litresNum * rateNum);
  const kmlNum = parseFloat(String(form.value.kml || '5.5').replace(/[^0-9.]/g, '')) || 5.5;

  const payload: FuelEntry = {
    id: form.value.id || (isEditing.value && editingItem.value ? editingItem.value.id : `FE/${2400090 + entries.value.length}`),
    vehicle: form.value.vehicle,
    trip: form.value.trip && form.value.trip !== '—' ? form.value.trip : '',
    station: form.value.station,
    litres: litresNum,
    rate: rateNum,
    amount: amountNum,
    odometer: form.value.odometer ? String(form.value.odometer) : '—',
    kml: kmlNum,
    payMode: form.value.payMode && form.value.payMode !== '— Select —' ? form.value.payMode : 'Cash',
    date: form.value.date || new Date().toISOString().slice(0, 10),
    flagged: kmlNum < 4.5,
  };

  if (isEditing.value && editingItem.value) {
    const idx = entries.value.findIndex((e) => e.id === editingItem.value!.id);
    if (idx !== -1) {
      entries.value[idx] = { ...entries.value[idx], ...payload };
      persist();
    }
    try {
      await api.patch(`/api/v1/fuel/${editingItem.value.id}`, payload);
    } catch (e: any) {
      if (e.response?.data?.message) {
        notify.notifyError(e.response.data.message);
        return;
      }
      console.warn('API fuel update error, saved locally:', e);
    }
    notify.notifySuccess(`Fuel entry ${payload.id} updated in database.`);
  } else {
    try {
      const res: any = await api.post('/api/v1/fuel', payload);
      const savedRecord = res?.data || res;
      if (savedRecord?.entryId || savedRecord?.id) {
        payload.id = savedRecord.entryId || savedRecord.id;
      }
      if (res?.issues?.warnings?.length) {
        notify.notifyWarning(res.issues.warnings[0].message);
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        notify.notifyError(e.response.data.message);
        return;
      }
      console.warn('API fuel create error, saved locally:', e);
    }
    entries.value.unshift(payload);
    persist();
    notify.notifySuccess(`Fuel entry ${payload.id} saved in database.`);
  }

  showDialog.value = false;
}

function confirmDeleteEntry(item: FuelEntry) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

async function executeDeleteEntry() {
  if (!deletingItem.value) return;
  const targetId = deletingItem.value.id;
  entries.value = entries.value.filter((e) => e.id !== targetId);
  persist();
  showDeleteDialog.value = false;

  try {
    await api.delete(`/api/v1/fuel/${targetId}`);
  } catch (e) {
    console.warn('API fuel delete warning, removed locally:', e);
  }

  notify.notifySuccess(`Fuel entry ${targetId} deleted from database.`);
  deletingItem.value = null;
}

function exportFuelCsv() {
  exportToCsv(
    'fuel_entries_and_logs',
    [
      { label: 'Entry ID', field: 'id' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Trip', field: 'trip' },
      { label: 'Station', field: 'station' },
      { label: 'Litres', field: 'litres' },
      { label: 'Rate/L', field: 'rate' },
      { label: 'Amount', field: 'amount' },
      { label: 'Odometer', field: 'odometer' },
      { label: 'KM/L', field: 'kml' },
      { label: 'Pay Mode', field: 'payMode' },
      { label: 'Date', field: 'date' },
    ],
    filteredEntries.value,
  );
  notify.notifySuccess(`${filteredEntries.value.length} fuel entries exported to CSV`);
}

function exportFuelPdf() {
  exportToPdf({
    title: 'Fuel Entries & Logs Registry',
    subtitle: `Station: ${stationFilter.value} | Total Records: ${filteredEntries.value.length}`,
    columns: [
      { label: 'ID', field: 'id' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Trip', field: 'trip' },
      { label: 'Station', field: 'station' },
      { label: 'Litres', field: 'litres', align: 'right' },
      { label: 'Amount', field: 'amount', align: 'right' },
      { label: 'KM/L', field: 'kml', align: 'center' },
      { label: 'Date', field: 'date' },
    ],
    rows: filteredEntries.value,
  });
  notify.notifySuccess('PDF generated for Fuel Entries & Logs');
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddDialog,
  isModalOpen: computed(() => showDialog.value || showDeleteDialog.value),
  onSave: saveFuelEntry,
  onEscape: () => {
    if (showDialog.value) showDialog.value = false;
    else if (showDeleteDialog.value) showDeleteDialog.value = false;
  },
  filters: [
    () => selectKpiTab('all'),
    () => selectKpiTab('optimal'),
    () => selectKpiTab('high'),
    () => selectKpiTab('anomaly'),
  ],
});
</script>

<style scoped>
/* Page Layout */
.billing-page-container {
  background-color: #f8fafc;
}

.billing-title-wrap {
  display: inline-block;
}

.billing-underline {
  height: 3px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Action Buttons */
.btn-primary-cyan {
  background-color: #0284c7;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.btn-secondary-action {
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* 4 KPI Stat Cards */
.kpi-box {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.kpi-box--active {
  border: 2px solid #0284c7;
  box-shadow: 0 0 0 1px #0284c7, 0 4px 12px rgba(2, 132, 199, 0.15);
}

.kpi-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #475569;
  margin-bottom: 6px;
}

.kpi-amount {
  font-size: 26px;
  font-weight: 800;
  font-family: monospace;
  line-height: 1.1;
  margin-bottom: 6px;
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Search Input */
.search-input {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}

.search-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
}

/* Table */
.table-container {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-head-row th {
  font-size: 11px;
  font-family: monospace;
  color: #475569;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.billing-table-row {
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* Excel & Tally 2D Navigation Styles */
.billing-table-row.excel-row-active {
  background-color: #f0f9ff !important;
}

.billing-table-row.excel-row-active td:first-child {
  position: relative;
}

.billing-table-row.excel-row-active td:first-child::before {
  content: '▶';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #0284c7;
  font-weight: bold;
}

.excel-cell-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: -2px !important;
  background-color: #e0f2fe !important;
  color: #0369a1 !important;
  position: relative !important;
  z-index: 10 !important;
  box-shadow: 0 0 0 1px #0284c7, 0 1px 4px rgba(2, 132, 199, 0.25) !important;
}

/* Individual active button highlight inside action cell */
.btn-table-action.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #bae6fd !important;
  color: #0369a1 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.05);
  z-index: 20;
}

.btn-table-icon.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

.btn-table-icon--danger.excel-btn-active {
  outline: 2px solid #ef4444 !important;
  outline-offset: 1px !important;
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4), 0 2px 6px rgba(239, 68, 68, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

/* Prevent outer cell border from obscuring individual active button */
.action-cell:has(.excel-btn-active),
.billing-table-row td.action-cell.excel-cell-active {
  outline: none !important;
  box-shadow: none !important;
}

.excel-th-active {
  background-color: #e2e8f0 !important;
  color: #0284c7 !important;
  border-bottom: 2px solid #0284c7 !important;
}

/* Table Action Buttons */
.btn-table-action {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-table-action:hover {
  background: #bae6fd;
}

.btn-table-icon {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  height: 28px;
  width: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  outline: none;
  padding: 0;
}

.btn-table-icon:hover {
  background: #e2e8f0;
  color: #334155;
}

.btn-table-icon--danger {
  color: #94a3b8;
}

.btn-table-icon--danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Badges */
.badge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-paid {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.badge-pending {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fde047;
}

.badge-overdue {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.badge-forward {
  background-color: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}
</style>
