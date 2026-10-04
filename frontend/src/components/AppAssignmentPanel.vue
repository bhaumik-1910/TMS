<template>
  <div class="assignment-card">
    <!-- Header -->
    <div class="assignment-header">
      <div class="flex items-center gap-2">
        <div class="assignment-icon-box">
          <q-icon name="hub" size="18px" class="text-cyan-300" />
        </div>
        <div>
          <div class="text-sm font-bold text-white tracking-wide font-sans">
            Resource Assignment Matrix
          </div>
          <div class="text-xs text-slate-400 font-mono mt-0.5">
            Responsible personnel and contracted transport partners
          </div>
        </div>
      </div>
      <PermissionGate permission="dispatch:assign">
        <button type="button" class="btn-modify-assignment" @click="openDialog">
          <q-icon name="edit" size="13px" class="q-mr-xs text-cyan-300" />
          <span>Modify Assignments</span>
        </button>
      </PermissionGate>
    </div>

    <!-- Assignments Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <!-- 1. Transport Planner -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="person_outline" size="14px" class="text-cyan-400" />
          <span class="tile-title">Transport Planner</span>
        </div>
        <div class="tile-value">{{ assignments?.planner?.name || 'Rahul Patel' }}</div>
        <div class="tile-meta">Central Planning Desk</div>
      </div>

      <!-- 2. Assigned Dispatcher -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="headset_mic" size="14px" class="text-cyan-400" />
          <span class="tile-title">Assigned Dispatcher</span>
        </div>
        <div class="tile-value">{{ assignments?.dispatcher?.name || 'Amit Shah' }}</div>
        <div class="tile-meta">Midwest Dispatch Hub</div>
      </div>

      <!-- 3. Assigned Driver -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="badge" size="14px" class="text-cyan-400" />
          <span class="tile-title">Assigned Driver</span>
        </div>
        <div class="tile-value text-cyan-300">{{ assignments?.driver?.name || driverName || 'Unassigned' }}</div>
        <div class="tile-meta flex items-center gap-1">
          <q-icon name="call" size="11px" class="text-slate-400" />
          <span>{{ driverPhone || '+1 (312) 555-0144' }}</span>
        </div>
      </div>

      <!-- 4. Contracted Carrier (3PL) -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="local_shipping" size="14px" class="text-cyan-400" />
          <span class="tile-title">Contracted Carrier (3PL)</span>
        </div>
        <div class="tile-value">{{ assignments?.carrier?.name || carrierName || 'Swift Linehaul Express' }}</div>
        <div class="tile-meta text-emerald-400 font-bold flex items-center gap-1">
          <q-icon name="verified" size="12px" />
          <span>Tier 1 • Score: 4.9 ★</span>
        </div>
      </div>

      <!-- 5. Assigned Tractor -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="rv_hookup" size="14px" class="text-cyan-400" />
          <span class="tile-title">Assigned Tractor</span>
        </div>
        <div class="tile-value font-mono text-cyan-200">{{ vehiclePlate || 'GJ-01-AB-1122' }}</div>
        <div class="tile-meta">Dry Van 53ft</div>
      </div>

      <!-- 6. Account Customer -->
      <div class="assignment-tile">
        <div class="tile-header">
          <q-icon name="storefront" size="14px" class="text-cyan-400" />
          <span class="tile-title">Account Customer</span>
        </div>
        <div class="tile-value truncate">{{ customerName || 'Global Retail Direct Inc.' }}</div>
        <div class="tile-meta">Primary Shipper</div>
      </div>
    </div>

    <!-- Reassignment Dialog -->
    <q-dialog v-model="dialogOpen">
      <div class="reassign-modal-card">
        <div class="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div class="flex items-center gap-2">
            <q-icon name="swap_horiz" size="20px" class="text-cyan-300" />
            <span class="text-base font-bold text-white font-mono">Reassign Shipment Personnel</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup size="sm" color="grey-5" />
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider">Assignment Type</label>
            <q-select
              v-model="selectedType"
              :options="['DRIVER', 'VEHICLE', 'CARRIER']"
              outlined
              dense
              dark
              class="bg-slate-900/80"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider">Select New Assignee</label>
            <q-input
              v-model="targetAssignee"
              outlined
              dense
              dark
              class="bg-slate-900/80"
              placeholder="Enter driver or tractor ID..."
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider">Reassignment Reason (Audited)</label>
            <q-input
              v-model="reason"
              outlined
              dense
              dark
              class="bg-slate-900/80"
              placeholder="e.g. Previous driver hours of service reached"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5 pt-3 border-t border-cyan-500/20">
          <button type="button" class="btn-modal-cancel" v-close-popup>
            Cancel
          </button>
          <button type="button" class="btn-modal-save" @click="saveAssignment">
            <q-icon name="check" size="14px" class="q-mr-xs" />
            Save Assignment
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppNotify } from '../composables/useAppNotify';
import PermissionGate from './PermissionGate.vue';

const props = defineProps<{
  resourceId?: string;
  assignments?: any;
  driverName?: string;
  driverPhone?: string;
  carrierName?: string;
  vehiclePlate?: string;
  customerName?: string;
}>();

const emit = defineEmits<{
  (e: 'reassigned', data: any): void;
}>();

const notify = useAppNotify();
const dialogOpen = ref(false);
const selectedType = ref('DRIVER');
const targetAssignee = ref('');
const reason = ref('Operational reassignment');

function openDialog() {
  dialogOpen.value = true;
}

function saveAssignment() {
  if (!targetAssignee.value) {
    notify.warning('Please specify an assignee');
    return;
  }
  emit('reassigned', {
    type: selectedType.value,
    target: targetAssignee.value,
    reason: reason.value,
  });
  dialogOpen.value = false;
  notify.success(`${selectedType.value} reassigned successfully!`);
}
</script>

<style scoped>
.assignment-card {
  background: linear-gradient(135deg, rgba(11, 20, 44, 0.95) 0%, rgba(7, 13, 29, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.22);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
}

.assignment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 14px;
}

.assignment-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-modify-assignment {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.35);
  color: #00f2fe;
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modify-assignment:hover {
  background: rgba(0, 242, 254, 0.18);
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}

/* Individual Tiles */
.assignment-tile {
  background: rgba(8, 14, 30, 0.85);
  border: 1px solid rgba(0, 242, 254, 0.14);
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

.assignment-tile:hover {
  border-color: rgba(0, 242, 254, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.tile-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tile-title {
  color: #38bdf8;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-family: monospace;
}

.tile-value {
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.tile-meta {
  color: #94a3b8;
  font-size: 11px;
  font-family: monospace;
  margin-top: 3px;
}

/* Modal */
.reassign-modal-card {
  width: 460px;
  max-width: 95vw;
  background: #091024;
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.btn-modal-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  font-size: 12px;
  font-family: monospace;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-modal-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn-modal-save {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #00f2fe 0%, #2563eb 100%);
  border: none;
  color: #040914;
  font-size: 12px;
  font-family: monospace;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.35);
  transition: all 0.15s ease;
}

.btn-modal-save:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.5);
}
</style>
