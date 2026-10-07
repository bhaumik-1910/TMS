<template>
  <div>
    <!-- Company Selector Dropdown / Button in Header -->
    <q-btn
      dense
      flat
      no-caps
      class="q-px-sm bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-borders font-sans"
      style="border: 1px solid #cbd5e1; height: 28px;"
      @click="openPicker"
      title="Switch Company (Alt+F3 / Alt+K)"
    >
      <div class="row items-center no-wrap q-gutter-x-xs text-caption text-weight-bold">
        <q-icon name="apartment" size="14px" class="text-sky-700" />
        <span class="text-slate-600">CO:</span>
        <span class="text-sky-700 font-mono tracking-tight">{{ activeCompanyName }}</span>
        <span class="picker-key-tag font-mono text-slate-500 q-ml-xs">Alt+F3</span>
      </div>
    </q-btn>

    <!-- Interactive Keyboard-First Company Picker Dialog -->
    <CompanyPickerDialog
      v-model="showPicker"
      :companies="companiesList"
      :current-company-id="currentCompanyId"
      :user-name="userName"
      :user-email="userEmail"
      :allow-close="true"
      @select="handleSwitch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import CompanyPickerDialog, { type CompanyItem } from '../../desk/components/CompanyPickerDialog.vue';

const authStore = useAuthStore();
const showPicker = ref(false);

const companiesList = computed<CompanyItem[]>(() => {
  if (authStore.availableOrganizations && authStore.availableOrganizations.length > 0) {
    return authStore.availableOrganizations.map((o: any) => ({
      companyId: o.companyId || Number(o.id) || 1,
      name: o.name,
      code: o.code || 'DEMO',
      role: o.role || 'Admin',
      licenseValidTo: o.licenseValidTo,
      licenseValid: o.licenseValid !== false,
      available: o.available !== false,
    }));
  }
  // Default fallback if not yet fetched
  return [
    { companyId: 1, name: 'Demo Roadways Pvt Ltd', code: 'DEMO', role: 'Admin', licenseValidTo: '2027-10-07', licenseValid: true },
    { companyId: 2, name: 'Second Logistics LLP', code: 'DEMO2', role: 'Admin', licenseValidTo: '2027-10-07', licenseValid: true },
    { companyId: 3, name: 'Swift Logistics Pvt Ltd', code: 'SWIFT', role: 'Admin', licenseValidTo: '2027-10-07', licenseValid: true },
  ];
});

const currentCompanyId = computed(() => {
  return Number(authStore.user?.organization?.id) || 1;
});

const activeCompanyName = computed(() => {
  return authStore.user?.organization?.name?.split(' ')[0] || 'Demo Roadways';
});

const userName = computed(() => {
  const u = authStore.user;
  if (!u) return 'Admin';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Admin';
});

const userEmail = computed(() => {
  return authStore.user?.email || 'admin@demo.test';
});

async function openPicker() {
  await authStore.fetchCompanies();
  showPicker.value = true;
}

async function handleSwitch(companyId: number) {
  try {
    await authStore.switchCompany(companyId);
    showPicker.value = false;
    window.location.reload();
  } catch (e) {
    console.error('Failed to switch company:', e);
  }
}

function handleCustomEvent() {
  openPicker();
}

onMounted(() => {
  window.addEventListener('desk:open-org-switcher', handleCustomEvent);
});

onUnmounted(() => {
  window.removeEventListener('desk:open-org-switcher', handleCustomEvent);
});
</script>

<style scoped>
.picker-key-tag {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  padding: 0 4px;
  border-radius: 3px;
  font-size: 10px;
}
</style>
