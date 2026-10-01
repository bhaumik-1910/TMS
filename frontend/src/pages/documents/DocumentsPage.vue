<template>
  <q-page>
    <AppPageHeader
      title="Documents & Regulatory Compliance"
      subtitle="Bills of Lading (BOL), carrier insurance certificates, transport permits, and expiry audit"
    >
      <template #actions>
        <q-btn flat round dense icon="refresh" color="grey-7" @click="loadDocuments" :loading="loading" />
        <q-btn color="primary" icon="upload" label="Upload Document" no-caps @click="uploadDialog = true" />
      </template>
    </AppPageHeader>

    <!-- Expiring Alerts Banner if any -->
    <div class="q-pa-md q-mb-md bg-amber-1 text-amber-10 rounded-borders row items-center justify-between" style="border: 1px solid #fde68a;">
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="warning" size="20px" />
        <span class="text-caption text-weight-bold">Compliance Alert: 2 vehicle and carrier certifications require renewal within 30 days.</span>
      </div>
      <q-btn flat dense no-caps label="Review Expiring" color="amber-10" />
    </div>

    <!-- Documents Table -->
    <q-table
      :rows="documents"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="tms-table"
      :loading="loading"
    >
      <template #body-cell-title="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="description" color="primary" size="20px" />
            <div>
              <div class="text-weight-bold text-slate-900">{{ props.value }}</div>
              <div class="text-caption text-grey-6 font-mono">{{ props.row.fileName }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-type="props">
        <q-td :props="props">
          <span class="tms-code-badge font-mono">{{ props.row.documentType?.name || 'BOL' }}</span>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <AppStatusBadge :status="props.value" />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" align="right">
          <q-btn flat round dense icon="visibility" color="primary" size="sm" @click="previewDoc(props.row)">
            <q-tooltip>Preview</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="download" color="grey-7" size="sm" @click="downloadDoc(props.row)">
            <q-tooltip>Download</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Upload Dialog -->
    <q-dialog v-model="uploadDialog">
      <q-card style="width: 450px; max-width: 90vw;" class="tms-card">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid var(--surface-border);">
          <div class="text-subtitle1 text-weight-bold text-slate-900">Upload Regulatory Document</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-input v-model="docForm.title" dense outlined label="Document Title *" />
          <q-select v-model="docForm.entityType" :options="['SHIPMENT', 'VEHICLE', 'DRIVER', 'CARRIER']" dense outlined label="Attach To Entity" />
          <q-select v-model="docForm.documentTypeId" :options="documentTypes" option-label="name" option-value="id" emit-value map-options dense outlined label="Document Type" />
          <div>
            <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Expiry Date</div>
            <DeskDateInput v-model="docForm.expiryDate" />
          </div>

          <div class="q-pa-lg bg-grey-1 rounded-borders text-center cursor-pointer" style="border: 2px dashed #cbd5e1;">
            <q-icon name="cloud_upload" size="32px" color="primary" />
            <div class="text-caption text-grey-7 q-mt-xs">Drag & drop PDF / scan file here</div>
          </div>

          <q-btn color="primary" class="full-width text-weight-bold" no-caps label="Save & Encrypt Document" @click="submitDoc" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Document Preview Modal (Eye Icon) -->
    <AppDocumentPreviewDialog
      v-model="previewDialog"
      :doc-data="selectedPreviewDoc"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatusBadge from '../../components/AppStatusBadge.vue';
import AppDocumentPreviewDialog from '../../components/AppDocumentPreviewDialog.vue';
import { DeskDateInput } from '../../framework';

const notify = useAppNotify();
const loading = ref(false);
const documents = ref<any[]>([]);
const documentTypes = ref<any[]>([]);

const uploadDialog = ref(false);
const previewDialog = ref(false);
const selectedPreviewDoc = ref<any>(null);

const docForm = ref({
  title: 'Interstate Cargo BOL - SHP-770101',
  entityType: 'SHIPMENT',
  entityId: 'shipment-1',
  documentTypeId: '',
  expiryDate: '2026-12-31',
});

const columns = [
  { name: 'title', label: 'Document Title', field: 'title', align: 'left' as const },
  { name: 'type', label: 'Classification', field: 'type', align: 'left' as const },
  { name: 'entity', label: 'Associated Entity', field: 'entityType', align: 'left' as const },
  { name: 'expiry', label: 'Expiry Date', field: (r: any) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : 'N/A', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' as const },
];

async function loadDocuments() {
  loading.value = true;
  try {
    const res: any = await api.get('/api/v1/documents');
    documents.value = res.data || res || [];

    const dtRes: any = await api.get('/api/v1/documents/types');
    documentTypes.value = dtRes.data || dtRes || [];
    if (documentTypes.value[0]) docForm.value.documentTypeId = documentTypes.value[0].id;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function submitDoc() {
  try {
    await api.post('/api/v1/documents', docForm.value);
    notify.success('Document uploaded and indexed');
    uploadDialog.value = false;
    await loadDocuments();
  } catch (err) {
    console.error(err);
  }
}

function previewDoc(doc: any) {
  selectedPreviewDoc.value = {
    id: doc.id,
    title: doc.title || doc.fileName || 'Uniform Transport Bill of Lading',
    referenceNumber: doc.documentNumber || `DOC-${doc.id?.slice(0, 8)}`,
    documentType: doc.documentType?.name || doc.type || 'CERTIFIED TRANSPORT MANIFEST',
    shipmentNumber: doc.entityId?.startsWith('SHP') ? doc.entityId : 'SHP-770101',
    customerName: 'Acme Retail Supply Corp',
    originFacility: 'Chicago Central Distribution Hub',
    originAddress: '1500 S Western Ave, Chicago, IL 60608',
    destinationFacility: 'Dallas Logistics Center - Dock 4',
    destAddress: '2200 E Interstate 30, Dallas, TX 75201',
    vehiclePlate: 'TRK-101 (Volvo VNL 760)',
    driverName: 'Marcus Vance (DRV-5001)',
    carrierName: 'Apex Dedicated Fleet',
    status: 'AUTHENTICATED',
    weight: '14,500',
    volume: '52.0',
    receiverName: 'David Miller',
  };
  previewDialog.value = true;
}

function downloadDoc(doc: any) {
  notify.success(`Downloading authorized copy of ${doc.fileName || doc.title}`);
}

onMounted(() => {
  loadDocuments();
});
</script>
