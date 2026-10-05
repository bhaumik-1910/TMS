<template>
  <q-page class="q-pa-none" style="background-color: #f8fafc;">
    <!-- Dynamic Role-Tailored Dashboard Component (13 Roles Supported) -->
    <transition name="fade" mode="out-in">
      <component :is="activeDashboardComponent" :key="authStore.currentRole" />
    </transition>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

import DriverDashboard from './components/DriverDashboard.vue';
import CustomerDashboard from './components/CustomerDashboard.vue';
import CarrierDashboard from './components/CarrierDashboard.vue';
import FinanceDashboard from './components/FinanceDashboard.vue';
import FleetDashboard from './components/FleetDashboard.vue';
import DispatcherDashboard from './components/DispatcherDashboard.vue';
import SuperAdminDashboard from './components/SuperAdminDashboard.vue';
import TmsAdminDashboard from './components/TmsAdminDashboard.vue';
import PlannerDashboard from './components/PlannerDashboard.vue';
import ComplianceDashboard from './components/ComplianceDashboard.vue';
import SupportDashboard from './components/SupportDashboard.vue';
import AnalystDashboard from './components/AnalystDashboard.vue';
import OperationsDashboard from './components/OperationsDashboard.vue';

const authStore = useAuthStore();

const activeDashboardComponent = computed(() => {
  switch (authStore.currentRole) {
    case 'DRIVER':
      return DriverDashboard;
    case 'CUSTOMER':
      return CustomerDashboard;
    case 'CARRIER':
      return CarrierDashboard;
    case 'FINANCE_MANAGER':
      return FinanceDashboard;
    case 'FLEET_MANAGER':
      return FleetDashboard;
    case 'DISPATCHER':
      return DispatcherDashboard;
    case 'SUPER_ADMIN':
      return SuperAdminDashboard;
    case 'TMS_ADMIN':
      return TmsAdminDashboard;
    case 'TRANSPORT_PLANNER':
      return PlannerDashboard;
    case 'COMPLIANCE_MANAGER':
      return ComplianceDashboard;
    case 'SUPPORT_AGENT':
      return SupportDashboard;
    case 'ANALYST':
      return AnalystDashboard;
    case 'OPERATIONS_MANAGER':
    default:
      return OperationsDashboard;
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
