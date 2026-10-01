<template>
  <q-page class="flex flex-center bg-slate-900 q-pa-sm" style="min-height: 100vh; background-color: #0f172a;">
    <!-- Mobile Device Container -->
    <div
      class="bg-white rounded-borders overflow-hidden column justify-between shadow-24"
      style="width: 100%; max-width: 420px; min-height: 720px; border-radius: 24px; border: 4px solid #1e293b;"
    >
      <!-- Mobile App Header -->
      <div class="q-pa-md bg-slate-900 text-white row items-center justify-between" style="background-color: #0f172a;">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="32px" color="blue-7" text-color="white" icon="badge" />
          <div>
            <div class="text-subtitle2 text-weight-bold">Driver Console</div>
            <div class="text-caption text-grey-4 font-mono" style="font-size: 0.7rem;">UNIT: TRK-101 • Marcus Vance</div>
          </div>
        </div>
        <q-badge color="positive" rounded label="ONLINE" />
      </div>

      <!-- Main Scrollable Trip Content -->
      <div class="col q-pa-md bg-grey-1 overflow-auto" style="background-color: #f8fafc;">
        <!-- Today's Active Trip Card -->
        <div class="tms-card q-pa-md q-mb-md bg-white">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-weight-bold text-grey-6 text-uppercase" style="letter-spacing: 0.05em;">
              Today's Assigned Route
            </span>
            <AppStatusBadge :status="tripStatus" />
          </div>

          <div class="text-h6 text-weight-bold text-slate-900 q-mb-sm">
            Chicago Hub → Dallas Terminal
          </div>

          <!-- Route Milestones -->
          <div class="column q-gutter-y-sm q-mb-md">
            <div class="row items-start q-gutter-x-sm">
              <q-icon name="trip_origin" color="primary" size="18px" class="q-mt-xs" />
              <div>
                <div class="text-caption text-weight-bold">Pickup Facility</div>
                <div class="text-caption text-grey-7">Chicago Central Hub • 1500 S Western Ave</div>
              </div>
            </div>

            <div class="row items-start q-gutter-x-sm">
              <q-icon name="location_on" color="negative" size="18px" class="q-mt-xs" />
              <div>
                <div class="text-caption text-weight-bold">Destination Facility</div>
                <div class="text-caption text-grey-7">Dallas Logistics Center • 2200 E Interstate 30</div>
              </div>
            </div>
          </div>

          <!-- Trip Stats Metrics Grid -->
          <div class="row q-col-gutter-xs text-center q-mb-md">
            <div class="col-4">
              <div class="q-pa-xs bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                <div class="text-caption text-grey-6" style="font-size: 0.65rem;">Distance</div>
                <div class="text-weight-bold font-mono text-caption">1,485 km</div>
              </div>
            </div>
            <div class="col-4">
              <div class="q-pa-xs bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                <div class="text-caption text-grey-6" style="font-size: 0.65rem;">Total Weight</div>
                <div class="text-weight-bold font-mono text-caption">14,500 kg</div>
              </div>
            </div>
            <div class="col-4">
              <div class="q-pa-xs bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                <div class="text-caption text-grey-6" style="font-size: 0.65rem;">Remaining ETA</div>
                <div class="text-weight-bold font-mono text-caption text-primary">16h 20m</div>
              </div>
            </div>
          </div>

          <!-- Action Button: Start Trip or Arrive at Destination -->
          <div v-if="tripStatus === 'ASSIGNED'">
            <q-btn
              color="primary"
              class="full-width q-py-sm text-weight-bold"
              icon="play_arrow"
              label="Start Linehaul Trip"
              no-caps
              @click="tripStatus = 'IN_TRANSIT'"
            />
          </div>
          <div v-else-if="tripStatus === 'IN_TRANSIT'">
            <q-btn
              color="positive"
              class="full-width q-py-sm text-weight-bold"
              icon="check_circle"
              label="Confirm Arrival & Open POD"
              no-caps
              @click="podDialog = true"
            />
          </div>
          <div v-else>
            <div class="q-pa-sm bg-green-1 text-green-9 rounded-borders text-center text-caption text-weight-bold">
              Trip Completed & POD Transmitted
            </div>
          </div>
        </div>

        <!-- Driver Assist Quick Tools (Report Delay / Breakdown / Call Dispatcher) -->
        <div class="text-caption text-weight-bold text-grey-6 q-mb-xs text-uppercase">
          Quick In-Transit Actions
        </div>
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <q-btn
              outline
              dense
              no-caps
              class="full-width q-py-sm bg-white"
              color="warning"
              icon="warning"
              label="Report Traffic Delay"
              @click="reportDelay"
            />
          </div>
          <div class="col-6">
            <q-btn
              outline
              dense
              no-caps
              class="full-width q-py-sm bg-white"
              color="negative"
              icon="build"
              label="Report Breakdown"
              @click="reportBreakdown"
            />
          </div>
        </div>

        <!-- Cargo Manifest -->
        <div class="tms-card q-pa-sm bg-white">
          <div class="text-caption text-weight-bold text-slate-900 q-mb-xs">
            Shipment Manifest: SHP-770101
          </div>
          <div class="text-caption text-grey-7">
            Acme Retail Supply Corp • 18 Pallets Consumer Electronics • Fragile
          </div>
        </div>
      </div>

      <!-- Mobile Bottom Navigation Bar -->
      <div class="q-pa-sm bg-white row justify-around text-caption" style="border-top: 1px solid var(--surface-border);">
        <q-btn flat dense no-caps color="primary" icon="navigation" label="Active Trip" />
        <q-btn flat dense no-caps color="grey-7" icon="draw" label="POD Signature" @click="podDialog = true" />
        <q-btn flat dense no-caps color="grey-7" icon="phone" label="Call Dispatch" @click="contactDispatch" />
      </div>
    </div>

    <!-- Digital Proof of Delivery (POD) Dialog -->
    <q-dialog v-model="podDialog" persistent>
      <q-card style="width: 400px; max-width: 95vw;" class="tms-card">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid var(--surface-border);">
          <div class="text-subtitle1 text-weight-bold text-slate-900">Proof of Delivery (POD)</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-md q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Receiver Full Name *</div>
            <q-input v-model="podForm.receiverName" dense outlined placeholder="e.g. David Miller" />
          </div>

          <div>
            <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Delivery OTP Verification Code</div>
            <q-input v-model="podForm.otp" dense outlined placeholder="4-digit customer OTP" maxlength="4" />
          </div>

          <!-- Digital Signature Box -->
          <div>
            <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Receiver Digital Signature</div>
            <div
              class="q-pa-md bg-grey-1 rounded-borders text-center cursor-pointer"
              style="border: 2px dashed #cbd5e1; height: 110px;"
              @click="signatureCaptured = true"
            >
              <div v-if="!signatureCaptured" class="column flex-center full-height">
                <q-icon name="draw" size="24px" color="grey-6" />
                <span class="text-caption text-grey-6 q-mt-xs">Tap here to capture signature</span>
              </div>
              <div v-else class="column flex-center full-height text-positive">
                <q-icon name="check_circle" size="28px" />
                <span class="text-caption text-weight-bold q-mt-xs">Digital Signature Verified</span>
              </div>
            </div>
          </div>

          <div>
            <div class="text-caption text-weight-medium text-slate-800 q-mb-xs">Driver Remarks / Notes</div>
            <q-input v-model="podForm.remarks" dense outlined placeholder="All pallets received in good order." />
          </div>

          <q-btn
            color="positive"
            class="full-width q-py-sm text-weight-bold"
            no-caps
            label="Transmit Verified POD"
            :loading="submittingPod"
            @click="submitPOD"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import AppStatusBadge from '../../components/AppStatusBadge.vue';

const notify = useAppNotify();

const tripStatus = ref('IN_TRANSIT');
const podDialog = ref(false);
const signatureCaptured = ref(false);
const submittingPod = ref(false);

const podForm = ref({
  receiverName: 'David Miller',
  otp: '7841',
  remarks: 'All 18 cargo pallets unloaded and inspected at dock 4.',
});

function reportDelay() {
  notify.warning('Traffic congestion logged on I-55. Dispatcher notified and ETA refreshed.');
}

function reportBreakdown() {
  notify.error('Breakdown SOS alert broadcasted to Fleet Maintenance team.');
}

function contactDispatch() {
  notify.info('Connecting voice patch to Apex Dispatch Central...');
}

async function submitPOD() {
  if (!podForm.value.receiverName) {
    notify.warning('Receiver name is required');
    return;
  }
  submittingPod.value = true;
  try {
    // Send to backend POD service
    const shipmentsRes: any = await api.get('/api/v1/shipments');
    const firstShipment = shipmentsRes.data?.[0] || shipmentsRes?.[0];
    const shipmentId = firstShipment?.id;

    if (shipmentId) {
      await api.post('/api/v1/pod/submit', {
        shipmentId,
        receiverName: podForm.value.receiverName,
        receiverContact: '+1 (555) 909-8877',
        otp: podForm.value.otp,
        signatureUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCA4MCBDIDQwIDEwLCA2NSAxMCwgOTUgODAgUyAxNTAgMTUwLCAxODAgODAiIHN0cm9rZT0iYmxhY2siIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
        latitude: 32.7767,
        longitude: -96.7970,
        remarks: podForm.value.remarks,
      });
    }

    notify.success('Proof of delivery (POD) transmitted! Delivery confirmed and customer invoice generated.');
    podDialog.value = false;
    tripStatus.value = 'COMPLETED';
  } catch (err) {
    notify.error('Error submitting POD');
  } finally {
    submittingPod.value = false;
  }
}
</script>
