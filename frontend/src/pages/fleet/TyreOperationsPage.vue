<template>
  <div class="tyre-operations-page p-3 sm:p-4 text-slate-100 font-sans">
    <!-- Header matching Image 1 & Image 2 -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-white relative inline-block">
          Tyre Operations
          <div class="title-underline"></div>
        </div>
      </div>

      <!-- + Tyre Event button only visible on Fit / Remove / Events tab matching Image 2 -->
      <div v-if="activeTab === 'events'" class="row items-center q-gutter-x-sm">
        <button
          type="button"
          class="desk-btn-cyan-action"
          @click="openAddEventDialog"
        >
          <q-icon name="add" size="18px" />
          <span>Tyre Event</span>
        </button>
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
              <td class="font-mono font-bold text-cyan-400">{{ item.serialNo || item.id }}</td>
              <td class="font-medium text-white">{{ item.brand }}</td>
              <td class="font-mono text-slate-300">{{ item.size }}</td>
              <td>
                <span
                  class="type-pill"
                  :class="item.type === 'Retread' ? 'type-pill--retread' : 'type-pill--new'"
                >
                  {{ item.type }}
                </span>
              </td>
              <td class="text-slate-300">{{ item.supplier }}</td>
              <td class="font-mono text-slate-300">{{ formatCost(item.cost) }}</td>
              <td class="font-mono text-slate-300">{{ item.vehicle || '—' }}</td>
              <td class="font-mono text-slate-300">{{ item.position || '—' }}</td>
              <td class="font-mono text-slate-400">{{ item.fitDate || '—' }}</td>
              <td class="font-mono text-slate-300">{{ formatOdometer(item.fitOdom) }}</td>
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
              <td class="font-mono font-bold text-cyan-400">{{ ev.eventId || ev.id }}</td>
              <td class="font-mono text-slate-200">{{ ev.tyreSerial }}</td>
              <td class="font-mono text-slate-200">{{ ev.vehicle }}</td>
              <td>
                <span class="event-pill" :class="getEventPillClass(ev.eventType)">
                  {{ ev.eventType }}
                </span>
              </td>
              <td class="font-mono text-slate-300">{{ ev.position }}</td>
              <td class="font-mono text-slate-400">{{ ev.date }}</td>
              <td class="font-mono text-slate-300">{{ formatOdometer(ev.odometer) }}</td>
              <td class="text-slate-300">{{ ev.remarks || '—' }}</td>
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
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import {
  DeskDialog,
  DeskForm,
  DeskField,
} from '../../framework';

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
</script>

<style scoped>
.tyre-operations-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.title-underline {
  height: 3px;
  background: #00e5ff;
  width: 32px;
  margin-top: 5px;
  border-radius: 2px;
}

.desk-btn-cyan-action {
  background: #00e5ff;
  color: #020617;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.desk-btn-cyan-action:hover {
  background: #33ebff;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
}

.tyre-tab-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0d172b;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.tyre-tab-btn:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.tyre-tab-btn.active {
  background: #00e5ff;
  color: #020617;
  border-color: #00e5ff;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
}

/* Cyber Card & Table matching Image 1 & Image 2 */
.cyber-card {
  background: #090f1d;
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
  color: #00e5ff;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 0.84rem;
}

.cyber-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.025);
}

/* Type Pill (New vs Retread) matching Image 1 */
.type-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.type-pill--new {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.type-pill--retread {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Status Pill (FITTED vs Scrapped) matching Image 1 */
.status-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-pill--fitted {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.status-pill--scrapped {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Event Type Pills matching Image 2 */
.event-pill {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
}

.pill-fit {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.pill-rotate {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.pill-scrap {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pill-remove {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.pill-retread {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.pill-repair {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.pill-default {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-table-action {
  height: 28px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid rgba(0, 229, 255, 0.4);
  background: rgba(0, 229, 255, 0.08);
  color: #00e5ff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-table-action:hover {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
}
</style>
