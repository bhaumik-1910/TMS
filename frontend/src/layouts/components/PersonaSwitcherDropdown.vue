<template>
  <q-btn-dropdown
    dense
    flat
    no-caps
    class="q-px-sm bg-dark text-white rounded-borders"
    style="border: 1px solid rgba(255, 255, 255, 0.12);"
  >
    <template #label>
      <div class="row items-center no-wrap text-caption text-weight-bold">
        <span>ROLE: <span class="text-cyan">{{ authStore.currentRole }}</span></span>
      </div>
    </template>

    <q-list dense class="bg-dark text-grey-2" style="min-width: 220px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <q-item-label header class="text-weight-bold text-caption text-uppercase text-grey-5">
        Switch Role Persona (13 Roles)
      </q-item-label>
      <q-item
        v-for="role in allRoles"
        :key="role"
        clickable
        v-close-popup
        :active="authStore.currentRole === role"
        active-class="bg-cyan-10 text-cyan-3 text-weight-bold"
        @click="handleRoleSwitch(role)"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon :name="getRoleIcon(role)" size="16px" color="cyan" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption">{{ role }}</q-item-label>
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
