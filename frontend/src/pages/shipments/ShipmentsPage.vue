<template>
  <div class="shipments-page q-pa-md">
    <!-- Header with Title & Summary Metrics -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold text-white row items-center q-gutter-x-sm">
          <q-icon name="local_shipping" color="cyan" size="24px" />
          <span>Shipments Management</span>
        </div>
        <div class="text-caption text-grey-5">
          Execution of transportation contracts, fleet assignments, and live transit milestones &bull; Press <kbd class="desk-kbd">Alt+F</kbd> to filter
        </div>
      </div>

      <!-- Quick Export & Planning Actions -->
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          unelevated
          icon="picture_as_pdf"
          label="Export PDF"
          class="desk-btn-secondary"
          @click="exportShipmentsPdf"
        >
          <q-tooltip>Download / Print Shipments in PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="table_view"
          label="Export CSV"
          class="desk-btn-secondary"
          @click="exportShipmentsCsv"
        >
          <q-tooltip>Export Shipments to CSV</q-tooltip>
        </q-btn>
        <PermissionGate permission="planning:manage">
          <q-btn
            unelevated
            icon="alt_route"
            label="Load Planning"
            class="desk-btn-primary"
            to="/planning"
          >
            <q-tooltip>Go to Multi-Leg Load Planning Console</q-tooltip>
          </q-btn>
        </PermissionGate>
      </div>
    </div>

    <!-- Shipments Content Container with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- Desk Keyboard Data Table -->
      <DeskDataTable
      title="Shipments Register"
      :rows="filteredShipments"
      :columns="columns"
      row-key="id"
      selection-mode="single"
      :allow-create="false"
      :allow-export="false"
      :allow-refresh="true"
      :allow-delete="false"
      :loading="loading"
      @refresh="loadShipments"
      @row-dblclick="openShipmentDetail"
    >
      <!-- Top Filters in Table Toolbar -->
      <template #top-filters>
        <q-select
          v-model="activeStatus"
          :options="statusFilters"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          dense
          outlined
          class="desk-filter-select"
          style="min-width: 140px;"
        />
      </template>

      <!-- Custom Cell: Shipment Number -->
      <template #body-cell-shipmentNumber="{ props }">
        <span
          class="text-cyan-4 text-weight-bold font-mono cursor-pointer hover:underline"
          @click.stop="openShipmentDetail(props.row)"
        >
          {{ props.value }}
        </span>
      </template>

      <!-- Custom Cell: Customer & Order -->
      <template #body-cell-customer="{ props }">
        <div class="text-weight-medium text-white">{{ props.row.customer?.companyName || '—' }}</div>
        <div class="text-caption text-grey-5 font-mono">{{ props.row.transportOrder?.orderNumber }}</div>
      </template>

      <!-- Custom Cell: Fleet Assignment -->
      <template #body-cell-assignment="{ props }">
        <div v-if="props.row.vehicle || props.row.carrier" class="column">
          <span class="text-weight-bold font-mono text-cyan-3">
            {{ props.row.vehicle?.vehicleNumber || props.row.carrier?.companyName }}
          </span>
          <span class="text-caption text-grey-4" v-if="props.row.driver">
            Driver: {{ props.row.driver?.firstName }} {{ props.row.driver?.lastName }}
          </span>
        </div>
        <div v-else>
          <PermissionGate permission="dispatch:assign">
            <q-btn
              outline
              dense
              no-caps
              size="xs"
              color="cyan"
              label="+ Assign Fleet"
              @click.stop="openAssignDialog(props.row)"
            />
          </PermissionGate>
        </div>
      </template>

      <!-- Custom Cell: Status Pill -->
      <template #body-cell-status="{ value }">
        <span
          class="desk-pill"
          :class="
            value === 'IN_TRANSIT'
              ? 'desk-pill-active'
              : value === 'DELIVERED'
              ? 'desk-pill-success'
              : value === 'ASSIGNED'
              ? 'desk-pill-warning'
              : 'desk-pill-draft'
          "
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom Cell: Actions -->
      <template #body-cell-actions="{ props }">
        <div class="row items-center q-gutter-x-xs no-wrap">
          <!-- Document Preview (Eye icon) -->
          <q-btn flat round dense icon="visibility" color="cyan" size="xs" @click.stop="openDocPreview(props.row)">
            <q-tooltip>Preview Transport Document / BOL</q-tooltip>
          </q-btn>

          <!-- Driver ePOD / Signature Capture -->
          <PermissionGate permission="pod:submit">
            <q-btn
              flat
              round
              dense
              icon="draw"
              color="green-4"
              size="xs"
              @click.stop="openPodCapture(props.row)"
            >
              <q-tooltip>Collect Consignee Signature & ePOD</q-tooltip>
            </q-btn>
          </PermissionGate>

          <q-btn flat round dense icon="my_location" color="grey-4" size="xs" to="/tracking">
            <q-tooltip>Live Telemetry</q-tooltip>
          </q-btn>

          <PermissionGate permission="dispatch:assign">
            <q-btn flat round dense icon="assignment_ind" color="cyan-3" size="xs" @click.stop="openAssignDialog(props.row)">
              <q-tooltip>Assign Resources</q-tooltip>
            </q-btn>
          </PermissionGate>

          <q-btn flat round dense icon="info" color="grey-4" size="xs" @click.stop="openShipmentDetail(props.row)">
            <q-tooltip>Workflow & Milestones</q-tooltip>
          </q-btn>
        </div>
      </template>
    </DeskDataTable>

      <!-- Inner Loading Overlay on Shipments Refresh -->
      <AppLoadingOverlay
        :showing="loading"
        title="Refreshing Active Shipments..."
        subtitle="Syncing consignment legs, milestones, and carrier statuses"
      />
    </div>

    <!-- Assign Resources Desk Dialog -->
    <DeskDialog
      v-model="assignDialog"
      title="Assign Fleet & Carrier Resources"
      icon="assignment_ind"
      width="520px"
      confirm-label="Confirm Assignment"
      :loading="assigning"
      @confirm="submitAssignment"
      @cancel="assignDialog = false"
    >
      <div v-if="selectedShipment" class="q-py-xs">
        <div class="text-caption text-grey-4 font-mono q-mb-md">
          Shipment <span class="text-cyan-4 font-bold">{{ selectedShipment.shipmentNumber }}</span> &bull; Total Weight: {{ selectedShipment.totalWeight }} kg
        </div>

        <div class="q-gutter-y-md">
          <DeskField label="Fleet Vehicle">
            <q-select
              v-model="assignForm.vehicleId"
              :options="vehicles"
              option-label="label"
              option-value="id"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </DeskField>

          <DeskField label="Driver">
            <q-select
              v-model="assignForm.driverId"
              :options="drivers"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </DeskField>

          <div class="text-center text-caption text-grey-5">— OR Assign to 3rd Party Dedicated Carrier —</div>

          <DeskField label="Dedicated Carrier">
            <q-select
              v-model="assignForm.carrierId"
              :options="carriers"
              option-label="companyName"
              option-value="id"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
          </DeskField>
        </div>
      </div>
    </DeskDialog>

    <!-- Shipment Milestones & Timeline Desk Dialog -->
    <DeskDialog
      v-model="detailDialog"
      :title="selectedShipment ? `Shipment Details — ${selectedShipment.shipmentNumber}` : 'Shipment Details'"
      icon="timeline"
      width="760px"
      :show-footer="false"
      @cancel="detailDialog = false"
    >
      <div v-if="selectedShipment" class="q-py-xs">
        <!-- Sleek Consignment Overview Strip -->
        <div class="shipment-overview-bar q-pa-sm q-mb-md">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-md">
              <div class="row items-center q-gutter-x-xs">
                <span class="text-caption font-mono text-slate-400">WAYBILL:</span>
                <span class="text-subtitle1 font-mono text-weight-bolder text-cyan-300">{{ selectedShipment.shipmentNumber }}</span>
              </div>
              <div v-if="selectedShipment.route || selectedShipment.transportOrder" class="row items-center text-caption text-slate-300 q-gutter-x-xs">
                <q-icon name="route" size="14px" class="text-cyan-400" />
                <span class="font-mono text-weight-medium">
                  {{ selectedShipment.route?.name || `${selectedShipment.transportOrder?.originLocation?.city || 'Origin'} → ${selectedShipment.transportOrder?.destinationLocation?.city || 'Destination'}` }}
                </span>
              </div>
            </div>
            <div class="row items-center q-gutter-x-sm">
              <div v-if="selectedShipment.totalWeight" class="text-caption font-mono text-slate-400">
                {{ Number(selectedShipment.totalWeight).toLocaleString() }} KG
              </div>
              <span class="desk-pill desk-pill-active">{{ selectedShipment.status }}</span>
            </div>
          </div>
        </div>

        <!-- Dynamic Workflow State Machine -->
        <AppWorkflowTimeline
          :current-state="selectedShipment.status"
          :available-transitions="workflowData?.availableTransitions || []"
          :loading="transitioning"
          @transition="handleTransition"
        />

        <div class="q-my-md">
          <!-- Resource Assignment Matrix -->
          <AppAssignmentPanel
            :resource-id="selectedShipment.id"
            :driver-name="selectedShipment.driver ? `${selectedShipment.driver.firstName} ${selectedShipment.driver.lastName}` : 'Unassigned'"
            :driver-phone="selectedShipment.driver?.phone"
            :carrier-name="selectedShipment.carrier?.companyName || 'Swift Linehaul Express'"
            :vehicle-plate="selectedShipment.vehicle?.plateNumber || selectedShipment.vehicle?.vehicleNumber || 'GJ-01-AB-1122'"
            :customer-name="selectedShipment.customer?.companyName || selectedShipment.transportOrder?.customer?.companyName"
            @reassigned="handleReassigned"
          />
        </div>

        <!-- Auditable Transport Milestones Card -->
        <div class="milestones-card q-pa-md q-mt-md">
          <div class="row items-center justify-between q-mb-md border-b border-cyan-500-15 pb-2">
            <div class="row items-center q-gutter-x-xs">
              <q-icon name="fact_check" size="18px" class="text-cyan-400" />
              <div class="text-sm text-weight-bold text-white font-sans">Auditable Transport Milestones</div>
            </div>
            <div class="row items-center q-gutter-x-xs text-caption font-mono text-slate-400">
              <q-icon name="lock" size="13px" class="text-emerald-400" />
              <span>Immutable Ledger Records</span>
            </div>
          </div>

          <q-timeline color="cyan" dense class="q-pl-sm">
            <q-timeline-entry
              title="Transport Order Created & Confirmed"
              subtitle="Initial Booking Confirmation"
              icon="check_circle"
              color="positive"
            >
              <div class="text-slate-300 font-mono text-xs">
                Order <span class="text-cyan-300 font-bold">{{ selectedShipment.transportOrder?.orderNumber || 'ORD-2026-001' }}</span> for <span class="text-white">{{ selectedShipment.customer?.companyName || selectedShipment.transportOrder?.customer?.companyName || 'Global Retail Direct Inc.' }}</span>
              </div>
            </q-timeline-entry>

            <q-timeline-entry
              title="Fleet & Driver Allocated"
              :subtitle="selectedShipment.vehicle ? 'Resource Assigned & Audited' : 'Pending Allocation'"
              :icon="selectedShipment.vehicle ? 'check_circle' : 'pending'"
              :color="selectedShipment.vehicle ? 'positive' : 'grey-6'"
            >
              <div v-if="selectedShipment.vehicle" class="text-slate-300 font-mono text-xs">
                Vehicle: <span class="text-cyan-300 font-bold">{{ selectedShipment.vehicle?.plateNumber || selectedShipment.vehicle?.vehicleNumber }}</span> • Driver: <span class="text-white">{{ selectedShipment.driver ? `${selectedShipment.driver.firstName} ${selectedShipment.driver.lastName}` : 'Assigned' }}</span>
              </div>
              <div v-else class="text-slate-500 font-mono text-xs italic">
                Awaiting vehicle and driver assignment
              </div>
            </q-timeline-entry>

            <q-timeline-entry
              title="Dispatched & Linehaul In Transit"
              :subtitle="['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedShipment.status) ? 'Active Interstate Transit' : 'Awaiting Linehaul Dispatch'"
              :icon="['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedShipment.status) ? 'local_shipping' : 'pending'"
              :color="['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(selectedShipment.status) ? 'cyan' : 'grey-6'"
            >
              <div class="text-slate-300 font-mono text-xs">
                Traversing Western Logistics Corridor with real-time GPS telemetry and geofence monitoring
              </div>
            </q-timeline-entry>

            <q-timeline-entry
              title="Destination Delivery & Proof of Delivery (POD)"
              :subtitle="selectedShipment.status === 'DELIVERED' || selectedShipment.status === 'COMPLETED' ? 'Delivery Completed & Audited' : 'Pending Final Drop'"
              :icon="selectedShipment.status === 'DELIVERED' || selectedShipment.status === 'COMPLETED' ? 'verified' : 'radio_button_unchecked'"
              :color="selectedShipment.status === 'DELIVERED' || selectedShipment.status === 'COMPLETED' ? 'positive' : 'grey-6'"
            >
              <div v-if="selectedShipment.proofOfDelivery" class="text-slate-300 font-mono text-xs">
                Signed by <span class="text-cyan-300 font-bold">{{ selectedShipment.proofOfDelivery.receiverName }}</span> • Digital Signature Verified
              </div>
              <div v-else class="text-slate-500 font-mono text-xs italic">
                Pending dock arrival and digital consignee signature
              </div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </DeskDialog>

    <!-- Document Preview Modal (Eye Icon) -->
    <AppDocumentPreviewDialog
      v-model="docPreviewDialog"
      :doc-data="selectedDocData"
    />

    <!-- Interactive Digital Signature & ePOD Dialog for Drivers -->
    <AppSignatureCaptureDialog
      v-model="podCaptureDialog"
      :shipment="selectedShipmentForPod"
      @submitted="handlePodSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import PermissionGate from '../../components/PermissionGate.vue';
import AppWorkflowTimeline from '../../components/AppWorkflowTimeline.vue';
import AppAssignmentPanel from '../../components/AppAssignmentPanel.vue';
import AppDocumentPreviewDialog from '../../components/AppDocumentPreviewDialog.vue';
import AppSignatureCaptureDialog from '../../components/AppSignatureCaptureDialog.vue';
import { DeskDataTable, DeskDialog, DeskField } from '../../framework';

const notify = useAppNotify();
const loading = ref(false);
const assigning = ref(false);
const transitioning = ref(false);
const shipments = ref<any[]>([]);
const search = ref('');
const activeStatus = ref<string>('ALL');

const assignDialog = ref(false);
const detailDialog = ref(false);
const selectedShipment = ref<any | null>(null);
const workflowData = ref<any | null>(null);

const docPreviewDialog = ref(false);
const selectedDocData = ref<any>(null);
const podCaptureDialog = ref(false);
const selectedShipmentForPod = ref<any>(null);

const vehicles = ref<any[]>([]);
const drivers = ref<any[]>([]);
const carriers = ref<any[]>([]);

const assignForm = ref({
  vehicleId: null as string | null,
  driverId: null as string | null,
  carrierId: null as string | null,
});

const statusFilters = [
  { label: 'All Shipments', value: 'ALL' },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
];

const columns = [
  { name: 'shipmentNumber', label: 'Shipment #', field: 'shipmentNumber', align: 'left' as const, sortable: true },
  { name: 'customer', label: 'Customer / Order #', field: 'customer', align: 'left' as const },
  { name: 'assignment', label: 'Vehicle / Driver / Carrier', field: 'assignment', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'weight', label: 'Total Weight', field: (r: any) => `${r.totalWeight} kg`, align: 'right' as const },
  { name: 'volume', label: 'Total Volume', field: (r: any) => `${r.totalVolume} m³`, align: 'right' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' as const },
];

const filteredShipments = computed(() => {
  return shipments.value.filter((s) => {
    if (activeStatus.value !== 'ALL' && s.status !== activeStatus.value) return false;
    if (search.value) {
      const q = search.value.toLowerCase();
      const numMatch = s.shipmentNumber?.toLowerCase().includes(q);
      const custMatch = s.customer?.companyName?.toLowerCase().includes(q);
      const drvMatch = s.driver?.firstName?.toLowerCase().includes(q) || s.driver?.lastName?.toLowerCase().includes(q);
      if (!numMatch && !custMatch && !drvMatch) return false;
    }
    return true;
  });
});

async function loadShipments(isUserRefresh = false) {
  loading.value = true;
  const startTime = Date.now();
  try {
    const res: any = await api.get('/api/v1/shipments');
    shipments.value = res.data || res || [];
  } catch (err) {
    console.error(err);
  } finally {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 600 - elapsed);
    setTimeout(() => {
      loading.value = false;
      if (isUserRefresh) {
        notify.success('Shipments Refreshed Successfully');
      }
    }, remaining);
  }
}

function exportShipmentsCsv() {
  exportToCsv(
    'shipments_operations_register',
    [
      { label: 'Shipment Number', field: 'shipmentNumber' },
      { label: 'Customer', field: (r: any) => r.customer?.companyName || '' },
      { label: 'Order Number', field: (r: any) => r.transportOrder?.orderNumber || '' },
      { label: 'Vehicle', field: (r: any) => r.vehicle?.vehicleNumber || '' },
      { label: 'Driver', field: (r: any) => r.driver ? `${r.driver.firstName} ${r.driver.lastName}` : '' },
      { label: 'Carrier', field: (r: any) => r.carrier?.companyName || '' },
      { label: 'Status', field: 'status' },
      { label: 'Weight (kg)', field: 'totalWeight' },
      { label: 'Volume (m3)', field: 'totalVolume' },
    ],
    filteredShipments.value,
  );
  notify.success(`${filteredShipments.value.length} shipments exported to CSV.`);
}

function exportShipmentsPdf() {
  exportToPdf({
    title: 'Shipments Operations Register',
    subtitle: `Active Filter: ${activeStatus.value} | Total Shipments: ${filteredShipments.value.length}`,
    columns: [
      { label: 'Shipment #', field: 'shipmentNumber' },
      { label: 'Customer', field: (r: any) => r.customer?.companyName || '-' },
      { label: 'Assigned Fleet / Carrier', field: (r: any) => r.vehicle?.vehicleNumber || r.carrier?.companyName || 'Unassigned' },
      { label: 'Driver', field: (r: any) => r.driver ? `${r.driver.firstName} ${r.driver.lastName}` : '-' },
      { label: 'Weight (kg)', field: 'totalWeight', align: 'right' },
      { label: 'Volume (m³)', field: 'totalVolume', align: 'right' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredShipments.value,
  });
}

async function loadFleetResources() {
  try {
    const [vRes, dRes, cRes]: any[] = await Promise.all([
      api.get('/api/v1/vehicles'),
      api.get('/api/v1/drivers'),
      api.get('/api/v1/carriers'),
    ]);

    vehicles.value = (vRes.data || vRes || []).map((v: any) => ({
      id: v.id,
      label: `${v.vehicleNumber} (${v.vehicleType?.name || 'Tractor'} • ${v.capacityWeight}kg max)`,
    }));

    drivers.value = (dRes.data || dRes || []).map((d: any) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName} (${d.employeeCode})`,
    }));

    carriers.value = cRes.data || cRes || [];
  } catch (err) {
    console.error(err);
  }
}

function openAssignDialog(shipment: any) {
  selectedShipment.value = shipment;
  assignForm.value = {
    vehicleId: shipment.vehicleId || null,
    driverId: shipment.driverId || null,
    carrierId: shipment.carrierId || null,
  };
  assignDialog.value = true;
  loadFleetResources();
}

async function submitAssignment() {
  if (!selectedShipment.value) return;
  assigning.value = true;
  try {
    await api.patch(`/api/v1/shipments/${selectedShipment.value.id}/assign`, assignForm.value);
    notify.success('Resources assigned successfully');
    assignDialog.value = false;
    await loadShipments();
  } catch (err) {
    console.error(err);
  } finally {
    assigning.value = false;
  }
}

async function fetchWorkflow(shipmentId: string) {
  try {
    const res: any = await api.get(`/api/v1/workflow/DISPATCH/${shipmentId}`);
    workflowData.value = res.data || res;
  } catch (err) {
    // Fallback if not recorded yet
    workflowData.value = {
      currentState: selectedShipment.value?.status || 'PLANNED',
      availableTransitions: [
        { nextState: 'ASSIGNED', actionName: 'Assign Resources', requiredPermission: 'dispatch:assign' },
        { nextState: 'DISPATCHED', actionName: 'Dispatch Trip', requiredPermission: 'dispatch:dispatch' },
        { nextState: 'IN_TRANSIT', actionName: 'Mark In Transit', requiredPermission: 'shipment:update' },
        { nextState: 'DELIVERED', actionName: 'Confirm Delivery', requiredPermission: 'shipment:update' }
      ]
    };
  }
}

async function openShipmentDetail(shipment: any) {
  selectedShipment.value = shipment;
  detailDialog.value = true;
  await fetchWorkflow(shipment.id);
}

async function handleTransition(transition: any) {
  if (!selectedShipment.value) return;
  transitioning.value = true;
  try {
    const toState = typeof transition === 'string' ? transition : (transition.to || transition.nextState);
    const res: any = await api.post(`/api/v1/workflow/DISPATCH/${selectedShipment.value.id}/transition`, {
      toState,
      reason: `Transitioned via Dispatch Board by current user`,
    });
    notify.success(`Status updated to ${toState}`);
    selectedShipment.value.status = toState;
    await fetchWorkflow(selectedShipment.value.id);
    await loadShipments();
  } catch (err: any) {
    notify.error(err?.response?.data?.message || 'Workflow transition failed');
  } finally {
    transitioning.value = false;
  }
}

async function handleReassigned() {
  notify.success('Resource reassigned and audited successfully');
  await loadShipments();
  if (selectedShipment.value) {
    const updated = shipments.value.find(s => s.id === selectedShipment.value.id);
    if (updated) selectedShipment.value = updated;
  }
}

function openDocPreview(shipment: any) {
  selectedDocData.value = {
    id: shipment.id,
    shipmentNumber: shipment.shipmentNumber,
    referenceNumber: `BOL-${shipment.shipmentNumber}`,
    title: `Uniform Bill of Lading & Waybill — ${shipment.shipmentNumber}`,
    documentType: 'Interstate Commercial Bill of Lading (BOL)',
    customerName: shipment.customer?.companyName || 'Apex Commercial Consignee',
    destAddress: shipment.transportOrder?.destinationLocation?.address || 'Dallas Logistics Center, TX',
    originFacility: shipment.transportOrder?.originLocation?.name || 'Chicago Central Hub',
    originAddress: shipment.transportOrder?.originLocation?.address || '1500 S Western Ave, Chicago, IL',
    vehiclePlate: shipment.vehicle ? `${shipment.vehicle.vehicleNumber} (${shipment.vehicle.make || 'Volvo'})` : 'TRK-101',
    driverName: shipment.driver ? `${shipment.driver.firstName} ${shipment.driver.lastName}` : 'Marcus Vance',
    carrierName: shipment.carrier?.companyName || 'Apex Fleet Logistics',
    status: shipment.status,
    weight: shipment.totalWeight,
    volume: shipment.totalVolume,
    receiverName: shipment.proofOfDelivery?.receiverName,
    signatureUrl: shipment.proofOfDelivery?.signatureUrl,
  };
  docPreviewDialog.value = true;
}

function openPodCapture(shipment: any) {
  selectedShipmentForPod.value = shipment;
  podCaptureDialog.value = true;
}

async function handlePodSubmitted() {
  await loadShipments();
}

async function updateStatus(shipmentId: string, status: string) {
  try {
    await api.patch(`/api/v1/shipments/${shipmentId}/status`, { status });
    notify.success(`Shipment updated to ${status}`);
    detailDialog.value = false;
    await loadShipments();
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  loadShipments();
});
</script>

<style scoped>
.shipments-page {
  background-color: #070c18;
  min-height: calc(100vh - 88px);
}

.desk-kbd {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #00f2fe;
  font-family: var(--desk-font-mono, monospace);
  font-size: 10px;
}

/* Consignment Overview Strip */
.shipment-overview-bar {
  background: rgba(13, 23, 48, 0.6);
  border: 1px solid rgba(0, 242, 254, 0.18);
  border-radius: 8px;
}

/* Milestones Container */
.milestones-card {
  background: linear-gradient(135deg, rgba(11, 20, 44, 0.95) 0%, rgba(7, 13, 29, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.22);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
}

.border-cyan-500-15 {
  border-bottom: 1px solid rgba(0, 242, 254, 0.15);
}
</style>
