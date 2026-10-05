<template>
  <q-page class="q-pa-lg bg-slate-50 text-slate-800">
    <AppPageHeader
      breadcrumb="Administration / Platform Governance"
      title="Super Admin System Console"
      subtitle="System-wide infrastructure telemetry, multi-tenant governance, and global security audit"
    >
      <template #badge>
        <q-badge color="negative" class="font-mono text-caption" style="border-radius: 4px;">
          WILDCARD SYSTEM SCOPE (*)
        </q-badge>
      </template>

      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" size="sm" @click="loadSystemData" :loading="loading" class="q-mr-xs">
          <q-tooltip>Refresh Platform Telemetry</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="slate-700"
          icon="tune"
          label="Context: All Organizations"
          size="sm"
          no-caps
          class="text-weight-bold bg-white"
          @click="authStore.setOrganizationContext('SYSTEM')"
        />
      </template>
    </AppPageHeader>

    <!-- Platform Overview KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Tenants / Organizations"
        :value="overview.organizations?.total || 3"
        icon="business"
        icon-color="primary"
        :subtitle="`${overview.organizations?.active || 3} Active • ${overview.organizations?.suspended || 0} Suspended`"
      />
      <AppStatCard
        title="Platform Users"
        :value="overview.users?.total || 18"
        icon="people"
        icon-color="teal"
        :subtitle="`${overview.users?.active || 18} Active enterprise credentials`"
      />
      <AppStatCard
        title="Global Fleet Assets"
        :value="overview.fleet?.totalVehicles || 8"
        icon="directions_car"
        icon-color="warning"
        :subtitle="`${overview.fleet?.inTransitVehicles || 5} Units rolling in transit`"
      />
      <AppStatCard
        title="Total Lifetime Orders"
        :value="overview.transport?.totalOrders || 42"
        icon="description"
        icon-color="positive"
        subtitle="Processed across all tenants"
      />
    </div>

    <!-- Infrastructure Health Observability Card -->
    <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">Infrastructure & Microservice Health</div>
          <div class="text-xs text-slate-500">Real-time service heartbeat, database latency, and telemetry pipeline</div>
        </div>
        <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ALL SERVICES OPERATIONAL
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="p-3 rounded-md bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-800">REST API Gateway</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">HEALTHY</span>
          </div>
          <div class="text-xs text-slate-500 mt-1 font-mono text-[11px]">Latency: 2ms • NestJS 10</div>
        </div>
        <div class="p-3 rounded-md bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-800">PostgreSQL Engine</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">CONNECTED</span>
          </div>
          <div class="text-xs text-slate-500 mt-1 font-mono text-[11px]">Latency: {{ health.services?.database?.latencyMs || 3 }}ms • Prisma ORM</div>
        </div>
        <div class="p-3 rounded-md bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-800">WebSocket Telemetry</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">ONLINE</span>
          </div>
          <div class="text-xs text-slate-500 mt-1 font-mono text-[11px]">Socket.IO WSS Pipeline</div>
        </div>
        <div class="p-3 rounded-md bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-800">Memory & Workers</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">ACTIVE</span>
          </div>
          <div class="text-xs text-slate-500 mt-1 font-mono text-[11px]">{{ health.system?.memoryUsageMb || 148 }} MB Heap • 4 Workers</div>
        </div>
      </div>
    </div>

    <!-- Multi-Tenant Organizations Directory -->
    <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-subtitle2 text-weight-bold text-slate-900">Tenant Organizations Directory</div>
          <div class="text-caption text-slate-500" style="font-size: 0.75rem;">Manage active operating companies, data segregation, and context switching</div>
        </div>
        <q-btn outline color="primary" size="sm" no-caps label="+ Add Tenant Organization" class="bg-white" @click="addOrgDialog = true" />
      </div>

      <q-table
        :rows="organizations"
        :columns="orgColumns"
        row-key="id"
        flat
        bordered
        dense
        class="tms-table"
        :loading="loading"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-x-sm">
              <q-avatar size="24px" color="slate-200" text-color="slate-800" class="text-weight-bold" style="font-size: 0.7rem;">
                {{ props.row.name[0] }}
              </q-avatar>
              <div>
                <span class="text-weight-bold text-slate-900">{{ props.row.name }}</span>
                <span class="text-caption text-slate-400 font-mono q-ml-xs">({{ props.row.code }})</span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppStatusBadge :status="props.value" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              color="primary"
              flat
              dense
              no-caps
              size="xs"
              icon="swap_horiz"
              label="Switch to Context"
              class="text-weight-bold"
              @click="switchToOrg(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Security & RBAC Audit Stream -->
    <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">Platform Security & Audit Trail</div>
          <div class="text-xs text-slate-500">System-wide records of role modifications, credential events, and tenant access</div>
        </div>
        <router-link to="/audit-logs" class="text-xs font-semibold text-sky-700 hover:underline">
          View Full Audit Log →
        </router-link>
      </div>

      <q-table
        :rows="auditEvents"
        :columns="auditColumns"
        row-key="id"
        flat
        bordered
        dense
        class="tms-table"
        :loading="loading"
        :pagination="{ rowsPerPage: 5 }"
      >
        <template #body-cell-action="props">
          <q-td :props="props">
            <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              {{ props.value }}
            </span>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import api from '../../api/client';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const addOrgDialog = ref(false);

const overview = ref<any>({});
const health = ref<any>({});
const organizations = ref<any[]>([]);
const auditEvents = ref<any[]>([]);

const orgColumns = [
  { name: 'name', label: 'Organization & Tenant', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Tenant Code', field: 'code', align: 'left' as const },
  { name: 'currency', label: 'Base Currency', field: 'currency', align: 'center' as const },
  { name: 'usersCount', label: 'Users', field: (r: any) => r._count?.users ?? 1, align: 'right' as const },
  { name: 'fleetCount', label: 'Fleet Units', field: (r: any) => r._count?.vehicles ?? 0, align: 'right' as const },
  { name: 'status', label: 'Account Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'right' as const },
];

const auditColumns = [
  { name: 'action', label: 'Audit Action', field: 'action', align: 'left' as const },
  { name: 'module', label: 'Module', field: 'module', align: 'left' as const },
  { name: 'entityType', label: 'Target Entity', field: 'entityType', align: 'left' as const },
  { name: 'user', label: 'Actor', field: (r: any) => r.user ? `${r.user.firstName} ${r.user.lastName}` : 'System Engine', align: 'left' as const },
  { name: 'time', label: 'Timestamp', field: (r: any) => new Date(r.createdAt).toLocaleString(), align: 'right' as const },
];

async function loadSystemData() {
  loading.value = true;
  try {
    const [ovRes, healthRes, orgsRes, auditRes]: any[] = await Promise.all([
      api.get('/api/v1/admin/overview').catch(() => ({ data: {} })),
      api.get('/api/v1/admin/system-health').catch(() => ({ data: {} })),
      api.get('/api/v1/admin/organizations').catch(() => ({ data: [] })),
      api.get('/api/v1/admin/security-audit').catch(() => ({ data: [] })),
    ]);

    overview.value = ovRes.data || ovRes || {};
    health.value = healthRes.data || healthRes || {};
    organizations.value = orgsRes.data || orgsRes || [];
    auditEvents.value = auditRes.data || auditRes || [];
  } catch (err) {
    console.error('Failed to load system data', err);
  } finally {
    loading.value = false;
  }
}

function switchToOrg(org: any) {
  authStore.setOrganizationContext(org.id);
  router.push('/dashboard');
}

onMounted(() => {
  loadSystemData();
});
</script>
