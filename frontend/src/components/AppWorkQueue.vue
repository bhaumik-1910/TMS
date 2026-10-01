<template>
  <div class="cyber-work-queue bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg text-white">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
      <div>
        <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></span>
          {{ title || 'Operational Work Queue' }}
        </div>
        <div class="text-xs text-slate-400 mt-0.5">{{ subtitle || 'Prioritized tasks, pending approvals, and SLA-critical milestones' }}</div>
      </div>
      <div class="flex items-center gap-2">
        <q-btn flat dense round icon="refresh" color="cyan" size="sm" @click="loadQueue" :loading="loading">
          <q-tooltip>Refresh Queue</q-tooltip>
        </q-btn>
        <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
          {{ filteredItems.length }} ITEMS ACTIVE
        </span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        class="px-3 py-1.5 rounded font-mono text-xs transition-all shrink-0 border"
        :class="activeTab === tab.id ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(0,242,254,0.25)]' : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          class="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold"
          :class="activeTab === tab.id ? 'bg-cyan-900/80 text-cyan-200' : 'bg-slate-800 text-slate-400'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Queue Table -->
    <div v-if="filteredItems.length > 0" class="overflow-x-auto">
      <table class="w-full text-left text-xs font-mono">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-950/60">
            <th class="py-2.5 px-3">Reference #</th>
            <th class="py-2.5 px-3">Resource & Particulars</th>
            <th class="py-2.5 px-3">Corridor</th>
            <th class="py-2.5 px-3">Priority</th>
            <th class="py-2.5 px-3">State</th>
            <th class="py-2.5 px-3">SLA Status</th>
            <th class="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-slate-850/60 transition-colors">
            <td class="py-3 px-3 font-mono font-bold text-cyan-400">
              {{ item.referenceNumber }}
            </td>
            <td class="py-3 px-3">
              <div class="font-semibold text-white font-sans">{{ item.title }}</div>
              <div class="text-[11px] text-slate-400 font-mono">Assigned: {{ item.assignedRole }}</div>
            </td>
            <td class="py-3 px-3 text-slate-300 font-sans">
              <span v-if="item.origin && item.destination">
                {{ item.origin }} → {{ item.destination }}
              </span>
              <span v-else class="text-slate-500">—</span>
            </td>
            <td class="py-3 px-3">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold border"
                :class="item.priority === 'URGENT' || item.priority === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-blue-950 text-blue-300 border-blue-800'"
              >
                {{ item.priority }}
              </span>
            </td>
            <td class="py-3 px-3">
              <AppStatusBadge :status="item.workflowState" />
            </td>
            <td class="py-3 px-3">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                :class="item.slaStatus === 'BREACHED' ? 'bg-rose-950 text-rose-300 border-rose-800' : item.slaStatus === 'DUE_SOON' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'"
              >
                {{ item.slaStatus === 'DUE_SOON' ? 'Due Soon' : item.slaStatus === 'BREACHED' ? 'SLA Breached' : 'On Track' }}
              </span>
            </td>
            <td class="py-3 px-3 text-right">
              <q-btn
                color="cyan-8"
                text-color="white"
                dense
                no-caps
                size="sm"
                class="text-weight-bold font-mono px-2"
                :to="item.nextActionRoute"
              >
                {{ item.nextActionLabel }}
              </q-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
      <q-icon name="task_alt" size="32px" color="positive" class="q-mb-xs" />
      <div class="text-sm font-bold text-white">Your Work Queue is Clear</div>
      <div class="text-xs text-slate-400 mt-1">No pending operational milestones require your action right now.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppStatusBadge from './AppStatusBadge.vue';
import api from '../api/client';

const props = defineProps<{
  title?: string;
  subtitle?: string;
  endpoint?: string;
}>();

const loading = ref(false);
const activeTab = ref('all');
const queueItems = ref<any[]>([]);

const filterTabs = computed(() => [
  { id: 'all', label: 'All Tasks', count: queueItems.value.length },
  { id: 'high_priority', label: 'High Priority', count: queueItems.value.filter(i => i.priority === 'HIGH' || i.priority === 'URGENT').length },
  { id: 'due_soon', label: 'Due Soon / At Risk', count: queueItems.value.filter(i => i.slaStatus === 'DUE_SOON' || i.slaStatus === 'BREACHED').length },
]);

const filteredItems = computed(() => {
  if (activeTab.value === 'high_priority') {
    return queueItems.value.filter(i => i.priority === 'HIGH' || i.priority === 'URGENT');
  }
  if (activeTab.value === 'due_soon') {
    return queueItems.value.filter(i => i.slaStatus === 'DUE_SOON' || i.slaStatus === 'BREACHED');
  }
  return queueItems.value;
});

async function loadQueue() {
  loading.value = true;
  try {
    const url = props.endpoint || '/api/v1/work-queues/my';
    const res: any = await api.get(url);
    const list = res.data || res;
    if (Array.isArray(list)) {
      queueItems.value = list;
    }
  } catch (err) {
    // Fallback operational data
    queueItems.value = [
      {
        id: '1',
        resourceType: 'SHIPMENT',
        resourceId: 's-1',
        referenceNumber: 'SHP-2024-001',
        title: 'TechCorp Industries (14,500 kg)',
        origin: 'Chicago, IL',
        destination: 'Dallas, TX',
        priority: 'HIGH',
        workflowState: 'PLANNED',
        assignedRole: 'DISPATCHER',
        dueAt: new Date().toISOString(),
        slaStatus: 'DUE_SOON',
        nextActionLabel: 'Assign Driver & Vehicle',
        nextActionRoute: '/dispatch',
      },
      {
        id: '2',
        resourceType: 'ORDER',
        resourceId: 'o-2',
        referenceNumber: 'ORD-7102',
        title: 'Apex Steel Corp (22,000 kg)',
        origin: 'Gary, IN',
        destination: 'St. Louis, MO',
        priority: 'NORMAL',
        workflowState: 'SUBMITTED',
        assignedRole: 'TRANSPORT_PLANNER',
        dueAt: new Date().toISOString(),
        slaStatus: 'ON_TRACK',
        nextActionLabel: 'Plan Load & Route',
        nextActionRoute: '/planning',
      },
      {
        id: '3',
        resourceType: 'INVOICE',
        resourceId: 'i-3',
        referenceNumber: 'INV-2024-004',
        title: 'Titan Freightways Corp ($4,850)',
        priority: 'HIGH',
        workflowState: 'PENDING',
        assignedRole: 'FINANCE_MANAGER',
        dueAt: new Date().toISOString(),
        slaStatus: 'ON_TRACK',
        nextActionLabel: 'Audit & Approve Invoice',
        nextActionRoute: '/billing',
      },
    ];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadQueue();
});
</script>
