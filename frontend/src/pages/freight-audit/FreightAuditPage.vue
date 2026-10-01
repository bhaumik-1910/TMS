<template>
  <q-page>
    <AppPageHeader
      title="Freight Audit & Claims Management"
      subtitle="Automated carrier invoice matching, discrepancy detection, and cargo loss/damage claims"
    />

    <!-- Tabs for Freight Audit vs Claims -->
    <q-tabs v-model="tab" dense class="text-grey-7 q-mb-md" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="audit" icon="fact_check" label="Freight Audit Engine" />
      <q-tab name="claims" icon="report_problem" label="Claims Roster" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <!-- Freight Audit Panel -->
      <q-tab-panel name="audit" class="q-pa-none">
        <div class="row q-col-gutter-md">
          <!-- Audit Runner Tool -->
          <div class="col-12 col-md-5">
            <div class="tms-card q-pa-md">
              <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-xs">
                Audit Carrier Freight Invoice
              </div>
              <div class="text-caption text-grey-6 q-mb-md">
                Match carrier bill against contract distance rate and flag discrepancies
              </div>

              <q-form @submit.prevent="runFreightAudit" class="q-gutter-y-sm">
                <div>
                  <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Shipment Linehaul</div>
                  <q-select
                    v-model="auditForm.shipmentId"
                    :options="shipments"
                    option-label="label"
                    option-value="id"
                    emit-value
                    map-options
                    dense
                    outlined
                  />
                </div>

                <div>
                  <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Billed Linehaul Distance (km)</div>
                  <DeskNumberInput v-model="auditForm.distanceKm" placeholder="e.g. 1485" :step="50" :min="0" />
                </div>

                <div>
                  <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Carrier Invoice Total ($)</div>
                  <DeskNumberInput v-model="auditForm.billedAmount" placeholder="e.g. 3450.00" :step="50" :min="0" />
                </div>

                <q-btn
                  color="primary"
                  class="full-width q-mt-md text-weight-bold"
                  no-caps
                  label="Execute Freight Audit Verification"
                  type="submit"
                  :loading="auditing"
                />
              </q-form>
            </div>
          </div>

          <!-- Audit Result Inspection Card -->
          <div class="col-12 col-md-7">
            <div class="tms-card q-pa-md full-height" v-if="auditResult">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-bold text-slate-900">
                  Audit Verification Report
                </div>
                <AppStatusBadge :status="auditResult.auditStatus" />
              </div>

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                  <div class="q-pa-sm bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                    <div class="text-caption text-grey-6">Contract Expected Cost</div>
                    <div class="text-h6 text-weight-bold font-mono text-slate-900">
                      ${{ auditResult.expectedCost }}
                    </div>
                    <div class="text-caption text-grey-6">Base rate: ${{ auditResult.contractBaseRate }}/km</div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="q-pa-sm bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                    <div class="text-caption text-grey-6">Carrier Billed Invoice</div>
                    <div class="text-h6 text-weight-bold font-mono text-slate-900">
                      ${{ auditResult.billedAmount }}
                    </div>
                    <div class="text-caption" :class="auditResult.variance > 0 ? 'text-negative' : 'text-positive'">
                      Variance: {{ auditResult.variance > 0 ? '+' : '' }}${{ auditResult.variance }} ({{ auditResult.variancePercent }}%)
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-caption text-weight-bold text-slate-800 text-uppercase q-mb-xs">
                Audit Policy Issues Detected:
              </div>
              <q-list separator class="bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                <q-item v-for="(issue, i) in auditResult.issues" :key="i" dense>
                  <q-item-section avatar style="min-width: 28px;">
                    <q-icon name="warning" color="warning" size="18px" />
                  </q-item-section>
                  <q-item-section class="text-caption text-slate-800">
                    {{ issue }}
                  </q-item-section>
                </q-item>
                <q-item v-if="!auditResult.issues?.length" dense>
                  <q-item-section class="text-caption text-positive text-weight-bold">
                    No discrepancies detected. Invoice passes 100% automated contract matching.
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row justify-end q-gutter-sm q-mt-md">
                <q-btn outline color="negative" no-caps label="Dispute Carrier Invoice" v-if="auditResult.variance > 50" />
                <q-btn color="positive" no-caps label="Approve for Payment" />
              </div>
            </div>

            <div class="tms-card q-pa-xl text-center full-height flex flex-center" v-else>
              <div class="text-grey-6">
                <q-icon name="fact_check" size="48px" class="q-mb-sm text-grey-4" />
                <div>Submit a carrier invoice on the left to run variance matching.</div>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- Claims Panel -->
      <q-tab-panel name="claims" class="q-pa-none">
        <div class="tms-card q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-slate-900">Cargo Damage & Loss Claims</div>
              <div class="text-caption text-grey-6">Shipper and carrier cargo insurance claims</div>
            </div>
            <q-btn color="primary" icon="add" label="File Claim Ticket" no-caps @click="claimDialog = true" />
          </div>

          <q-table :rows="claims" :columns="claimColumns" row-key="id" flat bordered dense class="tms-table">
            <template #body-cell-claimNumber="props">
              <q-td :props="props">
                <span class="tms-code-badge font-mono text-weight-bold">{{ props.value }}</span>
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <AppStatusBadge :status="props.value" />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- File Claim Dialog -->
    <q-dialog v-model="claimDialog">
      <q-card style="width: 480px; max-width: 90vw;" class="tms-card">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid var(--surface-border);">
          <div class="text-subtitle1 text-weight-bold text-slate-900">File Cargo Claim</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-select
            v-model="claimForm.shipmentId"
            :options="shipments"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            label="Target Shipment"
          />
          <q-select
            v-model="claimForm.type"
            :options="['DAMAGE', 'SHORTAGE', 'LOSS', 'DELAY']"
            dense
            outlined
            label="Claim Nature"
          />
          <DeskNumberInput v-model="claimForm.amount" placeholder="Claim Amount ($), e.g. 500" :step="100" :min="0" />
          <q-input v-model="claimForm.description" type="textarea" rows="2" dense outlined label="Incident Summary" />

          <q-btn color="primary" class="full-width text-weight-bold" no-caps label="Submit Freight Claim" @click="submitClaim" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';
import { DeskNumberInput } from '../../framework';

const notify = useAppNotify();
const tab = ref('audit');
const auditing = ref(false);

const shipments = ref<any[]>([]);
const carriers = ref<any[]>([]);
const claims = ref<any[]>([]);
const claimDialog = ref(false);

const auditForm = ref({
  shipmentId: '',
  carrierId: '',
  distanceKm: 1485,
  billedAmount: 3450.0,
});

const auditResult = ref<any | null>(null);

const claimForm = ref({
  shipmentId: '',
  type: 'DAMAGE',
  amount: 850,
  description: 'Forklift puncture on outer carton pallets at destination depot.',
});

const claimColumns = [
  { name: 'claimNumber', label: 'Claim #', field: 'claimNumber', align: 'left' as const },
  { name: 'type', label: 'Nature', field: 'type', align: 'left' as const },
  { name: 'amount', label: 'Claimed Value', field: (r: any) => `$${r.amount}`, align: 'right' as const },
  { name: 'description', label: 'Summary', field: 'description', align: 'left' as const },
  { name: 'status', label: 'Review Status', field: 'status', align: 'center' as const },
];

async function loadData() {
  try {
    const [sRes, cRes, clRes]: any[] = await Promise.all([
      api.get('/api/v1/shipments'),
      api.get('/api/v1/carriers'),
      api.get('/api/v1/billing/claims'),
    ]);

    shipments.value = (sRes.data || sRes || []).map((s: any) => ({
      id: s.id,
      carrierId: s.carrierId,
      label: `${s.shipmentNumber} • ${s.customer?.companyName || 'Cargo'} (${s.totalWeight}kg)`,
    }));

    carriers.value = cRes.data || cRes || [];
    claims.value = clRes.data || clRes || [];

    if (shipments.value[0]) {
      auditForm.value.shipmentId = shipments.value[0].id;
      auditForm.value.carrierId = carriers.value[0]?.id || '';
      claimForm.value.shipmentId = shipments.value[0].id;
    }
  } catch (err) {
    console.error(err);
  }
}

async function runFreightAudit() {
  auditing.value = true;
  try {
    const res: any = await api.post('/api/v1/billing/freight-audit/compare', auditForm.value);
    auditResult.value = res.data || res;
    notify.success('Freight audit analysis complete');
  } catch (err) {
    console.error(err);
  } finally {
    auditing.value = false;
  }
}

async function submitClaim() {
  try {
    await api.post('/api/v1/billing/claims', claimForm.value);
    notify.success('Freight claim ticket filed');
    claimDialog.value = false;
    const clRes: any = await api.get('/api/v1/billing/claims');
    claims.value = clRes.data || clRes || [];
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  loadData();
});
</script>
