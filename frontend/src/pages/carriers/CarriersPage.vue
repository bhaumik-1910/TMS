<template>
  <q-page>
    <AppPageHeader
      title="Carriers & Contract Rate Cards"
      subtitle="Dedicated 3rd-party logistics providers, performance scoring, and lane pricing"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" @click="loadCarriers" :loading="loading" />
        <q-btn color="primary" icon="add" label="Add Carrier" no-caps @click="createDialog = true" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md">
      <div v-for="carrier in carriers" :key="carrier.id" class="col-12 col-md-6">
        <div class="tms-card q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div>
              <div class="text-subtitle1 text-weight-bold text-slate-900">{{ carrier.companyName }}</div>
              <div class="text-caption text-grey-6 font-mono">{{ carrier.carrierCode }} • {{ carrier.email }}</div>
            </div>
            <div class="row items-center q-gutter-x-xs">
              <q-icon name="star" color="amber-8" size="18px" />
              <span class="text-weight-bold font-mono">{{ carrier.rating }}</span>
            </div>
          </div>

          <div class="text-caption text-weight-bold text-grey-7 q-mb-xs text-uppercase">
            Active Lane Contract Rates
          </div>

          <q-list separator class="bg-grey-1 rounded-borders q-mb-sm" style="border: 1px solid #e2e8f0;">
            <q-item v-for="(rate, rIdx) in carrier.carrierRates" :key="rIdx" dense>
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ rate.originLocation?.city }} → {{ rate.destLocation?.city }}
                </q-item-label>
                <q-item-label caption>{{ rate.rateType }} Rate Contract</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span class="font-mono text-weight-bold text-primary">${{ rate.baseRate }} / km</span>
              </q-item-section>
            </q-item>
            <div v-if="!carrier.carrierRates?.length" class="q-pa-xs text-center text-caption text-grey-6">
              No contracted rates configured
            </div>
          </q-list>

          <div class="row justify-between items-center q-mt-sm">
            <span class="text-caption text-grey-6">{{ carrier.phone || '+1 (800) 555-1234' }}</span>
            <q-btn flat dense no-caps size="sm" color="primary" label="+ Add Lane Rate" @click="openRateDialog(carrier)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Carrier Dialog -->
    <q-dialog v-model="createDialog" position="right" full-height>
      <div style="width: 480px; max-width: 95vw; height: 100vh; background: #ffffff; border-left: 1px solid #cbd5e1; border-radius: 12px 0 0 12px;" class="column text-slate-900">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid #cbd5e1; background: #f8fafc;">
          <div class="text-subtitle1 text-weight-bold text-slate-900">Add 3PL Carrier Partner</div>
          <q-btn icon="close" flat round dense v-close-popup text-color="grey-7" />
        </div>

        <div class="col scroll q-pa-md">
          <q-form @submit.prevent="submitCarrier" class="q-gutter-y-md">
            <q-input v-model="newCarrier.companyName" dense outlined label="Company Name *" :rules="[val => !!val || 'Required']" />
            <q-input v-model="newCarrier.carrierCode" dense outlined label="Carrier Code (e.g. CARR-90)" />
            <q-input v-model="newCarrier.email" dense outlined label="Dispatch Email *" type="email" />
            <q-input v-model="newCarrier.phone" dense outlined label="Phone Number" />
            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat no-caps label="Cancel" v-close-popup />
              <q-btn color="primary" no-caps label="Save Carrier" type="submit" />
            </div>
          </q-form>
        </div>
      </div>
    </q-dialog>

    <!-- Add Rate Dialog -->
    <q-dialog v-model="rateDialog" position="right" full-height>
      <div style="width: 450px; max-width: 95vw; height: 100vh; background: #ffffff; border-left: 1px solid #cbd5e1; border-radius: 12px 0 0 12px;" class="column text-slate-900" v-if="selectedCarrier">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid #cbd5e1; background: #f8fafc;">
          <div class="text-subtitle1 text-weight-bold text-slate-900">Add Lane Contract Rate</div>
          <q-btn icon="close" flat round dense v-close-popup text-color="grey-7" />
        </div>

        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-select
            v-model="rateForm.originLocationId"
            :options="locations"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            label="Origin Location"
          />
          <q-select
            v-model="rateForm.destinationLocationId"
            :options="locations"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            label="Destination Location"
          />
          <DeskNumberInput v-model="rateForm.baseRate" placeholder="e.g. 12.50" :step="0.05" :min="0" />
          <q-btn color="primary" class="full-width text-weight-bold q-mt-md" no-caps label="Save Contract Rate" @click="submitRate" />
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
import { DeskNumberInput } from '../../framework';

const notify = useAppNotify();
const loading = ref(false);
const carriers = ref<any[]>([]);
const locations = ref<any[]>([]);

const createDialog = ref(false);
const rateDialog = ref(false);
const selectedCarrier = ref<any | null>(null);

const newCarrier = ref({
  companyName: '',
  carrierCode: '',
  email: '',
  phone: '',
});

const rateForm = ref({
  originLocationId: '',
  destinationLocationId: '',
  baseRate: 2.25,
});

async function loadCarriers() {
  loading.value = true;
  try {
    const res: any = await api.get('/api/v1/carriers');
    carriers.value = res.data || res || [];

    const lRes: any = await api.get('/api/v1/master-data/locations');
    locations.value = lRes.data || lRes || [];
    if (locations.value[0]) rateForm.value.originLocationId = locations.value[0].id;
    if (locations.value[1]) rateForm.value.destinationLocationId = locations.value[1].id;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function submitCarrier() {
  try {
    await api.post('/api/v1/carriers', newCarrier.value);
    notify.success('Carrier registered');
    createDialog.value = false;
    await loadCarriers();
  } catch (err) {
    console.error(err);
  }
}

function openRateDialog(c: any) {
  selectedCarrier.value = c;
  rateDialog.value = true;
}

async function submitRate() {
  if (!selectedCarrier.value) return;
  try {
    await api.post(`/api/v1/carriers/${selectedCarrier.value.id}/rates`, rateForm.value);
    notify.success('Lane rate card saved');
    rateDialog.value = false;
    await loadCarriers();
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  loadCarriers();
});
</script>
