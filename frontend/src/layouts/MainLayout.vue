<template>
  <DeskShell>
    <q-layout view="hHh Lpr lff">
      <!-- Modular Top Header -->
      <AppHeader
        :unread-count="unreadCount"
        @toggle-sidebar="toggleSidebar"
        @open-search="commandPaletteRef?.open()"
        @open-notifications="notificationsDrawerRef?.open()"
      />

      <!-- Modular Sidebar Drawer -->
      <AppSidebar
        v-model="leftDrawerOpen"
        v-model:mini="isMiniSidebar"
      />

      <!-- Page Content Container -->
      <q-page-container class="bg-black" style="min-height: calc(100vh - 26px);">
        <div style="width: 100%; margin: 0; padding: 0; min-height: calc(100vh - 60px);">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </q-page-container>

      <!-- Global Command Palette (Ctrl+K) -->
      <CommandPalette ref="commandPaletteRef" />

      <!-- Modern Notification Center Drawer -->
      <NotificationsDrawer ref="notificationsDrawerRef" />
    </q-layout>
  </DeskShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import CommandPalette from '../components/CommandPalette.vue';
import NotificationsDrawer from '../components/NotificationsDrawer.vue';
import { DeskShell, DeskMenuBar, DeskMenuSection } from '../framework';

const authStore = useAuthStore();
const notifStore = useNotificationsStore();
const leftDrawerOpen = ref(true);
const isMiniSidebar = ref(false);

const commandPaletteRef = ref<any | null>(null);
const notificationsDrawerRef = ref<any | null>(null);

const menuSections = ref<DeskMenuSection[]>([
  {
    id: 'operations',
    label: 'Operations',
    mnemonic: 'O',
    items: [
      { id: 'orders', label: 'Orders / LR Booking', mnemonic: 'B', shortcut: 'Ctrl+Shift+O', to: '/orders', icon: 'description' },
      { id: 'lr', label: 'LR Consignments', mnemonic: 'L', to: '/lr-consignments', icon: 'receipt_long' },
      { id: 'shipments', label: 'Shipments', mnemonic: 'S', shortcut: 'Ctrl+Shift+S', to: '/shipments', icon: 'local_shipping' },
      { id: 'planning', label: 'Load Planning', mnemonic: 'P', shortcut: 'Ctrl+Shift+P', to: '/planning', icon: 'route' },
      { id: 'dispatch', label: 'Dispatch Console', mnemonic: 'D', shortcut: 'Ctrl+Shift+D', to: '/dispatch', icon: 'send' },
      { id: 'tracking', label: 'Live Tracking', mnemonic: 'T', shortcut: 'Ctrl+Shift+T', to: '/tracking', icon: 'gps_fixed' },
    ],
  },
  {
    id: 'master-data',
    label: 'Master Data',
    mnemonic: 'M',
    items: [
      { id: 'fleet', label: 'Fleet & Vehicles', mnemonic: 'V', to: '/fleet', icon: 'directions_car' },
      { id: 'drivers', label: 'Drivers', mnemonic: 'D', to: '/drivers', icon: 'badge' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    mnemonic: 'F',
    items: [
      { id: 'billing', label: 'Invoices & Billing', mnemonic: 'I', to: '/billing', icon: 'account_balance_wallet' },
      { id: 'rates', label: 'Rate Cards', mnemonic: 'R', to: '/billing/rates', icon: 'request_quote' },
      { id: 'reports', label: 'Reports & Analytics', mnemonic: 'A', to: '/reports', icon: 'analytics' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    mnemonic: 'S',
    items: [
      { id: 'dashboard', label: 'Dashboard', mnemonic: 'D', to: '/dashboard', icon: 'dashboard' },
      { id: 'admin', label: 'Admin Console', mnemonic: 'A', to: '/admin', icon: 'admin_panel_settings' },
      { id: 'users', label: 'Access Management', mnemonic: 'U', to: '/admin/users', icon: 'manage_accounts' },
      { id: 'settings', label: 'Organization & Settings', mnemonic: 'O', to: '/settings', icon: 'settings_suggest' },
    ],
  },
]);


const unreadCount = computed(() => notifStore.unreadCount);

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await authStore.loadOrganizations();
  }
  notifStore.fetchNotifications(true);
});

function toggleSidebar() {
  if (window.innerWidth < 1024) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  } else {
    isMiniSidebar.value = !isMiniSidebar.value;
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
