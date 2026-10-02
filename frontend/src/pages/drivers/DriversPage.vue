<template>
  <q-page>
    <AppPageHeader
      breadcrumb="Fleet & Personnel / CDL Operators"
      title="Driver Personnel & CDL Licenses"
      subtitle="Fleet operators, Commercial Driver License (CDL) verification, and active vehicle assignments"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" size="sm" @click="loadDrivers" :loading="loading" class="q-mr-xs">
          <q-tooltip>Refresh Drivers</q-tooltip>
        </q-btn>
        <PermissionGate permission="driver:create">
          <q-btn color="primary" icon="add" label="Add Driver" size="sm" no-caps @click="createDialog = true" />
        </PermissionGate>
      </template>
    </AppPageHeader>

    <q-table :rows="drivers" :columns="columns" row-key="id" flat bordered class="tms-table" :loading="loading">
      <template #body-cell-code="props">
        <q-td :props="props">
          <span class="tms-code-badge font-mono text-weight-bold">{{ props.value }}</span>
        </q-td>
      </template>

      <template #body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-bold text-slate-900">{{ props.row.firstName }} {{ props.row.lastName }}</div>
          <div class="text-caption text-grey-6">{{ props.row.email || 'N/A' }}</div>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <AppStatusBadge :status="props.value" />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" align="right">
          <q-btn flat dense round size="sm" icon="assignment_ind" color="primary" to="/tracking">
            <q-tooltip>Live Driver Telemetry</q-tooltip>
          </q-btn>
          <q-btn flat dense round size="sm" icon="description" color="teal-7" to="/pod">
            <q-tooltip>Driver ePOD & Delivery Proofs</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Create Driver Dialog -->
    <q-dialog v-model="createDialog" position="right" full-height>
      <div style="width: 480px; max-width: 95vw; height: 100vh; background: #091024; border-left: 1px solid rgba(0, 242, 254, 0.28); border-radius: 16px 0 0 16px;" class="column text-white">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #070c18;">
          <div class="text-subtitle1 text-weight-bold text-white">Add Fleet Driver</div>
          <q-btn icon="close" flat round dense v-close-popup text-color="grey-5" />
        </div>

        <div class="col scroll q-pa-md">
          <q-form @submit.prevent="submitDriver" class="q-gutter-y-md">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="newDriver.firstName" dense outlined label="First Name *" :rules="[val => !!val || 'Required']" />
              </div>
              <div class="col-6">
                <q-input v-model="newDriver.lastName" dense outlined label="Last Name *" :rules="[val => !!val || 'Required']" />
              </div>
            </div>
            <q-input v-model="newDriver.phone" dense outlined label="Phone Number *" :rules="[val => !!val || 'Required']" />
            <q-input v-model="newDriver.licenseNumber" dense outlined label="CDL License Number *" :rules="[val => !!val || 'Required']" />
            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat no-caps label="Cancel" v-close-popup />
              <q-btn color="primary" no-caps label="Save Driver" type="submit" />
            </div>
          </q-form>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';
import PermissionGate from '../../components/PermissionGate.vue';

const notify = useAppNotify();
const loading = ref(false);
const drivers = ref<any[]>([]);
const createDialog = ref(false);

const newDriver = ref({
  firstName: '',
  lastName: '',
  phone: '',
  licenseNumber: '',
});

const columns = [
  { name: 'code', label: 'Badge #', field: 'employeeCode', align: 'left' as const },
  { name: 'name', label: 'Driver Name', field: 'firstName', align: 'left' as const },
  { name: 'phone', label: 'Contact Phone', field: 'phone', align: 'left' as const },
  { name: 'license', label: 'CDL License', field: 'licenseNumber', align: 'left' as const },
  { name: 'status', label: 'Duty Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' as const },
];

async function loadDrivers() {
  loading.value = true;
  try {
    const res: any = await api.get('/api/v1/drivers');
    drivers.value = res.data || res || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function submitDriver() {
  try {
    await api.post('/api/v1/drivers', newDriver.value);
    notify.success('Driver registered successfully');
    createDialog.value = false;
    await loadDrivers();
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  loadDrivers();
});
</script>
