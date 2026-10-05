<template>
  <div class="q-pa-md">
    <AppPageHeader
      breadcrumb="Regulatory & Audit / Compliance Console"
      title="Regulatory Compliance & Audit Console"
      subtitle="Driver licensing, vehicle permits, cargo insurance certificates, and freight claim adjudications"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
          <q-icon name="verified_user" size="14px" />
          REGULATORY COMPLIANCE
        </span>
      </template>
      <template #actions>
        <q-btn
          color="primary"
          text-color="white"
          icon="folder_shared"
          label="Documents Vault"
          no-caps
          size="sm"
          class="text-weight-bold"
          to="/documents"
        />
      </template>
    </AppPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Compliance Score"
        value="99.4%"
        icon="verified_user"
        icon-color="positive"
        change="Excellent"
        :is-positive="true"
        subtitle="RTO & ISO 27001 audit standards"
      />
      <AppStatCard
        title="Expiring Documents"
        value="4 Renewals"
        icon="warning"
        icon-color="warning"
        subtitle="Due within next 30 days"
      />
      <AppStatCard
        title="Open Freight Claims"
        value="2 Active"
        icon="fact_check"
        icon-color="primary"
        subtitle="1 Under review • 1 Approved"
      />
      <AppStatCard
        title="Audit Event Logs"
        value="1,240 Events"
        icon="history"
        icon-color="primary"
        subtitle="Immutable security trail"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <div class="text-base font-bold text-slate-900">Regulatory Documents Awaiting Verification</div>
              <div class="text-xs text-slate-500">Carrier certificates, commercial driver licenses, and vehicle safety passes</div>
            </div>
            <q-btn flat dense no-caps size="sm" color="primary" label="Open Vault →" to="/documents" />
          </div>

          <div class="space-y-3">
            <div
              v-for="doc in expiringDocs"
              :key="doc.id"
              class="ticket-item p-3.5 rounded-lg flex items-center justify-between bg-white"
            >
              <div>
                <div class="font-bold text-sm text-slate-900">{{ doc.title }}</div>
                <div class="text-xs text-slate-500">{{ doc.party }} &bull; {{ doc.type }}</div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold" :class="doc.daysLeft <= 15 ? 'text-rose-700' : 'text-amber-700'">
                  Expires in {{ doc.daysLeft }} days
                </span>
                <q-btn color="primary" text-color="white" dense no-caps size="sm" label="Verify" to="/documents" class="q-px-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-4">
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-slate-900 mb-2">Freight Claims Adjudication</div>
          <div class="text-xs text-slate-500 mb-3">Damage, shortage, and temperature deviation claims</div>
          <div class="ticket-item p-3 rounded-lg text-xs bg-white">
            <div class="flex justify-between font-bold text-slate-900 mb-1">
              <span>CLM-2024-008</span>
              <span class="text-amber-800 font-mono font-bold">₹12,500.00</span>
            </div>
            <div class="text-slate-600">Cargo: Perishables &bull; Dwell time alarm logged on NH-48</div>
            <div class="mt-2 pt-2 border-t border-slate-200 flex justify-end">
              <q-btn flat dense no-caps size="xs" color="primary" label="Review Claim" to="/billing" />
            </div>
          </div>
        </div>

        <div class="cyber-card p-4">
          <div class="text-sm font-semibold text-slate-900 mb-1">System Audit Integrity</div>
          <p class="text-xs text-slate-600 mb-3">PostgreSQL 17 Write-Ahead Log encryption active across all tenant schemas.</p>
          <q-btn flat dense no-caps size="sm" color="primary" icon="shield" label="Security Telemetry" to="/audit-logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';

const expiringDocs = ref([
  { id: '1', title: 'Commercial Driver License (Class A)', party: 'Driver: Marcus Vance', type: 'State Licensing', daysLeft: 12 },
  { id: '2', title: 'Tractor National Carrier Permit', party: 'Vehicle: TRK-102 (Freightliner)', type: 'DOT Operating Authority', daysLeft: 18 },
  { id: '3', title: 'Cargo Transit Insurance Certificate', party: 'Carrier: Titan Freightways Corp', type: '$1,000,000 Liability Cover', daysLeft: 25 },
  { id: '4', title: 'Annual Mechanical Safety Certificate', party: 'Vehicle: TRK-104 (Kenworth)', type: 'Vehicle Inspection Pass', daysLeft: 29 },
]);
</script>

<style scoped>
.cyber-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ticket-item {
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.ticket-item:hover {
  border-color: #0284c7;
  background: #ffffff;
}
</style>
