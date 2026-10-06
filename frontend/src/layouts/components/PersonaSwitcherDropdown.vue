<template>
  <q-btn-dropdown
    dense
    flat
    no-caps
    class="q-px-sm bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-borders"
    style="border: 1px solid #cbd5e1;"
  >
    <template #label>
      <div class="row items-center no-wrap text-caption text-weight-bold">
        <span>ROLE: <span class="text-sky-700 font-mono">{{ authStore.currentRole }}</span></span>
      </div>
    </template>

    <q-list dense class="bg-white text-slate-800 shadow-md" style="min-width: 230px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
      <div class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200 select-none">
        Switch Role Persona (13 Roles)
      </div>
      <q-item
        v-for="role in allRoles"
        :key="role"
        clickable
        v-close-popup
        :active="authStore.currentRole === role"
        active-class="role-item--active"
        class="role-menu-item"
        @click="handleRoleSwitch(role)"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon :name="getRoleIcon(role)" size="16px" :color="authStore.currentRole === role ? 'primary' : 'grey-7'" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption font-semibold text-slate-900">{{ role }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const allRoles = [
  'SUPER_ADMIN',
  'TMS_ADMIN',
  'OPERATIONS_MANAGER',
  'TRANSPORT_PLANNER',
  'DISPATCHER',
  'FLEET_MANAGER',
  'DRIVER',
  'CARRIER',
  'CUSTOMER',
  'FINANCE_MANAGER',
  'COMPLIANCE_MANAGER',
  'SUPPORT_AGENT',
  'ANALYST',
];

function getRoleIcon(role: string) {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'shield',
    TMS_ADMIN: 'admin_panel_settings',
    OPERATIONS_MANAGER: 'dashboard',
    TRANSPORT_PLANNER: 'route',
    DISPATCHER: 'alt_route',
    FLEET_MANAGER: 'local_shipping',
    DRIVER: 'directions_bus',
    CARRIER: 'business',
    CUSTOMER: 'person',
    FINANCE_MANAGER: 'payments',
    COMPLIANCE_MANAGER: 'verified',
    SUPPORT_AGENT: 'support_agent',
    ANALYST: 'insights',
  };
  return map[role] || 'badge';
}

async function handleRoleSwitch(role: string) {
  await authStore.switchRole(role);
  $q.notify({
    type: 'info',
    icon: 'manage_accounts',
    message: `Switched Persona to: ${role}`,
    caption: 'Navigation menu & permissions updated',
    position: 'top-right',
    timeout: 2000,
  });

  if (router.currentRoute.value.path !== '/dashboard') {
    await router.push('/dashboard');
  }
}
</script>

<style scoped>
.role-menu-item {
  transition: all 0.12s ease;
  min-height: 36px;
}

.role-menu-item:hover {
  background: #f1f5f9;
}

.role-item--active {
  background: #e0f2fe !important;
  color: #0369a1 !important;
}

.role-item--active :deep(.text-caption),
.role-item--active :deep(.q-item__label) {
  color: #0369a1 !important;
  font-weight: 700 !important;
}
</style>
