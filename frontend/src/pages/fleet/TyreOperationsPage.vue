<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Tyre Inventory &amp; Operations</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddEventDialog"
        >
          <q-icon name="add" size="18px" />
          <span>Tyre Event</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI Stat Cards matching Billing Page -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="kpi-box kpi-box--active">
        <div class="kpi-title text-sky-600">TOTAL TYRE ASSETS</div>
        <div class="kpi-amount text-sky-700">{{ tyres.length }}</div>
        <div class="kpi-subtext">Tracked fleet inventory</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title text-emerald-700">FITTED ON FLEET</div>
        <div class="kpi-amount text-emerald-600">{{ fittedCount }}</div>
        <div class="kpi-subtext">Axle mounted rolling units</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">WAREHOUSE STOCK</div>
        <div class="kpi-amount text-slate-800">{{ stockCount }}</div>
        <div class="kpi-subtext">Available unassigned tyres</div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title text-amber-700">RETREAD / SCRAP</div>
        <div class="kpi-amount text-amber-600">{{ scrappedCount }}</div>
        <div class="kpi-subtext">Retreaded or decommissioned</div>
      </div>
    </div>

    <!-- Segmented Tab Toggle matching Image 1 & Image 2 -->
    <div class="row items-center q-mb-lg q-gutter-x-sm">
      <button
        type="button"
        class="tyre-tab-btn"
        :class="{ active: activeTab === 'register' }"
        @click="activeTab = 'register'"
      >
        Tyre Register
      </button>
      <button
        type="button"
        class="tyre-tab-btn"
        :class="{ active: activeTab === 'events' }"
        @click="activeTab = 'events'"
      >
        Fit / Remove / Events
      </button>
    </div>

    <!-- Main Tables Container -->
    <div class="relative min-h-[400px]">
      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Tyre Data..."
        subtitle="Loading records from PostgreSQL database"
      />

      <!-- TAB 1: Tyre Register Table matching Image 1 exactly -->
      <div v-if="activeTab === 'register'" class="cyber-card table-wrap relative-position">
        <table class="cyber-table">
          <thead>
            <tr>
              <th>SERIAL NO</th>
              <th>BRAND</th>
              <th>SIZE</th>
              <th>TYPE</th>
              <th>SUPPLIER</th>
              <th>COST</th>
              <th>VEHICLE</th>
              <th>POSITION</th>
              <th>FIT DATE</th>
              <th>FIT ODOM</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tyres" :key="item.serialNo || item.id">
              <td class="font-mono font-bold text-sky-700">{{ item.serialNo || item.id }}</td>
              <td class="font-medium text-slate-900">{{ item.brand }}</td>
              <td class="font-mono text-slate-700">{{ item.size }}</td>
              <td>
                <span
                  class="type-pill"
                  :class="item.type === 'Retread' ? 'type-pill--retread' : 'type-pill--new'"
                >
                  {{ item.type }}
                </span>
              </td>
              <td class="text-slate-800">{{ item.supplier }}</td>
              <td class="font-mono text-slate-700">{{ formatCost(item.cost) }}</td>
              <td class="font-mono text-slate-700">{{ item.vehicle || '—' }}</td>
              <td class="font-mono text-slate-700">{{ item.position || '—' }}</td>
              <td class="font-mono text-slate-600">{{ item.fitDate || '—' }}</td>
              <td class="font-mono text-slate-700">{{ formatOdometer(item.fitOdom) }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="item.status === 'Scrapped' ? 'status-pill--scrapped' : 'status-pill--fitted'"
                >
                  {{ item.status }}
                </span>
              </td>
            </tr>
            <tr v-if="tyres.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                No tyre inventory records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TAB 2: Fit / Remove / Events Table matching Image 2 exactly -->
      <div v-else class="cyber-card table-wrap relative-position">
        <table class="cyber-table">
          <thead>
            <tr>
              <th>EVENT ID</th>
              <th>TYRE SERIAL</th>
              <th>VEHICLE</th>
              <th>EVENT TYPE</th>
              <th>POSITION</th>
              <th>DATE</th>
              <th>ODOMETER</th>
              <th>REMARKS</th>
              <th class="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id || ev.eventId">
              <td class="font-mono font-bold text-sky-700">{{ ev.eventId || ev.id }}</td>
              <td class="font-mono text-slate-800">{{ ev.tyreSerial }}</td>
              <td class="font-mono text-slate-800">{{ ev.vehicle }}</td>
              <td>
                <span class="event-pill" :class="getEventPillClass(ev.eventType)">
                  {{ ev.eventType }}
                </span>
              </td>
              <td class="font-mono text-slate-700">{{ ev.position }}</td>
              <td class="font-mono text-slate-600">{{ ev.date }}</td>
              <td class="font-mono text-slate-700">{{ formatOdometer(ev.odometer) }}</td>
              <td class="text-slate-700">{{ ev.remarks || '—' }}</td>
              <td class="text-center">
                <button class="btn-table-action" @click="editEvent(ev)">Edit</button>
              </td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-400">
                No tyre events found. Click "+ Tyre Event" to record a new event.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Drawer for New / Edit Tyre Event matching Image 1 from previous turn -->
    <DeskDialog
      v-model="showEventDialog"
      :title="isEditingEvent ? 'Edit Tyre Event' : 'New Tyre Event'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveEvent"
      @cancel="showEventDialog = false"
    >
      <DeskForm @submit="saveEvent">
        <div class="row q-col-gutter-md">
          <!-- SECTION: EVENT DETAILS -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-cyan-4 q-mb-xs font-mono uppercase tracking-wider">
              EVENT DETAILS
            </div>
          </div>

          <!-- Row 1: EVENT ID & DATE -->
          <div class="col-12 col-md-6">
            <DeskField label="EVENT ID" required>
              <q-input
                v-model="eventForm.eventId"
                dense
                outlined
                placeholder="TE/240013"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DATE" required>
              <q-input
                v-model="eventForm.date"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <!-- Row 2: TYRE SERIAL NO & VEHICLE -->
          <div class="col-12 col-md-6">
            <DeskField label="TYRE SERIAL NO" required>
              <q-select
                v-model="eventForm.tyreSerial"
                :options="tyreSerialOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE" required>
              <q-select
                v-model="eventForm.vehicle"
                :options="vehicleOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 3: EVENT TYPE & TYRE POSITION -->
          <div class="col-12 col-md-6">
            <DeskField label="EVENT TYPE" required>
              <q-select
                v-model="eventForm.eventType"
                :options="eventTypeOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="TYRE POSITION" required>
              <q-input
                v-model="eventForm.position"
                dense
                outlined
                placeholder="FR / FL / RR / RL / SR"
              />
            </DeskField>
          </div>

          <!-- Row 4: ODOMETER (KM) -->
          <div class="col-12 col-md-6">
            <DeskField label="ODOMETER (KM)" required>
              <q-input
                v-model="eventForm.odometer"
                dense
                outlined
                placeholder="48230"
              />
            </DeskField>
          </div>

          <!-- Row 5: REMARKS -->
          <div class="col-12">
            <DeskField label="REMARKS">
              <q-input
                v-model="eventForm.remarks"
                type="textarea"
                rows="3"
                dense
                outlined
                placeholder="Event details, reason for removal, damage description..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import {
  DeskDialog,
  DeskForm,
  DeskField,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

export interface TyreInventoryItem {
  id?: string;
  serialNo: string;
  brand: string;
  size: string;
  type: string;
  supplier: string;
  cost: number | string;
  vehicle: string;
  position: string;
  fitDate: string;
  fitOdom: string | number;
  status: string;
}

export interface TyreEventItem {
  id?: string;
  eventId: string;
  date: string;
  tyreSerial: string;
  vehicle: string;
  eventType: string;
  position: string;
  odometer: string | number;
  remarks?: string;
}

const notify = useAppNotify();

// Active tab can toggle between 'register' (Image 1) and 'events' (Image 2)
const activeTab = ref<'register' | 'events'>('register');
const isRefreshing = ref(false);

// Dropdown options matching Image 2, 3, 4 from previous turn
const vehicleOptions = ref<string[]>([
  '— Select —',
  'GJ-01-AB-1122',
  'GJ-01-AC-3444',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
]);

const tyreSerialOptions = ref<string[]>([
  '— Select —',
  'TYR-GJ01-001',
  'TYR-GJ01-002',
  'TYR-MH14-001',
  'TYR-SCRAP-001',
]);

const eventTypeOptions = [
  '— Select —',
  'Fit',
  'Remove',
  'Rotate',
  'Retread',
  'Scrap',
  'Puncture Repair',
];

// Seeded Default Tyres matching Image 1
const defaultTyres: TyreInventoryItem[] = [
  {
    serialNo: 'TYR-GJ01-001',
    brand: 'MRF',
    size: '295/80R22.5',
    type: 'New',
    supplier: 'Tata Rubber Ltd',
    cost: 28000,
    vehicle: 'GJ-01-AB-1122',
    position: 'FR',
    fitDate: '2026-01-15',
    fitOdom: '40,000',
    status: 'FITTED',
  },
  {
    serialNo: 'TYR-GJ01-002',
    brand: 'Apollo',
    size: '295/80R22.5',
    type: 'New',
    supplier: 'Tata Rubber Ltd',
    cost: 26500,
    vehicle: 'GJ-01-AB-1122',
    position: 'FL',
    fitDate: '2026-01-15',
    fitOdom: '40,000',
    status: 'FITTED',
  },
  {
    serialNo: 'TYR-MH14-001',
    brand: 'CEAT',
    size: '315/80R22.5',
    type: 'New',
    supplier: 'Tata Rubber Ltd',
    cost: 31000,
    vehicle: 'MH-14-DX-9000',
    position: 'FR',
    fitDate: '2025-06-20',
    fitOdom: '55,000',
    status: 'FITTED',
  },
  {
    serialNo: 'TYR-SCRAP-001',
    brand: 'MRF',
    size: '295/80R22.5',
    type: 'Retread',
    supplier: 'Tata Rubber Ltd',
    cost: 26000,
    vehicle: '—',
    position: '—',
    fitDate: '2024-04-01',
    fitOdom: '12,000',
    status: 'Scrapped',
  },
];

// Seeded Default Events matching Image 2
const defaultEvents: TyreEventItem[] = [
  {
    id: 'TE/240012',
    eventId: 'TE/240012',
    date: '2026-01-15',
    tyreSerial: 'TYR-GJ01-001',
    vehicle: 'GJ-01-AB-1122',
    eventType: 'Fit',
    position: 'FR',
    odometer: '40,000',
    remarks: 'New tyre fitted front right',
  },
  {
    id: 'TE/240011',
    eventId: 'TE/240011',
    date: '2026-05-10',
    tyreSerial: 'TYR-MH14-001',
    vehicle: 'MH-14-DX-9000',
    eventType: 'Rotate',
    position: 'RR->FR',
    odometer: '58,500',
    remarks: 'Rotation as per schedule',
  },
  {
    id: 'TE/240010',
    eventId: 'TE/240010',
    date: '2026-03-01',
    tyreSerial: 'TYR-SCRAP-001',
    vehicle: 'RJ-13-TR-7788',
    eventType: 'Scrap',
    position: 'RL',
    odometer: '52,000',
    remarks: 'Sidewall damage, unrepairable',
  },
];

const tyres = ref<TyreInventoryItem[]>([]);
const fittedCount = computed(() => tyres.value.filter((t) => t.status === 'Fitted' || t.status === 'FITTED' || (t.vehicle && t.vehicle !== '—')).length);
const stockCount = computed(() => tyres.value.filter((t) => t.status === 'Stock' || t.status === 'STOCK' || !t.vehicle || t.vehicle === '—').length);
const scrappedCount = computed(() => tyres.value.filter((t) => t.status === 'Scrapped' || t.status === 'SCRAPPED').length);
const events = ref<TyreEventItem[]>([]);

// Event Dialog State
const showEventDialog = ref(false);
const isEditingEvent = ref(false);
const editingEventItem = ref<TyreEventItem | null>(null);

const eventForm = ref<TyreEventItem>({
  eventId: 'TE/240013',
  date: new Date().toISOString().slice(0, 10),
  tyreSerial: '— Select —',
  vehicle: '— Select —',
  eventType: '— Select —',
  position: 'FR',
  odometer: '48230',
  remarks: '',
});

onMounted(async () => {
  await Promise.all([loadTyres(), loadEvents()]);
  fetchDynamicVehicles();
});

async function loadTyres() {
  try {
    const res = await api.get('/api/v1/tyres');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      tyres.value = res.data;
    } else {
      tyres.value = [...defaultTyres];
    }
  } catch (err) {
    console.warn('Could not load tyres from API, using fallback:', err);
    const saved = localStorage.getItem('tms_tyre_inventory_data');
    if (saved) {
      try {
        tyres.value = JSON.parse(saved);
      } catch {
        tyres.value = [...defaultTyres];
      }
    } else {
      tyres.value = [...defaultTyres];
    }
  }
}

async function loadEvents() {
  isRefreshing.value = true;
  try {
    const res = await api.get('/api/v1/tyre-events');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      events.value = res.data;
    } else {
      events.value = [...defaultEvents];
    }
  } catch (err) {
    console.warn('Could not load tyre events from API, using fallback:', err);
    const saved = localStorage.getItem('tms_tyre_events');
    if (saved) {
      try {
        events.value = JSON.parse(saved);
      } catch {
        events.value = [...defaultEvents];
      }
    } else {
      events.value = [...defaultEvents];
    }
  } finally {
    isRefreshing.value = false;
  }
}

async function fetchDynamicVehicles() {
  try {
    const res = await api.get('/api/v1/vehicles');
    if (res.data && Array.isArray(res.data)) {
      const vList = res.data
        .map((v: any) => v.registrationNumber || v.vehicleNumber || v.regNo || v.plateNumber)
        .filter(Boolean);
      for (const reg of vList) {
        if (!vehicleOptions.value.includes(reg)) {
          vehicleOptions.value.push(reg);
        }
      }
    }
  } catch {
    // Keep defaults
  }
}

function formatCost(val: any): string {
  if (!val) return '₹0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
  return '₹' + num.toLocaleString();
}

function formatOdometer(val: any): string {
  if (!val) return '0';
  const str = String(val).replace(/,/g, '');
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    return num.toLocaleString();
  }
  return String(val);
}

function getEventPillClass(type: string): string {
  switch (type) {
    case 'Fit':
      return 'pill-fit';
    case 'Rotate':
      return 'pill-rotate';
    case 'Scrap':
      return 'pill-scrap';
    case 'Remove':
      return 'pill-remove';
    case 'Retread':
      return 'pill-retread';
    case 'Puncture Repair':
      return 'pill-repair';
    default:
      return 'pill-default';
  }
}

function openAddEventDialog() {
  isEditingEvent.value = false;
  editingEventItem.value = null;
  const seq = 240013 + events.value.length;
  eventForm.value = {
    eventId: `TE/${seq}`,
    date: new Date().toISOString().slice(0, 10),
    tyreSerial: '— Select —',
    vehicle: '— Select —',
    eventType: '— Select —',
    position: 'FR',
    odometer: '48230',
    remarks: '',
  };
  showEventDialog.value = true;
}

function editEvent(item: TyreEventItem) {
  isEditingEvent.value = true;
  editingEventItem.value = item;
  eventForm.value = {
    id: item.id,
    eventId: item.eventId || item.id || 'TE/240013',
    date: item.date || new Date().toISOString().slice(0, 10),
    tyreSerial: item.tyreSerial || '— Select —',
    vehicle: item.vehicle || '— Select —',
    eventType: item.eventType || '— Select —',
    position: item.position || 'FR',
    odometer: item.odometer || '48230',
    remarks: item.remarks || '',
  };
  showEventDialog.value = true;
}

async function saveEvent() {
  if (
    !eventForm.value.eventId ||
    eventForm.value.tyreSerial === '— Select —' ||
    eventForm.value.vehicle === '— Select —' ||
    eventForm.value.eventType === '— Select —'
  ) {
    notify.warning('Please select Tyre Serial, Vehicle, and Event Type.');
    return;
  }

  const payload = {
    ...eventForm.value,
    id: eventForm.value.eventId,
  };

  try {
    if (isEditingEvent.value && editingEventItem.value) {
      const editId = editingEventItem.value.id || editingEventItem.value.eventId;
      await api.patch(`/api/v1/tyre-events/${editId}`, payload);
      const idx = events.value.findIndex((e) => (e.id || e.eventId) === editId);
      if (idx !== -1) {
        events.value[idx] = { ...events.value[idx], ...payload };
      }
      notify.success(`Tyre Event ${payload.eventId} updated successfully.`);
    } else {
      await api.post('/api/v1/tyre-events', payload);
      events.value.unshift(payload);
      notify.success(`Tyre Event ${payload.eventId} recorded in database.`);
    }
    localStorage.setItem('tms_tyre_events', JSON.stringify(events.value));
  } catch (err: any) {
    console.warn('API error, saving locally:', err);
    if (isEditingEvent.value && editingEventItem.value) {
      const editId = editingEventItem.value.id || editingEventItem.value.eventId;
      const idx = events.value.findIndex((e) => (e.id || e.eventId) === editId);
      if (idx !== -1) {
        events.value[idx] = { ...events.value[idx], ...payload };
      }
      notify.success(`Tyre Event ${payload.eventId} updated locally.`);
    } else {
      events.value.unshift(payload);
      notify.success(`Tyre Event ${payload.eventId} saved.`);
    }
    localStorage.setItem('tms_tyre_events', JSON.stringify(events.value));
  }

  showEventDialog.value = false;
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  onNewRecord: openAddEventDialog,
  filters: [
    () => { activeTab.value = 'register'; },
    () => { activeTab.value = 'events'; },
  ],
  isModalOpen: () => showEventDialog.value,
  onSave: saveEvent,
  onEscape: () => {
    showEventDialog.value = false;
  },
});
</script>

<style scoped>
.tyre-operations-page {
  background-color: #f8fafc;
  min-height: calc(100vh - 88px);
}

.title-underline {
  height: 3px;
  background: #0284c7;
  width: 32px;
  margin-top: 5px;
  border-radius: 2px;
}

.desk-btn-cyan-action {
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #0369a1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.desk-btn-cyan-action:hover {
  background: #0369a1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tyre-tab-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
}

.tyre-tab-btn:hover {
  background: #f1f5f9;
  border-color: #0284c7;
  color: #0284c7;
}

.tyre-tab-btn.active {
  background: #0284c7;
  border-color: #0369a1;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);
}

/* White ERP Card & Table */
.cyber-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 240px);
  min-height: 200px;
  scroll-behavior: smooth;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
}

.cyber-table th {
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #cbd5e1;
  position: sticky;
  top: 0;
  z-index: 5;
}

.cyber-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
  font-size: 0.8125rem;
}

.cyber-table tbody tr:hover {
  background: #f8fafc;
}

/* Type Pill (New vs Retread) */
.type-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-pill--new {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.type-pill--retread {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* Status Pill (FITTED vs Scrapped) */
.status-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-pill--fitted {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.status-pill--scrapped {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Event Type Pills */
.event-pill {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 4px;
}

.pill-fit {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.pill-rotate {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.pill-scrap {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.pill-remove {
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

.pill-retread {
  background: #faf5ff;
  color: #6b21a8;
  border: 1px solid #e9d5ff;
}

.pill-repair {
  background: #fefce8;
  color: #854d0e;
  border: 1px solid #fef08a;
}

.pill-default {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-table-action {
  height: 28px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid #bae6fd;
  background: #eff6ff;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-table-action:hover {
  background: #e0f2fe;
  border-color: #0284c7;
}
</style>
