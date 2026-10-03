<template>
  <q-btn-dropdown
    v-if="authStore.isSuperAdmin"
    dense
    flat
    no-caps
    class="q-px-sm bg-dark text-cyan rounded-borders"
    style="border: 1px solid rgba(0, 242, 254, 0.3);"
  >
    <template #label>
      <div class="row items-center no-wrap q-gutter-x-xs text-caption text-weight-bold">
        <q-icon :name="authStore.orgContext === 'SYSTEM' ? 'public' : 'domain'" size="14px" />
        <span>CONTEXT: {{ authStore.orgContext === 'SYSTEM' ? 'SYSTEM (All Orgs)' : activeOrgName }}</span>
      </div>
    </template>

    <q-list dense class="bg-dark text-grey-2" style="min-width: 250px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <q-item-label header class="text-weight-bold text-caption text-uppercase text-grey-5">
        Organization Scope (Super Admin)
      </q-item-label>
      <q-item
        clickable
        v-close-popup
        :active="authStore.orgContext === 'SYSTEM'"
        active-class="bg-cyan-10 text-cyan-3 text-weight-bold"
        @click="authStore.setOrganizationContext('SYSTEM')"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon name="public" size="16px" color="cyan" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption">SYSTEM (All Organizations)</q-item-label>
          <q-item-label caption class="text-grey-5" style="font-size: 0.68rem;">Global multi-tenant aggregated view</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator dark />

      <q-item
        v-for="org in availableOrgsList"
        :key="org.id"
        clickable
        v-close-popup
        :active="authStore.orgContext === org.id"
        active-class="bg-cyan-10 text-cyan-3 text-weight-bold"
        @click="authStore.setOrganizationContext(org.id)"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon name="business" size="16px" color="cyan" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption">{{ org.name }}</q-item-label>
          <q-item-label caption class="text-grey-5" style="font-size: 0.68rem;">Code: {{ org.code }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const availableOrgsList = computed(() => {
  if (authStore.availableOrganizations && authStore.availableOrganizations.length > 0) {
    return authStore.availableOrganizations.map((o: any) => ({
      id: o.id,
      name: o.name,
      code: o.code || o.name,
    }));
  }
  return [
    { id: 'd09a96f3-5962-49fb-b002-e80766937054', name: 'Apex Global Logistics Inc.', code: 'APEX-LOGISTICS' },
  ];
});

const activeOrgName = computed(() => {
  const match = availableOrgsList.value.find((o) => o.id === authStore.orgContext);
  return match ? match.name.split(' ')[0] : 'Apex';
});
</script>
