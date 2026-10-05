<template>
  <q-dialog v-model="isOpen" position="top" transition-show="fade" transition-hide="fade">
    <div class="tms-command-palette bg-white rounded-borders shadow-3 q-mt-xl" style="width: 620px; max-width: 95vw; border: 1px solid var(--tms-border); overflow: hidden;">
      <!-- Search Input Header -->
      <div class="row items-center q-px-md q-py-sm" style="border-bottom: 1px solid var(--tms-border);">
        <q-icon name="search" size="20px" color="grey-6" class="q-mr-sm" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Type a command or search shipments, orders, drivers... (ESC to exit)"
          class="col text-body1 text-slate-900 border-none outline-none font-sans"
          style="border: none; outline: none; background: transparent; height: 40px;"
          @keydown.down.prevent="navigateResults(1)"
          @keydown.up.prevent="navigateResults(-1)"
          @keydown.enter.prevent="selectActiveResult"
        />
        <q-badge color="grey-3" text-color="grey-8" class="font-mono text-caption q-px-xs">
          ESC
        </q-badge>
      </div>

      <!-- Command List & Results -->
      <div class="overflow-auto q-py-xs" style="max-height: 380px;">
        <div v-if="filteredGroups.length === 0" class="text-center q-pa-lg text-grey-5 text-caption">
          No matching records or commands found
        </div>

        <template v-for="group in filteredGroups" :key="group.title">
          <div class="text-caption text-weight-bold text-grey-5 q-px-md q-pt-sm q-pb-xs text-uppercase" style="font-size: 0.68rem; letter-spacing: 0.05em;">
            {{ group.title }}
          </div>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="row items-center justify-between q-px-md q-py-sm cursor-pointer transition-all"
            :class="{ 'bg-blue-1 text-primary': activeId === item.id }"
            @mouseenter="activeId = item.id"
            @click="executeItem(item)"
          >
            <div class="row items-center q-gutter-x-sm">
              <q-icon :name="item.icon" size="18px" :color="activeId === item.id ? 'primary' : 'grey-7'" />
              <div>
                <span class="text-weight-medium text-slate-800 text-body2">{{ item.title }}</span>
                <span v-if="item.subtitle" class="text-caption text-grey-5 q-ml-sm font-mono">{{ item.subtitle }}</span>
              </div>
            </div>
            <div class="row items-center q-gutter-x-xs">
              <q-badge v-if="'badge' in item && (item as any).badge" :color="(item as any).badgeColor || 'grey-2'" :text-color="(item as any).badgeTextColor || 'grey-8'" size="xs">
                {{ (item as any).badge }}
              </q-badge>
              <q-icon name="subdirectory_arrow_left" size="14px" color="grey-4" />
            </div>
          </div>
        </template>
      </div>

      <!-- Palette Footer -->
      <div class="row items-center justify-between q-px-md q-py-xs bg-grey-1" style="border-top: 1px solid var(--tms-border); font-size: 0.72rem; color: #64748b;">
        <div class="row items-center q-gutter-x-md">
          <span><kbd class="tms-code-badge">↑</kbd> <kbd class="tms-code-badge">↓</kbd> to navigate</span>
          <span><kbd class="tms-code-badge">↵</kbd> to select</span>
        </div>
        <div class="font-mono">Apex Command Engine v2.4</div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const activeId = ref<string>('nav-dashboard');

const commands = [
  {
    title: 'Quick Navigation',
    items: [
      { id: 'nav-dashboard', title: 'Dashboard Overview', subtitle: '/dashboard', icon: 'dashboard', route: '/dashboard' },
      { id: 'nav-shipments', title: 'Active Shipments Board', subtitle: '/shipments', icon: 'local_shipping', route: '/shipments' },
      { id: 'nav-orders', title: 'Transport Freight Orders', subtitle: '/orders', icon: 'description', route: '/orders' },
      { id: 'nav-dispatch', title: 'Dispatch Execution Board', subtitle: '/dispatch', icon: 'assignment', route: '/dispatch' },
      { id: 'nav-tracking', title: 'Live GPS Telemetry Map', subtitle: '/tracking', icon: 'my_location', route: '/tracking' },
    ],
  },
  {
    title: 'Fleet & Personnel',
    items: [
      { id: 'fleet-vehicles', title: 'Fleet Tractor-Trailer Units', subtitle: '/fleet', icon: 'directions_car', route: '/fleet' },
      { id: 'fleet-drivers', title: 'CDL Driver Directory', subtitle: '/drivers', icon: 'badge', route: '/drivers' },
      { id: 'fleet-app', title: 'Electronic Proof of Delivery (ePOD)', subtitle: '/pod', icon: 'draw', route: '/pod' },
      { id: 'fleet-carriers', title: '3rd Party Dedicated Carriers', subtitle: '/carriers', icon: 'business', route: '/carriers' },
    ],
  },
  {
    title: 'Finance & Governance',
    items: [
      { id: 'fin-billing', title: 'Freight Invoices & Billing', subtitle: '/billing', icon: 'request_quote', route: '/billing' },
      { id: 'fin-audit', title: 'Freight Audit & Claims', subtitle: '/freight-audit', icon: 'fact_check', route: '/freight-audit' },
      { id: 'fin-sync', title: 'Accounting ERP Sync', subtitle: '/accounting-sync', icon: 'sync_alt', route: '/accounting-sync' },
      { id: 'admin-roles', title: 'RBAC Roles & Permissions Matrix', subtitle: '/admin/roles', icon: 'admin_panel_settings', route: '/admin/roles' },
      { id: 'admin-users', title: 'User Access Directory', subtitle: '/admin/users', icon: 'manage_accounts', route: '/admin/users' },
    ],
  },
];

const filteredGroups = computed(() => {
  if (!query.value.trim()) return commands;
  const q = query.value.toLowerCase();

  return commands
    .map(g => {
      const filtered = g.items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
      return { ...g, items: filtered };
    })
    .filter(g => g.items.length > 0);
});

function open() {
  isOpen.value = true;
  query.value = '';
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function close() {
  isOpen.value = false;
}

function executeItem(item: any) {
  if (item.route) {
    router.push(item.route);
  }
  close();
}

function getAllFlatItems() {
  return filteredGroups.value.flatMap(g => g.items);
}

function navigateResults(delta: number) {
  const items = getAllFlatItems();
  if (items.length === 0) return;
  const idx = items.findIndex(i => i.id === activeId.value);
  let nextIdx = idx + delta;
  if (nextIdx < 0) nextIdx = items.length - 1;
  if (nextIdx >= items.length) nextIdx = 0;
  activeId.value = items[nextIdx].id;
}

function selectActiveResult() {
  const items = getAllFlatItems();
  const selected = items.find(i => i.id === activeId.value) || items[0];
  if (selected) executeItem(selected);
}

// Global Ctrl + K listener
function handleKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    open();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

defineExpose({ open, close });
</script>
