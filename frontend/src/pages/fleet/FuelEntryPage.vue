<template>
  <div class="fuel-entry-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="local_gas_station" color="cyan" size="24px" />
          <span>Fuel Entry & Fleet Consumption</span>
        </div>
        <div class="text-caption text-grey-5">
          Diesel dispense logging, mileage KM/L verification, variance tracking &bull; Press <kbd class="desk-kbd">Ctrl+N</kbd> for fuel entry
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="refresh"
          label="Refresh"
          class="desk-btn-secondary"
          :loading="isRefreshing"
          @click="onRefresh"
        >
          <template #loading>
            <q-spinner color="cyan" size="16px" />
          </template>
          <q-tooltip>Refresh Fuel Logs</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="add"
          label="Fuel Entry"
          class="desk-btn-primary"
          @click="openAddDialog"
        >
          <q-tooltip>Record New Fuel Dispense (Ctrl+N)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Fuel Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL FUEL COST</div>
        <div class="text-3xl font-extrabold font-mono text-cyan-400 my-1">₹{{ formattedTotalCost }}</div>
        <div class="text-xs text-slate-400 font-mono">{{ entries.length }} entries recorded</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">AVG KM/L</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">{{ avgKml }}</div>
        <div class="text-xs text-emerald-400 font-mono">Target: 5.5 (Fleet Optimal)</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">TOTAL CONSUMPTION</div>
        <div class="text-3xl font-extrabold font-mono text-white my-1">{{ totalLitres.toLocaleString() }} L</div>
        <div class="text-xs text-slate-400 font-mono">Fleet Diesel Dispensed</div>
        <div class="accent-bar bg-cyan-400"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-800 bg-[#0d172b] relative overflow-hidden">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">ANOMALY FLAGS</div>
        <div class="text-3xl font-extrabold font-mono text-amber-400 my-1">{{ anomalyCount }}</div>
        <div class="text-xs text-amber-300 font-mono">Efficiency &lt; 4.5 KM/L</div>
        <div class="accent-bar bg-amber-400"></div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="cyber-card p-3 mb-4">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Search vehicle / station / trip... (Alt+F)"
            class="desk-search-input"
            style="min-width: 260px;"
          >
            <template #prepend>
              <q-icon name="search" size="18px" color="cyan" />
            </template>
            <template #append v-if="search">
              <q-icon
                name="cancel"
                size="18px"
                class="cursor-pointer text-slate-400 hover:text-white"
                @click.stop.prevent="clearSearch"
                @mousedown.stop.prevent="clearSearch"
              />
            </template>
          </q-input>

          <q-select
            v-model="stationFilter"
            :options="stationFilterOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 150px;"
          />
        </div>

        <div class="row items-center q-gutter-x-xs no-wrap">
          <q-btn
            flat
            dense
            icon="refresh"
            class="desk-grid-refresh-btn"
            :loading="isRefreshing"
            @click="onRefresh"
          >
            <q-tooltip>Refresh Fuel Entries</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Pure Cyber-Dark Table matching Reference Image 1 & 2 -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing fuel records...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>ENTRY ID</th>
            <th>VEHICLE</th>
            <th>TRIP</th>
            <th>STATION</th>
            <th class="text-right">LITRES</th>
            <th class="text-right">RATE/L</th>
            <th class="text-right">AMOUNT</th>
            <th class="text-center">KM/L</th>
            <th>PAY MODE</th>
            <th>DATE</th>
            <th class="text-center">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredEntries" :key="item.id">
            <td class="font-mono font-bold text-cyan-400">{{ item.id }}</td>
            <td class="font-mono text-white font-semibold">{{ item.vehicle }}</td>
            <td class="font-mono text-slate-400">{{ item.trip || '—' }}</td>
            <td class="text-slate-200">{{ item.station }}</td>
            <td class="font-mono text-right text-slate-200">{{ item.litres }} L</td>
            <td class="font-mono text-right text-slate-400">₹{{ item.rate }}</td>
            <td class="font-mono text-right font-bold text-white">₹{{ item.amount.toLocaleString() }}</td>
            <td class="text-center font-mono">
              <span
                class="desk-pill"
                :class="item.kml < 4.5 ? 'desk-pill-danger' : 'desk-pill-success'"
              >
                {{ item.kml }} KM/L
              </span>
            </td>
            <td>
              <span class="subtype-pill sub-customer">{{ item.payMode }}</span>
            </td>
            <td class="font-mono text-slate-400">{{ item.date }}</td>
            <td class="text-center">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <button class="btn-table-action" @click="editEntry(item)">Edit</button>
                <button
                  class="btn-table-icon btn-table-icon--danger"
                  @click="confirmDeleteEntry(item)"
                  title="Delete Entry"
                >
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredEntries.length === 0">
            <td colspan="11" class="text-center py-12">
              <div class="column items-center justify-center text-center q-pa-xl">
                <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); margin: 0 auto;">
                  <q-icon name="search_off" size="28px" class="text-slate-400" />
                </div>
                <div class="text-subtitle1 text-weight-bold text-slate-200">No matching records found</div>
                <div class="text-caption text-slate-500 q-mt-xs">Try adjusting your search terms or clearing active filters.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <!-- Inner Loading Overlay on Fuel Refresh -->
      <q-inner-loading :showing="isRefreshing" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Refreshing Fuel Logs & Dispense Registry...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Calculating diesel consumption, variance & KM/L efficiency
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Record / Edit Fuel Entry Desk Dialog matching Image 1 -->
    <DeskDialog
      v-model="showDialog"
      :title="isEditing ? `Edit Fuel Entry — ${editingItem?.id}` : 'Record New Fuel Entry'"
      width="580px"
      :confirm-label="isEditing ? 'Update Entry' : 'Save Fuel Entry'"
      cancel-label="Cancel"
      @confirm="saveFuelEntry"
      @cancel="showDialog = false"
    >
      <DeskForm @submit="saveFuelEntry">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Fleet Vehicle Number" required shortcut="1">
              <DeskCombo
                v-model="form.vehicle"
                :options="vehicleOptions"
                placeholder="Select vehicle..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Associated Trip ID" shortcut="2">
              <DeskCombo
                v-model="form.trip"
                :options="tripOptions"
                placeholder="Select or enter Trip ID..."
              />
            </DeskField>
          </div>

          <div class="col-12">
            <DeskField label="Fuel Station / Pump" required shortcut="3">
              <DeskCombo
                v-model="form.station"
                :options="stationOptions"
                placeholder="Select fuel station..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Fuel Litres (L)" required shortcut="4">
              <DeskNumberInput
                v-model="form.litres"
                placeholder="e.g. 320"
                :step="1"
                :min="0"
                @update:model-value="calcAmount"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Diesel Rate (₹ / Litre)" required shortcut="5">
              <DeskNumberInput
                v-model="form.rate"
                placeholder="e.g. 93.00"
                :step="0.5"
                :min="0"
                @update:model-value="calcAmount"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Total Amount (₹)" required shortcut="6">
              <DeskNumberInput
                v-model="form.amount"
                placeholder="e.g. 29760"
                :step="100"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Calculated Mileage (KM/L)" shortcut="7">
              <DeskNumberInput
                v-model="form.kml"
                placeholder="e.g. 5.8"
                :step="0.1"
                :min="0"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Payment Mode" required shortcut="8">
              <DeskCombo
                v-model="form.payMode"
                :options="['Credit', 'Cash', 'Fuel Card', 'Fastag Fuel']"
                placeholder="Select payment mode..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Dispense Date" required shortcut="9">
              <DeskDateInput
                v-model="form.date"
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
import { useAppNotify } from '../../composables/useAppNotify';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
  DeskNumberInput,
  DeskDateInput,
} from '../../framework';

export interface FuelEntry {
  id: string;
  vehicle: string;
  trip: string;
  station: string;
  litres: number;
  rate: number;
  amount: number;
  kml: number;
  payMode: string;
  date: string;
  flagged?: boolean;
}

const notify = useAppNotify();
const search = ref('');
const stationFilter = ref('ALL');
const isRefreshing = ref(false);

function clearSearch() {
  search.value = '';
}

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    notify.notifySuccess('Fuel entries synced with station log');
  }, 600);
}

const showDialog = ref(false);
const isEditing = ref(false);
const editingItem = ref<FuelEntry | null>(null);

const showDeleteDialog = ref(false);
const deletingItem = ref<FuelEntry | null>(null);

const vehicleOptions = [
  'GJ-01-AB-1122',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
  'GJ-06-ZZ-3344',
];

const tripOptions = [
  'TR/240078',
  'TR/240077',
  'TR/240076',
  'TR/240075',
];

const stationOptions = [
  'HPCL Adajan',
  'IndianOil Ring Rd',
  'BPCL Naroda',
  'Reliance Petro Hub',
  'Essar Highway Hub',
];

const stationFilterOptions = [
  { label: 'All Fuel Stations', value: 'ALL' },
  { label: 'HPCL Adajan', value: 'HPCL Adajan' },
  { label: 'IndianOil Ring Rd', value: 'IndianOil Ring Rd' },
  { label: 'BPCL Naroda', value: 'BPCL Naroda' },
];

const defaultEntries: FuelEntry[] = [
  { id: 'FE/2400089', vehicle: 'GJ-01-AB-1122', trip: 'TR/240078', station: 'HPCL Adajan', litres: 320, rate: 93.0, amount: 29760, kml: 5.8, payMode: 'Credit', date: '2026-10-24', flagged: false },
  { id: 'FE/2400088', vehicle: 'MH-14-DX-9000', trip: 'TR/240076', station: 'IndianOil Ring Rd', litres: 450, rate: 93.0, amount: 41850, kml: 5.6, payMode: 'Cash', date: '2026-10-23', flagged: false },
  { id: 'FE/2400087', vehicle: 'RJ-13-TR-7788', trip: 'TR/240077', station: 'HPCL Adajan', litres: 280, rate: 93.0, amount: 26040, kml: 6.1, payMode: 'Fuel Card', date: '2026-10-22', flagged: false },
  { id: 'FE/2400086', vehicle: 'GJ-05-BT-2211', trip: '', station: 'BPCL Naroda', litres: 360, rate: 93.0, amount: 33480, kml: 4.2, payMode: 'Cash', date: '2026-10-21', flagged: true },
];

const entries = ref<FuelEntry[]>([]);
const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Fuel Logs Refreshed',
      caption: 'Dispense records and KM/L calculations synced.',
      timeout: 1800,
      position: 'top-right',
    });
  }, 650);
}

onMounted(() => {
  const saved = localStorage.getItem('tms_fuel_entries');
  if (saved) {
    try {
      entries.value = JSON.parse(saved);
    } catch {
      entries.value = defaultEntries;
    }
  } else {
    entries.value = defaultEntries;
    persist();
  }
});

function persist() {
  localStorage.setItem('tms_fuel_entries', JSON.stringify(entries.value));
}

const form = ref<Omit<FuelEntry, 'id'>>({
  vehicle: 'GJ-01-AB-1122',
  trip: 'TR/240078',
  station: 'HPCL Adajan',
  litres: 300,
  rate: 93.0,
  amount: 27900,
  kml: 5.5,
  payMode: 'Credit',
  date: new Date().toISOString().slice(0, 10),
});

function calcAmount() {
  if (form.value.litres && form.value.rate) {
    form.value.amount = Math.round(form.value.litres * form.value.rate);
  }
}

const filteredEntries = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  return entries.value.filter((e) => {
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

function openAddDialog() {
  isEditing.value = false;
  editingItem.value = null;
  form.value = {
    vehicle: 'GJ-01-AB-1122',
    trip: 'TR/240078',
    station: 'HPCL Adajan',
    litres: 300,
    rate: 93.0,
    amount: 27900,
    kml: 5.5,
    payMode: 'Credit',
    date: new Date().toISOString().slice(0, 10),
  };
  showDialog.value = true;
}

function editEntry(item: FuelEntry) {
  isEditing.value = true;
  editingItem.value = item;
  form.value = {
    vehicle: item.vehicle,
    trip: item.trip,
    station: item.station,
    litres: item.litres,
    rate: item.rate,
    amount: item.amount,
    kml: item.kml,
    payMode: item.payMode,
    date: item.date,
  };
  showDialog.value = true;
}

function saveFuelEntry() {
  if (!form.value.vehicle || !form.value.station || !form.value.litres) {
    notify.warning('Please enter vehicle, station, and litres.');
    return;
  }

  if (isEditing.value && editingItem.value) {
    const idx = entries.value.findIndex((e) => e.id === editingItem.value!.id);
    if (idx !== -1) {
      entries.value[idx] = {
        ...entries.value[idx],
        ...form.value,
        flagged: form.value.kml < 4.5,
      };
      persist();
      notify.success(`Fuel entry ${editingItem.value.id} updated.`);
    }
  } else {
    const seq = 2400090 + entries.value.length;
    const newEntry: FuelEntry = {
      id: `FE/${seq}`,
      ...form.value,
      flagged: form.value.kml < 4.5,
    };
    entries.value.unshift(newEntry);
    persist();
    notify.success(`Fuel entry ${newEntry.id} recorded successfully.`);
  }

  showDialog.value = false;
}

function confirmDeleteEntry(item: FuelEntry) {
  deletingItem.value = item;
  showDeleteDialog.value = true;
}

function executeDeleteEntry() {
  if (!deletingItem.value) return;
  entries.value = entries.value.filter((e) => e.id !== deletingItem.value!.id);
  persist();
  notify.success(`Fuel entry ${deletingItem.value.id} deleted.`);
  showDeleteDialog.value = false;
}
</script>

<style scoped>
.fuel-entry-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.stat-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #00f2fe;
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.desk-kbd {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #00f2fe;
  font-family: var(--desk-font-mono, monospace);
  font-size: 10px;
}

/* Cyber Card & Table matching Image 1 & 2 */
.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
}

.cyber-table th {
  background: rgba(255, 255, 255, 0.02);
  color: #00f2fe;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-left: none !important;
  border-right: none !important;
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-left: none !important;
  border-right: none !important;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.cyber-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
}

.subtype-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.sub-customer {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}
</style>
