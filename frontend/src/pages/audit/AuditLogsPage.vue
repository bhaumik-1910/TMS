<template>
  <q-page>
    <AppPageHeader
      title="System Audit & Security Logs"
      subtitle="Immutable enterprise audit trail recording operational transactions and administrative actions"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" @click="loadLogs" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-table
      :rows="logs"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="tms-table"
      :loading="loading"
      :pagination="{ rowsPerPage: 15 }"
    >
      <template #body-cell-action="props">
        <q-td :props="props">
          <span class="tms-code-badge font-mono text-weight-bold">{{ props.value }}</span>
        </q-td>
      </template>

      <template #body-cell-user="props">
        <q-td :props="props">
          <span class="text-weight-medium" v-if="props.row.user">
            {{ props.row.user.firstName }} {{ props.row.user.lastName }}
          </span>
          <span class="text-grey-5" v-else>System Daemon</span>
        </q-td>
      </template>

      <template #body-cell-timestamp="props">
        <q-td :props="props" align="right">
          <span class="font-mono text-grey-8">{{ new Date(props.row.createdAt).toLocaleString() }}</span>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import AppPageHeader from '../../components/AppPageHeader.vue';

const loading = ref(false);
const logs = ref<any[]>([]);

const columns = [
  { name: 'action', label: 'Security Action', field: 'action', align: 'left' as const },
  { name: 'module', label: 'Domain Module', field: 'module', align: 'left' as const },
  { name: 'entityType', label: 'Target Entity', field: 'entityType', align: 'left' as const },
  { name: 'user', label: 'Operator / User', field: 'user', align: 'left' as const },
  { name: 'timestamp', label: 'Timestamp (UTC)', field: 'createdAt', align: 'right' as const },
];

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
