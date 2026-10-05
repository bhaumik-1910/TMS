<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <AppPageHeader
      breadcrumb="Customer Shipper Portal / Account Overview"
      title="Customer Shipper Portal"
      subtitle="Apex Global Freight Services • Account: TechCorp Industries Global (ID: ACC-77291)"
    >
      <template #badge>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-300">
          <q-icon name="verified" size="14px" />
          VERIFIED SHIPPER
        </span>
      </template>
      <template #actions>
        <q-btn
          color="primary"
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
        <div class="text-sm font-semibold text-slate-900 mb-1">Instant Cargo Tracking</div>
        <div class="text-xs text-slate-500 mb-3">Track any active shipment by Consignment Number, BL, or Tracking ID</div>
        <div class="flex items-center gap-2">
          <q-input
            v-model="trackingQuery"
            dense
            outlined
            placeholder="e.g. TRK-4820 or LR-89104..."
            class="flex-1 desk-input"
            @keyup.enter="trackCargo"
          >
            <template #prepend><q-icon name="search" size="18px" color="primary" /></template>
          </q-input>
          <q-btn color="primary" text-color="white" dense no-caps class="px-4 py-1.5 text-weight-bold" label="Track Cargo" @click="trackCargo" />
        </div>
      </div>
    </div>

    <!-- Shipper KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard
        title="Active In-Transit"
        value="4 Shipments"
        icon="local_shipping"
        icon-color="primary"
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
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <div class="text-base font-bold text-slate-900">Your Active Cargo Shipments</div>
          <div class="text-xs text-slate-500">Live milestone updates, ETAs, and delivery verifications</div>
        </div>
        <q-btn flat dense no-caps size="sm" color="primary" label="View All Orders →" to="/orders" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs desk-table bg-white">
          <thead>
            <tr class="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
              <th class="py-2.5 px-3">Shipment #</th>
              <th class="py-2.5 px-3">Lane Corridor</th>
              <th class="py-2.5 px-3">Cargo Description</th>
              <th class="py-2.5 px-3 text-right">Weight</th>
              <th class="py-2.5 px-3">Estimated Delivery</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-for="s in customerShipments" :key="s.id" class="border-b border-slate-100 bg-white hover:bg-white transition-none">
              <td class="py-3 px-3 font-mono font-bold text-sky-700">{{ s.number }}</td>
              <td class="py-3 px-3 text-slate-900 font-medium">{{ s.lane }}</td>
              <td class="py-3 px-3 text-slate-700">{{ s.cargo }}</td>
              <td class="py-3 px-3 text-right font-mono text-slate-800">{{ s.weight }}</td>
              <td class="py-3 px-3 font-mono text-sky-700">{{ s.eta }}</td>
              <td class="py-3 px-3 text-center">
                <AppStatusBadge :status="s.status" />
              </td>
              <td class="py-3 px-3 text-right">
                <q-btn flat dense round icon="gps_fixed" color="primary" size="sm" @click="router.push(`/tracking?search=${s.number}`)">
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
          <q-icon name="receipt_long" color="primary" size="20px" />
          <span class="text-sm font-bold text-slate-900">Manage Transport Bookings</span>
        </div>
        <p class="text-xs text-slate-600 m-0">Create new bookings, review consignments, and authorize load pickups.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/billing')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="request_quote" color="primary" size="20px" />
          <span class="text-sm font-bold text-slate-900">Invoices & Statements</span>
        </div>
        <p class="text-xs text-slate-600 m-0">View statements, download PDF invoices, and verify line item charges.</p>
      </div>

      <div class="quick-nav-panel p-4 rounded-lg cursor-pointer" @click="$router.push('/pod')">
        <div class="flex items-center gap-2 mb-1">
          <q-icon name="folder_shared" color="primary" size="20px" />
          <span class="text-sm font-bold text-slate-900">Proof of Delivery (POD)</span>
        </div>
        <p class="text-xs text-slate-600 m-0">Access Bills of Lading, signed delivery receipts, and customs manifests.</p>
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
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.desk-table th {
  background: #f8fafc;
  color: #475569;
  text-transform: uppercase;
  font-size: 11px;
}

.quick-nav-panel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.quick-nav-panel:hover {
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
}
</style>
