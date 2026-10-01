<template>
  <div class="q-pa-md">
    <AppPageHeader
      breadcrumb="Customer Service / Support Desk"
      title="Customer Support & Incident Desk"
      subtitle="Shipper inquiry resolution, delivery delay monitoring, exception handling, and carrier escalation"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-pink-950 text-pink-300 border border-pink-800">
          <q-icon name="support_agent" size="14px" />
          CUSTOMER SUPPORT
        </span>
      </template>
      <template #actions>
        <q-btn
          color="cyan-8"
          text-color="white"
          icon="my_location"
          label="Live Telematics Radar"
          no-caps
          size="sm"
          class="text-weight-bold"
          to="/tracking"
        />
      </template>
    </AppPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Open Support Tickets"
        value="6 Tickets"
        icon="confirmation_number"
        icon-color="cyan"
        subtitle="3 Priority • 3 Normal"
      />
      <AppStatCard
        title="Avg. First Response"
        value="4.2 mins"
        icon="speed"
        icon-color="positive"
        change="SLA: < 15m"
        :is-positive="true"
        subtitle="Prompt shipper support"
      />
      <AppStatCard
        title="Active Delayed Shipments"
        value="2 Shipments"
        icon="schedule"
        icon-color="warning"
        subtitle="Proactive notifications sent"
      />
      <AppStatCard
        title="Customer Satisfaction"
        value="4.92 / 5.0"
        icon="star"
        icon-color="amber"
        subtitle="98% Positive CSAT feedback"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <!-- Active Inquiries Feed -->
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div class="text-base font-bold text-white">Active Shipper Inquiries & Delay Alerts</div>
              <div class="text-xs text-slate-400">Live ticket stream and status updates</div>
            </div>
            <q-badge color="cyan-9" text-color="cyan-2" rounded>{{ tickets.length }} Active</q-badge>
          </div>

          <div class="space-y-3">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="ticket-item p-3.5 rounded-lg flex items-center justify-between transition-all"
            >
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono font-bold text-sm text-cyan-4">{{ ticket.ticketNumber }}</span>
                  <span
                    class="text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider font-mono"
                    :class="ticket.priority === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-950 text-blue-300 border border-blue-800'"
                  >
                    {{ ticket.priority }}
                  </span>
                  <span class="text-xs text-slate-300 font-semibold">{{ ticket.customer }}</span>
                </div>
                <div class="text-xs text-slate-200 font-medium">{{ ticket.subject }}</div>
                <div class="text-[11px] text-slate-400 mt-1">
                  Associated Shipment: <strong class="text-cyan-3">{{ ticket.shipment }}</strong> &bull; Logged {{ ticket.time }}
                </div>
              </div>
              <q-btn
                unelevated
                dense
                no-caps
                size="sm"
                color="cyan-8"
                text-color="white"
                label="Resolve Ticket"
                to="/tracking"
                class="q-px-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Search & Actions Sidebar -->
      <div class="lg:col-span-4 space-y-4">
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <q-icon name="bolt" color="cyan" size="18px" />
            <span>Quick Operations Lookup</span>
          </div>
          <div class="space-y-2 text-xs">
            <q-btn
              flat
              dense
              no-caps
              color="cyan"
              icon="search"
              label="Search Transport Orders"
              to="/orders"
              class="full-width text-left justify-start quick-btn"
            />
            <q-btn
              flat
              dense
              no-caps
              color="cyan"
              icon="local_shipping"
              label="Search Shipments Feed"
              to="/shipments"
              class="full-width text-left justify-start quick-btn"
            />
            <q-btn
              flat
              dense
              no-caps
              color="cyan"
              icon="draw"
              label="Verify Delivery Receipts (POD)"
              to="/pod"
              class="full-width text-left justify-start quick-btn"
            />
            <q-btn
              flat
              dense
              no-caps
              color="cyan"
              icon="receipt"
              label="Check Customer Invoices"
              to="/billing"
              class="full-width text-left justify-start quick-btn"
            />
          </div>
        </div>

        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-white mb-2">Escalation Matrix</div>
          <div class="text-xs text-slate-400 mb-3">On-call dispatch managers for high priority transit incidents</div>
          <div class="text-xs space-y-2">
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span class="text-slate-300">Western Corridor (AHD-MUM)</span>
              <span class="font-mono text-cyan-4">Kishore B.</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span class="text-slate-300">Northern Corridor (DEL-JPR)</span>
              <span class="font-mono text-cyan-4">Suresh P.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';

const tickets = ref([
  { id: '1', ticketNumber: 'TCK-881', customer: 'TechCorp Industries', priority: 'HIGH', subject: 'ETA update requested for Chicago → Dallas linehaul', shipment: 'TRK-4820', time: '8 mins ago' },
  { id: '2', ticketNumber: 'TCK-882', customer: 'FreshDirect Logistics', priority: 'NORMAL', subject: 'Copy of electronic Bill of Lading (e-BOL) requested', shipment: 'TRK-4819', time: '22 mins ago' },
  { id: '3', ticketNumber: 'TCK-883', customer: 'Global Retailers LLC', priority: 'NORMAL', subject: 'Receiving dock appointment time reschedule to 10:00 AM', shipment: 'TRK-4815', time: '1h ago' },
]);
</script>

<style scoped>
.cyber-card {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.ticket-item {
  background: #111a33;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ticket-item:hover {
  border-color: rgba(0, 242, 254, 0.3);
  background: #14203e;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 6px 12px;
}

.quick-btn:hover {
  background: rgba(0, 242, 254, 0.08);
  border-color: rgba(0, 242, 254, 0.3);
}
</style>
