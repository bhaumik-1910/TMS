<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Customer Shipper Portal / Account Overview"
      title="Customer Shipper Portal"
      subtitle="Apex Global Freight Services • Account: TechCorp Industries Global (ID: ACC-77291)"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
          <q-icon name="verified" size="14px" />
          VERIFIED SHIPPER
        </span>
      </template>
      <template #actions>
        <q-btn
          color="cyan-8"
          text-color="white"
          icon="add"
          label="New Freight Booking"
          no-caps
          size="sm"
          class="text-weight-bold"
          to="/orders?create=true"
        />
      </template>
    </AppPageHeader>

    <!-- Quick Track Search Bar -->
    <div class="cyber-card p-5 mb-6">
      <div class="max-w-2xl">
        <div class="text-sm font-semibold text-cyan-3 mb-1">Instant Cargo Tracking</div>
        <div class="text-xs text-slate-400 mb-3">Track any active shipment by Consignment Number, BL, or Tracking ID</div>
        <div class="flex items-center gap-2">
          <q-input
            v-model="trackingQuery"
            dense
            outlined
            placeholder="e.g. TRK-4820 or LR-89104..."
            class="flex-1 desk-input"
            @keyup.enter="trackCargo"
          >
            <template #prepend><q-icon name="search" size="18px" color="cyan" /></template>
          </q-input>
          <q-btn color="cyan-8" text-color="white" dense no-caps class="px-4 py-1.5 text-weight-bold" label="Track Cargo" @click="trackCargo" />
        </div>
      </div>
    </div>

    <!-- Shipper KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Active In-Transit"
        value="4 Shipments"
        icon="local_shipping"
        icon-color="cyan"
        subtitle="Moving across freight corridors"
      />
      <AppStatCard
        title="Delivered (This Month)"
        value="38 Orders"
        icon="task_alt"
        icon-color="positive"
        change="+14.2%"
        :is-positive="true"
        subtitle="100% ePOD verified"
      />
      <AppStatCard
        title="On-Time Delivery SLA"
        value="98.2%"
        icon="verified"
        icon-color="positive"
        change="Target: 95%"
        :is-positive="true"
        subtitle="Consistently on schedule"
      />
      <AppStatCard
        title="Open Invoices"
        value="₹42,500.00"
        icon="receipt"
        icon-color="warning"
        subtitle="2 Invoices due in 15 days"
      />
    </div>

    <!-- Active Shipments Table -->
    <div class="cyber-card p-5 mb-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div class="text-base font-bold text-white">Your Active Cargo Shipments</div>
          <div class="text-xs text-slate-400">Live milestone updates, ETAs, and delivery verifications</div>
        </div>
        <q-btn flat dense no-caps size="sm" color="cyan" label="View All Orders →" to="/orders" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs desk-table">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 font-semibold">
              <th class="py-2.5 px-3">Shipment #</th>
              <th class="py-2.5 px-3">Lane Corridor</th>
              <th class="py-2.5 px-3">Cargo Description</th>
              <th class="py-2.5 px-3 text-right">Weight</th>
              <th class="py-2.5 px-3">Estimated Delivery</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in customerShipments" :key="s.id" class="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
              <td class="py-3 px-3 font-mono font-bold text-cyan-4">{{ s.number }}</td>
              <td class="py-3 px-3 text-white font-medium">{{ s.lane }}</td>
              <td class="py-3 px-3 text-slate-300">{{ s.cargo }}</td>
              <td class="py-3 px-3 text-right font-mono text-slate-200">{{ s.weight }}</td>
              <td class="py-3 px-3 font-mono text-cyan-3">{{ s.eta }}</td>
              <td class="py-3 px-3 text-center">
                <AppStatusBadge :status="s.status" />
              </td>
              <td class="py-3 px-3 text-right">
                <q-btn flat dense round icon="gps_fixed" color="cyan" size="sm" @click="router.push(`/tracking?search=${s.number}`)">
                  <q-tooltip>Live Telematics Radar</q-tooltip>
                </q-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Navigation Panels for Customer -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/orders')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="receipt_long" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Manage Transport Bookings</span>
        </div>
        <p class="text-xs text-slate-400 m-0">Create new bookings, review consignments, and authorize load pickups.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/billing')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="request_quote" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Invoices & Statements</span>
        </div>
        <p class="text-xs text-slate-400 m-0">View statements, download PDF invoices, and verify line item charges.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/pod')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="folder_shared" color="cyan" size="20px" />
          <span class="text-sm font-bold text-white">Proof of Delivery (POD)</span>
        </div>
        <p class="text-xs text-slate-400 m-0">Access Bills of Lading, signed delivery receipts, and customs manifests.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppNotify } from '../../../composables/useAppNotify';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import AppStatusBadge from '../../../components/AppStatusBadge.vue';

const router = useRouter();
const notify = useAppNotify();
const trackingQuery = ref('TRK-4820');

const customerShipments = ref([
  {
    id: 's-1',
    number: 'TRK-4820',
    lane: 'Ahmedabad Hub → Mumbai Central DC',
    cargo: 'FMCG Consumer Packaged Goods',
    weight: '18,400 kg',
    eta: 'Today, 06:30 PM',
    status: 'IN_TRANSIT',
  },
  {
    id: 's-2',
    number: 'TRK-4819',
    lane: 'Surat Depot → Pune Logistics Park',
    cargo: 'Textile Fabric Bales',
    weight: '14,200 kg',
    eta: 'Tomorrow, 09:00 AM',
    status: 'PLANNED',
  },
  {
    id: 's-3',
    number: 'TRK-4815',
    lane: 'Mumbai Port → Vadodara DC',
    cargo: 'Industrial Polyethylene Pellets',
    weight: '22,000 kg',
    eta: 'Delivered (ePOD Signed)',
    status: 'DELIVERED',
  },
]);

function trackCargo() {
  if (!trackingQuery.value) {
    notify.warning('Please enter a Consignment or Tracking number');
    return;
  }
  router.push(`/tracking?search=${encodeURIComponent(trackingQuery.value)}`);
}
</script>

<style scoped>
.cyber-card {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.desk-table th {
  background: rgba(255, 255, 255, 0.02);
  text-transform: uppercase;
  font-size: 11px;
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
