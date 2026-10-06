<template>
  <q-btn-dropdown
    v-if="authStore.isSuperAdmin"
    dense
    flat
    no-caps
    class="q-px-sm bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-borders"
    style="border: 1px solid #cbd5e1;"
  >
    <template #label>
      <div class="row items-center no-wrap q-gutter-x-xs text-caption text-weight-bold">
        <q-icon :name="authStore.orgContext === 'SYSTEM' ? 'public' : 'domain'" size="14px" class="text-sky-700" />
        <span>CONTEXT: <span class="text-sky-700">{{ authStore.orgContext === 'SYSTEM' ? 'SYSTEM (All Orgs)' : activeOrgName }}</span></span>
      </div>
    </template>

    <q-list dense class="bg-white text-slate-800 shadow-md" style="min-width: 260px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
      <div class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200 select-none">
        Organization Scope (Super Admin)
      </div>
      <q-item
        clickable
        v-close-popup
        :active="authStore.orgContext === 'SYSTEM'"
        active-class="org-item--active"
        class="org-menu-item"
        @click="authStore.setOrganizationContext('SYSTEM')"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon name="public" size="16px" :color="authStore.orgContext === 'SYSTEM' ? 'primary' : 'grey-7'" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption font-semibold text-slate-900">SYSTEM (All Organizations)</q-item-label>
          <q-item-label caption class="text-slate-500" style="font-size: 0.68rem;">Global multi-tenant aggregated view</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item
        v-for="org in availableOrgsList"
        :key="org.id"
        clickable
        v-close-popup
        :active="authStore.orgContext === org.id"
        active-class="org-item--active"
        class="org-menu-item"
        @click="authStore.setOrganizationContext(org.id)"
      >
        <q-item-section avatar style="min-width: 28px;">
          <q-icon name="business" size="16px" :color="authStore.orgContext === org.id ? 'primary' : 'grey-7'" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-caption font-semibold text-slate-900">{{ org.name }}</q-item-label>
          <q-item-label caption class="text-slate-500" style="font-size: 0.68rem;">Code: {{ org.code }}</q-item-label>
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

<style scoped>
.org-menu-item {
  transition: all 0.12s ease;
  min-height: 40px;
}

.org-menu-item:hover {
  background: #f1f5f9;
}

.org-item--active {
  background: #e0f2fe !important;
  color: #0369a1 !important;
}

.org-item--active :deep(.text-caption),
.org-item--active :deep(.q-item__label) {
  color: #0369a1 !important;
  font-weight: 700 !important;
}

.org-item--active :deep(.text-slate-500) {
  color: #0284c7 !important;
}
</style>
