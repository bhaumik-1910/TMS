<template>
  <q-page>
    <AppPageHeader
      title="Routes & Transportation Network"
      subtitle="Standardized linehaul corridors, transit durations, distance calculations, and stop sequences"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" @click="loadRoutes" :loading="loading" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md">
      <div v-for="route in routes" :key="route.id" class="col-12 col-md-6">
        <div class="tms-card q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <span class="tms-code-badge font-mono text-weight-bold">{{ route.routeNumber }}</span>
            <AppStatusBadge :status="route.status || 'ACTIVE'" />
          </div>

          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-xs">
            {{ route.originLocation?.name }} → {{ route.destLocation?.name }}
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            {{ Math.round(route.estimatedDuration / 60) }} hours estimated linehaul • {{ route.totalDistance }} km
          </div>

          <div class="text-caption text-weight-bold text-grey-7 q-mb-xs text-uppercase">
            Stop Sequence
          </div>
          <q-list separator class="bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
            <q-item v-for="stop in route.routeStops" :key="stop.id" dense>
              <q-item-section avatar style="min-width: 28px;">
                <span class="font-mono text-weight-bold text-caption">#{{ stop.sequenceNo }}</span>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ stop.location?.name }}</q-item-label>
                <q-item-label caption>{{ stop.location?.city }}, {{ stop.location?.state }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="font-mono text-caption text-grey-7">{{ stop.distanceFromPrev }} km</span>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';

const loading = ref(false);
const routes = ref<any[]>([]);

async function loadRoutes() {
  loading.value = true;
  try {
    const res: any = await api.get('/api/v1/routes');
    routes.value = res.data || res || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRoutes();
});
</script>
