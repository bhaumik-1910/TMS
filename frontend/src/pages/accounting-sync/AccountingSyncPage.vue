<template>
  <div>
    <AppPageHeader
      title="Accounting & ERP Integration"
      subtitle="Automated ledger synchronization, Tally XML export, and SAP / Oracle journal voucher posting"
    >
      <template #actions>
        <q-btn
          outline
          color="slate-700"
          no-caps
          icon="download"
          label="Download Tally XML"
          class="bg-white"
          @click="downloadTallyXml"
        />
        <q-btn
          color="primary"
          no-caps
          icon="sync"
          label="Execute ERP Ledger Sync"
          :loading="syncing"
          @click="triggerSync"
        />
      </template>
    </AppPageHeader>

    <!-- Sync Statistics -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Synced Vouchers"
          value="142"
          icon="task_alt"
          color="positive"
          trend="100% Posted to General Ledger"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Pending Sync"
          value="4 Invoices"
          icon="pending_actions"
          color="warning"
          trend="Awaiting batch schedule"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Failed / Rejected"
          value="0 Exceptions"
          icon="check_circle"
          color="teal"
          trend="No chart of accounts mismatch"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppStatCard
          title="Active ERP Target"
          value="SAP Business One"
          icon="hub"
          color="primary"
          trend="REST API Connected"
        />
      </div>
    </div>

    <!-- ERP Integration Details & Configurations Card -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="tms-card q-pa-md full-height">
          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-xs">ERP Connection Status</div>
          <div class="text-caption text-grey-6 q-mb-md">Target accounting system gateway endpoints</div>

          <q-list dense separator class="rounded-borders border">
            <q-item>
              <q-item-section avatar><q-icon name="cloud_done" color="positive" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-caption">SAP B1 Service Layer</q-item-label>
                <q-item-label caption>https://sap.apexlogistics.com:50000</q-item-label>
              </q-item-section>
              <q-item-section side><q-badge color="positive">ONLINE</q-badge></q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar><q-icon name="description" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-caption">Tally Prime XML Engine</q-item-label>
                <q-item-label caption>Port 9000 ODBC / XML Gateway</q-item-label>
              </q-item-section>
              <q-item-section side><q-badge color="primary">READY</q-badge></q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar><q-icon name="api" color="teal" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-caption">Oracle NetSuite REST</q-item-label>
                <q-item-label caption>OAuth 2.0 Webhook</q-item-label>
              </q-item-section>
              <q-item-section side><q-badge color="teal">CONNECTED</q-badge></q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-md">
            <div class="text-caption text-weight-bold text-slate-800 q-mb-xs">Auto-Sync Schedule</div>
            <q-select
              v-model="syncSchedule"
              dense
              outlined
              :options="['Real-Time on Invoice Generation', 'Hourly Batch', 'End of Day (23:00)', 'Manual Release Only']"
            />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered class="tms-card">
          <div class="row items-center justify-between q-pa-md border-bottom">
            <div>
              <div class="text-subtitle1 text-weight-bold text-slate-900">Accounting Synchronization Journal</div>
              <div class="text-caption text-grey-6">Freight bills, carrier settlements & driver expense vouchers</div>
            </div>
            <div class="row items-center q-gutter-x-xs">
              <q-btn flat dense round icon="refresh" color="grey-7" @click="refreshEntries" />
            </div>
          </div>

          <q-table
            :rows="syncEntries"
            :columns="columns"
            row-key="id"
            flat
            dense
            :pagination="{ rowsPerPage: 6 }"
            class="tms-table"
          >
            <template #body-cell-voucherNo="props">
              <q-td :props="props">
                <span class="font-mono text-weight-bold text-primary">{{ props.row.voucherNo }}</span>
              </q-td>
            </template>

            <template #body-cell-type="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.type === 'SALES_INVOICE' ? 'primary' : props.row.type === 'CARRIER_PAYABLE' ? 'purple' : 'orange'"
                  text-color="white"
                  class="font-mono text-weight-bold"
                >
                  {{ props.row.type }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-amount="props">
              <q-td :props="props">
                <span class="font-mono text-weight-bold">${{ props.row.amount.toLocaleString() }}</span>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.status === 'POSTED' ? 'positive' : 'warning'"
                  text-color="white"
                  class="font-mono text-weight-bold"
                >
                  {{ props.row.status }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '../../components/AppPageHeader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import { useAppNotify } from '../../composables/useAppNotify';

const notify = useAppNotify();
const syncing = ref(false);
const syncSchedule = ref('Real-Time on Invoice Generation');

const columns: any[] = [
  { name: 'voucherNo', label: 'Voucher #', field: 'voucherNo', align: 'left', sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'type', label: 'Transaction Type', field: 'type', align: 'left' },
  { name: 'account', label: 'General Ledger Account', field: 'account', align: 'left' },
  { name: 'amount', label: 'Debit / Credit', field: 'amount', align: 'right' },
  { name: 'status', label: 'ERP Status', field: 'status', align: 'center' },
];

const syncEntries = ref([
  {
    id: 'sync-01',
    voucherNo: 'JV-2026-8801',
    date: '2026-09-30 08:30',
    type: 'SALES_INVOICE',
    account: 'Freight Revenue (Cr) / Target Corp (Dr)',
    amount: 14850,
    status: 'POSTED',
  },
  {
    id: 'sync-02',
    voucherNo: 'JV-2026-8802',
    date: '2026-09-30 08:45',
    type: 'CARRIER_PAYABLE',
    account: 'Freight Cost (Dr) / Swift Transport (Cr)',
    amount: 11200,
    status: 'POSTED',
  },
  {
    id: 'sync-03',
    voucherNo: 'JV-2026-8803',
    date: '2026-09-30 09:00',
    type: 'EXPENSE_VOUCHER',
    account: 'Driver Fuel & Toll Advance (Dr) / Cash-Bank (Cr)',
    amount: 1250,
    status: 'POSTED',
  },
  {
    id: 'sync-04',
    voucherNo: 'JV-2026-8804',
    date: '2026-09-30 09:12',
    type: 'SALES_INVOICE',
    account: 'Freight Revenue (Cr) / Walmart DC (Dr)',
    amount: 22400,
    status: 'PENDING',
  },
  {
    id: 'sync-05',
    voucherNo: 'JV-2026-8805',
    date: '2026-09-30 09:15',
    type: 'CARRIER_PAYABLE',
    account: 'Freight Cost (Dr) / Schneider Freight (Cr)',
    amount: 16700,
    status: 'PENDING',
  },
]);

function triggerSync() {
  syncing.value = true;
  setTimeout(() => {
    syncEntries.value.forEach(e => (e.status = 'POSTED'));
    syncing.value = false;
    notify.success('Successfully posted 2 pending vouchers to SAP B1 General Ledger.');
  }, 1200);
}

function downloadTallyXml() {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>20260930</DATE>
            <VOUCHERNUMBER>JV-2026-8801</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Target Logistics</PARTYLEDGERNAME>
            <AMOUNT>14850.00</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Tally_TMS_Vouchers_20260930.xml';
  a.click();
  URL.revokeObjectURL(url);
  notify.success('Tally Prime XML voucher batch file downloaded successfully.');
}

function refreshEntries() {
  notify.info('Refreshed ERP synchronization logs.');
}
</script>
