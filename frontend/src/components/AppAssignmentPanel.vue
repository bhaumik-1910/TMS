<template>
  <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
      <div>
        <div class="text-sm font-bold text-slate-900">Resource Assignment Matrix</div>
        <div class="text-xs text-slate-500">Responsible personnel and contracted transport partners</div>
      </div>
      <PermissionGate permission="dispatch:assign">
        <q-btn flat dense no-caps color="primary" icon="edit" label="Modify Assignments" size="xs" @click="openDialog" />
      </PermissionGate>
    </div>

    <!-- Assignments Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Transport Planner</div>
        <div class="font-bold text-slate-800 mt-0.5">{{ assignments?.planner?.name || 'Rahul Patel' }}</div>
        <div class="text-slate-500 text-[11px] font-mono">Central Planning Desk</div>
      </div>

      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Assigned Dispatcher</div>
        <div class="font-bold text-slate-800 mt-0.5">{{ assignments?.dispatcher?.name || 'Amit Shah' }}</div>
        <div class="text-slate-500 text-[11px] font-mono">Midwest Dispatch Hub</div>
      </div>

      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Assigned Driver</div>
        <div class="font-bold text-blue-700 mt-0.5">{{ assignments?.driver?.name || driverName || 'Marcus Vance' }}</div>
        <div class="text-slate-500 text-[11px] font-mono">{{ driverPhone || '+1 (800) 555-0199' }}</div>
      </div>

      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Contracted Carrier (3PL)</div>
        <div class="font-bold text-slate-800 mt-0.5">{{ assignments?.carrier?.name || carrierName || 'Titan Freightways Corp' }}</div>
        <div class="text-emerald-600 text-[11px] font-semibold">Tier 1 • Score: 4.9 ★</div>
      </div>

      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Assigned Tractor</div>
        <div class="font-bold font-mono text-slate-800 mt-0.5">{{ vehiclePlate || 'TRK-101 (2024 Volvo)' }}</div>
        <div class="text-slate-500 text-[11px]">Dry Van 53ft</div>
      </div>

      <div class="p-2.5 rounded border border-slate-100 bg-slate-50/70">
        <div class="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Account Customer</div>
        <div class="font-bold text-slate-800 mt-0.5">{{ customerName || 'TechCorp Industries' }}</div>
        <div class="text-slate-500 text-[11px]">Primary Shipper</div>
      </div>
    </div>

    <!-- Reassignment Dialog -->
    <q-dialog v-model="dialogOpen">
      <q-card style="width: 440px; max-width: 95vw;" class="p-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div class="text-base font-bold text-slate-900">Reassign Shipment Personnel</div>
          <q-btn flat round dense icon="close" v-close-popup size="sm" />
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Assignment Type</label>
            <q-select
              v-model="selectedType"
              :options="['DRIVER', 'VEHICLE', 'CARRIER']"
              outlined
              dense
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Select New Assignee</label>
            <q-input v-model="targetAssignee" outlined dense placeholder="Enter driver or tractor ID..." />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Reassignment Reason (Audited)</label>
            <q-input v-model="reason" outlined dense placeholder="e.g. Previous driver hours of service reached" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <q-btn flat dense no-caps label="Cancel" v-close-popup color="grey-7" />
          <q-btn color="primary" dense no-caps icon="check" label="Save Assignment" @click="saveAssignment" />
        </div>
      </q-card>
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
