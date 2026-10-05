<template>
  <div class="q-pa-md">
    <AppPageHeader
      breadcrumb="Business Intelligence / Analytics"
      title="Freight Analytics & Intelligence Console"
      subtitle="Multi-echelon network performance, carrier benchmarking, lane profitability, and scheduled reports"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
          <q-icon name="insights" size="14px" />
          ANALYTICS WORKSPACE
        </span>
      </template>
      <template #actions>
        <q-btn
          color="primary"
          text-color="white"
          icon="download"
          label="Export Reports (CSV/PDF)"
          no-caps
          size="sm"
          class="text-weight-bold"
          @click="downloadReport('Network Intelligence Report', 'PDF')"
        />
      </template>
    </AppPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Total Linehaul Volume"
        value="1,420 Tons"
        icon="trending_up"
        icon-color="primary"
        change="+9.2% MoM"
        :is-positive="true"
        subtitle="Across 28 active lanes"
      />
      <AppStatCard
        title="Cost Per Ton-Km"
        value="₹2.18"
        icon="payments"
        icon-color="positive"
        change="-3.4% YoY"
        :is-positive="true"
        subtitle="Network efficiency target: < ₹2.25"
      />
      <AppStatCard
        title="Fleet Fuel Efficiency"
        value="4.2 km/L"
        icon="speed"
        icon-color="warning"
        subtitle="Volvo & BharatBenz fleet avg"
      />
      <AppStatCard
        title="Carrier Acceptance Rate"
        value="97.4%"
        icon="thumb_up"
        icon-color="positive"
        subtitle="First-tender acceptance"
      />
    </div>

    <!-- Reports & Data Explorer -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <div class="text-base font-bold text-slate-900">Standard Freight Analytics Reports</div>
              <div class="text-xs text-slate-500">Download formatted intelligence summaries in Excel, CSV, or PDF</div>
            </div>
            <q-btn flat dense no-caps size="sm" color="primary" label="Open Reports Console →" to="/reports" />
          </div>

          <div class="divide-y divide-slate-200 text-xs">
            <div v-for="rpt in reports" :key="rpt.id" class="py-3 flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900">{{ rpt.title }}</div>
                <div class="text-slate-500">{{ rpt.desc }} &bull; Format: {{ rpt.formats }}</div>
              </div>
              <div class="flex items-center gap-2">
                <q-btn outline dense no-caps size="xs" color="primary" icon="download" label="CSV" @click="downloadReport(rpt.title, 'CSV')" />
                <q-btn outline dense no-caps size="xs" color="grey-7" icon="download" label="PDF" @click="downloadReport(rpt.title, 'PDF')" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-4">
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-slate-900 mb-2">Automated Scheduled Exports</div>
          <div class="text-xs text-slate-500 mb-3">Daily & weekly automated email dispatches to finance & leadership</div>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span class="text-slate-800">Weekly Linehaul Summary</span>
              <span class="font-mono text-emerald-700 font-bold">Mon 06:00 AM</span>
            </div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span class="text-slate-800">Monthly Carrier Scorecard</span>
              <span class="font-mono text-emerald-700 font-bold">1st of Month</span>
            </div>
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
              <span class="text-slate-800">CO2 Environmental Emissions</span>
              <span class="font-mono text-sky-700 font-bold">Quarterly</span>
            </div>
          </div>
        </div>

        <div class="cyber-card p-4">
          <div class="text-sm font-semibold text-slate-900 mb-1">Gati Copilot AI Predictive Engine</div>
          <p class="text-xs text-slate-600 mb-3">Machine learning lane demand forecasting & fuel rate variance model.</p>
          <q-btn outline dense no-caps size="sm" color="primary" icon="smart_toy" label="Open Gati Copilot" to="/copilot" class="full-width text-xs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import { exportToCsv } from '../../../utils/exportCsv';
import { exportToPdf } from '../../../utils/exportPdf';

const $q = useQuasar();

const reports = ref([
  { id: '1', title: 'Monthly Corridor Lane Profitability', desc: 'Freight margin analysis per origin-destination hub', formats: 'CSV, PDF' },
  { id: '2', title: 'Carrier On-Time Delivery (OTD) Benchmarking', desc: 'Tier 1/2 performance vs contractual SLA', formats: 'CSV, PDF' },
  { id: '3', title: 'Fuel Dwell & Fleet Telemetry Variance', desc: 'Route idle time and fuel consumption deviations', formats: 'CSV, PDF' },
  { id: '4', title: 'Customer Volume & Spend Ledger', desc: 'Consignment volume and revenue per client', formats: 'CSV, PDF' },
]);

function downloadReport(title: string, format: string) {
  const dummyRows = [
    { corridor: 'Ahmedabad → Mumbai', volume: '480 MT', revenue: '₹10,50,000', margin: '18.4%', otd: '98.5%' },
    { corridor: 'Surat → Pune', volume: '320 MT', revenue: '₹6,40,000', margin: '16.2%', otd: '97.0%' },
    { corridor: 'Mumbai → Delhi', volume: '620 MT', revenue: '₹17,00,000', margin: '21.0%', otd: '99.1%' },
  ];

  if (format === 'CSV') {
    exportToCsv(
      title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      [
        { label: 'Corridor', field: 'corridor' },
        { label: 'Volume (MT)', field: 'volume' },
        { label: 'Gross Revenue', field: 'revenue' },
        { label: 'Operating Margin', field: 'margin' },
        { label: 'On-Time Delivery', field: 'otd' },
      ],
      dummyRows,
    );
    $q.notify({
      type: 'positive',
      message: 'Report Downloaded',
      caption: `${title} exported to CSV.`,
      position: 'top-right',
    });
  } else {
    exportToPdf({
      title: title,
      subtitle: 'Freight Intelligence & Corridor Analytics',
      columns: [
        { label: 'Corridor Lane', field: 'corridor' },
        { label: 'Volume', field: 'volume' },
        { label: 'Revenue', field: 'revenue', align: 'right' },
        { label: 'Margin', field: 'margin', align: 'right' },
        { label: 'OTD Rate', field: 'otd', align: 'center' },
      ],
      rows: dummyRows,
    });
  }
}
</script>

<style scoped>
.cyber-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
