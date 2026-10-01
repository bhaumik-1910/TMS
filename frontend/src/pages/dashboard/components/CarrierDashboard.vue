<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Carrier Workspace / Partner Console"
      title="Carrier Partner Console"
      subtitle="Titan Freightways Corp (Carrier Code: 3PL-TITAN) • Certified Logistics Partner"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800">
          <q-icon name="verified" size="14px" />
          CERTIFIED 3PL CARRIER
        </span>
      </template>
      <template #actions>
        <q-btn
          color="cyan-8"
          text-color="white"
          icon="business"
          label="Contract Rate Cards"
          no-caps
          size="sm"
          class="text-weight-bold"
          to="/billing/rates"
        />
      </template>
    </AppPageHeader>

    <!-- Carrier KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Pending Load Tenders"
        value="3 Loads"
        icon="notification_important"
        icon-color="warning"
        subtitle="Requires acceptance within 2h"
      />
      <AppStatCard
        title="Active Linehauls"
        value="8 Units"
        icon="local_shipping"
        icon-color="cyan"
        subtitle="Currently in transit"
      />
      <AppStatCard
        title="Acceptance SLA"
        value="96.5%"
        icon="thumb_up"
        icon-color="positive"
        change="+2.1%"
        :is-positive="true"
        subtitle="Tier 1 Preferred Carrier"
      />
      <AppStatCard
        title="Settlement Balance"
        value="₹3,84,500"
        icon="payments"
        icon-color="cyan"
        subtitle="Ready for weekly payout"
      />
    </div>

    <!-- Tendered Loads Action Board -->
    <div class="cyber-card p-5 mb-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div class="text-base font-bold text-white">New Load Tenders Awaiting Carrier Action</div>
          <div class="text-xs text-slate-400">Review lane origin, delivery schedule, and contracted linehaul rate</div>
        </div>
        <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">
          3 PENDING OFFERS
        </span>
      </div>

      <div class="space-y-3">
        <div
          v-for="tender in tenders"
          :key="tender.id"
          class="ticket-item p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono font-bold text-sm text-cyan-4">{{ tender.code }}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">{{ tender.equipment }}</span>
              <span class="text-xs text-slate-400 font-mono">{{ tender.weight }}</span>
            </div>
            <div class="text-xs font-medium text-slate-300">
              <span class="font-semibold text-white">{{ tender.origin }}</span>
              <span class="mx-2 text-cyan-4">&rarr;</span>
              <span class="font-semibold text-white">{{ tender.destination }}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              Pickup: <span class="text-slate-200">{{ tender.pickupTime }}</span> &bull; Distance: <span class="text-cyan-3 font-mono">{{ tender.distance }}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div class="text-right">
              <div class="text-xs text-slate-400">Contract Rate</div>
              <div class="text-base font-mono font-bold text-emerald-400">₹{{ tender.rate.toLocaleString('en-IN') }}</div>
            </div>

            <div class="flex items-center gap-2">
              <q-btn
                outline
                dense
                no-caps
                size="sm"
                color="red-4"
                label="Decline"
                @click="rejectTender(tender)"
              />
              <q-btn
                color="cyan-8"
                text-color="white"
                dense
                no-caps
                size="sm"
                label="Accept Tender"
                @click="acceptTender(tender)"
                class="q-px-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Panels for Carrier -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/shipments')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="local_shipping" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Active Assigned Linehauls</span>
        </div>
        <p class="text-xs text-slate-400 m-0">Monitor loads in transit and update arrival/departure checkpoints.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/pod')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="task" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Upload Delivery ePOD</span>
        </div>
        <p class="text-xs text-slate-400 m-0">Submit signed delivery receipts and consignee stamps to release payables.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/billing')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="receipt_long" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Carrier Settlement Vouchers</span>
        </div>
        <p class="text-xs text-slate-400 m-0">Review invoice statuses, payment schedules, and verified fuel surcharges.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';

const $q = useQuasar();

const tenders = ref([
  { id: '1', code: 'TND-2024-001', origin: 'Ahmedabad Hub, GJ', destination: 'Mumbai DC, MH', equipment: '40ft High Cube', weight: '22,400 kg', pickupTime: 'Today 06:00 PM', distance: '540 km', rate: 42000 },
  { id: '2', code: 'TND-2024-002', origin: 'Surat Terminal, GJ', destination: 'Pune Port, MH', equipment: '32ft Multi-Axle', weight: '18,500 kg', pickupTime: 'Tomorrow 09:00 AM', distance: '410 km', rate: 34500 },
  { id: '3', code: 'TND-2024-003', origin: 'Vadodara Hub, GJ', destination: 'Vapi Central, GJ', equipment: '24ft Closed Body', weight: '12,000 kg', pickupTime: 'Tomorrow 02:00 PM', distance: '260 km', rate: 21000 },
]);

function acceptTender(tender: any) {
  tenders.value = tenders.value.filter(t => t.id !== tender.id);
  $q.notify({
    type: 'positive',
    message: 'Tender Accepted',
    caption: `Load ${tender.code} successfully assigned to your carrier fleet.`,
    position: 'top-right',
  });
}

function rejectTender(tender: any) {
  tenders.value = tenders.value.filter(t => t.id !== tender.id);
  $q.notify({
    type: 'info',
    message: 'Tender Declined',
    caption: `Offer ${tender.code} returned to dispatch queue.`,
    position: 'top-right',
  });
}
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

.quick-nav-panel {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.quick-nav-panel:hover {
  border-color: #00f2fe;
  box-shadow: 0 4px 14px rgba(0, 242, 254, 0.15);
}
</style>
