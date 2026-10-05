<template>
  <q-page class="q-pa-lg bg-slate-50 text-slate-800">
    <AppPageHeader
      title="System Audit & Security Logs"
      subtitle="Immutable enterprise audit trail recording operational transactions and administrative actions"
    >
      <template #actions>
        <q-btn
          outline
          color="slate-700"
          no-caps
          icon="refresh"
          label="Refresh"
          class="bg-white"
          @click="loadLogs"
          :loading="loading"
        />
      </template>
    </AppPageHeader>

    <q-card flat bordered class="tms-card bg-white border border-slate-200 shadow-sm rounded-lg">
      <div class="row items-center justify-between q-pa-md border-bottom border-slate-200">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Filter audit events by action, module, or user..."
          class="desk-search-input"
          style="width: 360px;"
        >
          <template #prepend><q-icon name="search" size="18px" color="primary" /></template>
          <template #append v-if="searchQuery">
            <q-icon
              name="cancel"
              size="18px"
              class="cursor-pointer text-slate-400 hover:text-slate-600"
              @click.stop.prevent="searchQuery = ''"
            />
          </template>
        </q-input>
        <div class="text-caption text-slate-500 font-mono">
          Total Events: {{ filteredLogs.length }}
        </div>
      </div>

      <q-table
        :rows="filteredLogs"
        :columns="columns"
        row-key="id"
        flat
        dense
        class="tms-table"
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template #body-cell-action="props">
          <q-td :props="props">
            <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              {{ props.value }}
            </span>
          </q-td>
        </template>

        <template #body-cell-module="props">
          <q-td :props="props">
            <span class="font-medium text-slate-700">{{ props.value }}</span>
          </q-td>
        </template>

        <template #body-cell-user="props">
          <q-td :props="props">
            <span class="text-weight-medium text-slate-900" v-if="props.row.user">
              {{ props.row.user.firstName }} {{ props.row.user.lastName }}
            </span>
            <span class="text-slate-400 italic text-caption" v-else>System Daemon</span>
          </q-td>
        </template>

        <template #body-cell-timestamp="props">
          <q-td :props="props" align="right">
            <span class="font-mono text-slate-600 text-caption">{{ new Date(props.row.createdAt).toLocaleString() }}</span>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import AppPageHeader from '../../components/AppPageHeader.vue';

const loading = ref(false);
const logs = ref<any[]>([]);
const searchQuery = ref('');

const columns = [
  { name: 'action', label: 'Security Action', field: 'action', align: 'left' as const },
  { name: 'module', label: 'Domain Module', field: 'module', align: 'left' as const },
  { name: 'entityType', label: 'Target Entity', field: 'entityType', align: 'left' as const },
  { name: 'user', label: 'Operator / User', field: 'user', align: 'left' as const },
  { name: 'timestamp', label: 'Timestamp', field: 'createdAt', align: 'right' as const },
];

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value;
  const q = searchQuery.value.toLowerCase();
  return logs.value.filter((l) => {
    return (
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.module && l.module.toLowerCase().includes(q)) ||
      (l.entityType && l.entityType.toLowerCase().includes(q)) ||
      (l.user && `${l.user.firstName} ${l.user.lastName}`.toLowerCase().includes(q))
    );
  });
});

async function loadLogs() {
  loading.value = true;
  try {
    const res: any = await api.get('/api/v1/audit-logs');
    logs.value = res.data || res || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadLogs();
});
</script>
