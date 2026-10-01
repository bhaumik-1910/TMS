<template>
  <div class="q-pa-md">
    <AppPageHeader
      breadcrumb="Regulatory & Audit / Compliance Console"
      title="Regulatory Compliance & Audit Console"
      subtitle="Driver licensing, vehicle permits, cargo insurance certificates, and freight claim adjudications"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
          <q-icon name="verified_user" size="14px" />
          REGULATORY COMPLIANCE
        </span>
      </template>
      <template #actions>
        <q-btn
          color="cyan-8"
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
        icon-color="cyan"
        subtitle="1 Under review • 1 Approved"
      />
      <AppStatCard
        title="Audit Event Logs"
        value="1,240 Events"
        icon="history"
        icon-color="cyan"
        subtitle="Immutable security trail"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <div class="lg:col-span-8">
        <div class="cyber-card p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div class="text-base font-bold text-white">Regulatory Documents Awaiting Verification</div>
              <div class="text-xs text-slate-400">Carrier certificates, commercial driver licenses, and vehicle safety passes</div>
            </div>
            <q-btn flat dense no-caps size="sm" color="cyan" label="Open Vault →" to="/documents" />
          </div>

          <div class="space-y-3">
            <div
              v-for="doc in expiringDocs"
              :key="doc.id"
              class="ticket-item p-3.5 rounded-lg flex items-center justify-between transition-all"
            >
              <div>
                <div class="font-bold text-sm text-white">{{ doc.title }}</div>
                <div class="text-xs text-slate-400">{{ doc.party }} &bull; {{ doc.type }}</div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold" :class="doc.daysLeft <= 15 ? 'text-red-400' : 'text-amber-400'">
                  Expires in {{ doc.daysLeft }} days
                </span>
                <q-btn color="cyan-8" text-color="white" dense no-caps size="sm" label="Verify" to="/documents" class="q-px-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-4">
        <div class="cyber-card p-5">
          <div class="text-sm font-semibold text-white mb-2">Freight Claims Adjudication</div>
          <div class="text-xs text-slate-400 mb-3">Damage, shortage, and temperature deviation claims</div>
          <div class="ticket-item p-3 rounded-lg text-xs">
            <div class="flex justify-between font-bold text-white mb-1">
              <span>CLM-2024-008</span>
              <span class="text-amber-400 font-mono">₹12,500.00</span>
            </div>
            <div class="text-slate-400">Cargo: Perishables &bull; Dwell time alarm logged on NH-48</div>
            <div class="mt-2 pt-2 border-t border-slate-800 flex justify-end">
              <q-btn flat dense no-caps size="xs" color="cyan" label="Review Claim" to="/billing" />
            </div>
          </div>
        </div>

        <div class="cyber-card p-4">
          <div class="text-sm font-semibold text-white mb-1">System Audit Integrity</div>
          <p class="text-xs text-slate-400 mb-3">PostgreSQL 17 Write-Ahead Log encryption active across all tenant schemas.</p>
          <q-btn flat dense no-caps size="sm" color="cyan" icon="shield" label="Security Telemetry" to="/audit-logs" />
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
</style>
