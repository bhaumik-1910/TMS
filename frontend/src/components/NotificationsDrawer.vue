<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    behavior="mobile"
    :width="420"
    class="notifications-cyber-drawer text-white shadow-24"
    style="background: #080e1c; border-left: 1px solid #1a2744;"
  >
    <div class="column full-height">
      <!-- Drawer Header -->
      <div class="row items-center justify-between q-px-md q-py-sm" style="border-bottom: 1px solid #1e293b; background: rgba(13, 23, 43, 0.95);">
        <div class="row items-center q-gutter-x-sm">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <q-icon name="notifications_active" size="18px" />
          </div>
          <div>
            <div class="row items-center gap-2">
              <span class="text-sm font-bold text-white tracking-wide">Live Notification Feed</span>
              <span
                v-if="notifStore.unreadCount > 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse"
              >
                {{ notifStore.unreadCount }} NEW
              </span>
            </div>
            <div class="text-[10px] font-mono text-slate-400">Real-time telematics & operational alerts</div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-xs">
          <!-- Quick Mark All Read -->
          <q-btn
            v-if="notifStore.unreadCount > 0"
            flat
            dense
            no-caps
            size="xs"
            color="cyan-4"
            icon="done_all"
            label="Read All"
            class="font-mono text-[11px] q-mr-xs"
            @click="notifStore.markAllAsRead"
          >
            <q-tooltip>Mark all notifications as read</q-tooltip>
          </q-btn>

          <!-- Refresh Feed -->
          <q-btn
            flat
            dense
            round
            size="sm"
            color="cyan-4"
            icon="refresh"
            :loading="notifStore.isRefreshing"
            @click="refreshFeed"
          >
            <q-tooltip>Refresh Live Notifications</q-tooltip>
          </q-btn>

          <!-- Close Drawer -->
          <q-btn flat round dense icon="close" color="slate-400" size="sm" @click="close">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Quick Category Tabs with Dynamic Live Counters -->
      <div class="q-px-sm q-pt-xs" style="border-bottom: 1px solid #1a2744; background: #070c18;">
        <q-tabs
          v-model="activeTab"
          dense
          no-caps
          active-color="cyan"
          indicator-color="cyan"
          class="text-slate-400 font-mono text-xs"
          align="justify"
          inline-label
        >
          <q-tab name="all">
            <span class="q-mr-xs">All</span>
            <span class="text-[10px] text-slate-500">({{ notifStore.notifications.length }})</span>
          </q-tab>
          <q-tab name="unread">
            <span class="q-mr-xs">Unread</span>
            <span class="text-[10px] text-cyan-400 font-bold" v-if="notifStore.unreadCount > 0">({{ notifStore.unreadCount }})</span>
          </q-tab>
          <q-tab name="critical">
            <span class="q-mr-xs">Critical</span>
            <span class="text-[10px] text-rose-400 font-bold" v-if="notifStore.criticalCount > 0">({{ notifStore.criticalCount }})</span>
          </q-tab>
          <q-tab name="operations" label="Ops" />
          <q-tab name="system" label="System" />
        </q-tabs>
      </div>

      <!-- Notifications Scroll List -->
      <div class="col overflow-auto q-pa-sm custom-scroll relative-position">
        <!-- Inner Loading Indicator -->
        <q-inner-loading :showing="notifStore.loading" style="background: rgba(7, 12, 24, 0.85); z-index: 10;">
          <q-spinner-dots size="40px" color="cyan" />
          <div class="text-xs font-mono text-cyan-400 q-mt-sm">Syncing Live Events...</div>
        </q-inner-loading>

        <!-- Empty State -->
        <div v-if="!notifStore.loading && filteredList.length === 0" class="column flex-center q-pa-xl text-center">
          <div class="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
            <q-icon name="notifications_off" size="28px" />
          </div>
          <div class="text-sm font-semibold text-slate-300">No notifications found</div>
          <div class="text-xs text-slate-500 font-mono mt-1">All events in this channel are up to date</div>
          <q-btn
            dense
            no-caps
            outline
            color="cyan-4"
            size="xs"
            label="Simulate Live Radar Ping"
            icon="bolt"
            class="q-mt-md font-mono"
            @click="simulateLiveAlert"
          />
        </div>

        <!-- List of Notifications -->
        <div v-else class="space-y-2.5">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="notif-card p-3 rounded-lg border transition-all cursor-pointer relative group"
            :class="[
              !item.isRead ? 'bg-slate-900/90 border-cyan-800/60 shadow-[0_0_12px_rgba(0,242,254,0.08)]' : 'bg-slate-950/60 border-slate-800/70 opacity-80 hover:opacity-100',
              getCardBorderAccent(item.type)
            ]"
            @click="handleItemClick(item)"
          >
            <div class="row items-start no-wrap gap-3">
              <!-- Type Icon Avatar -->
              <div
                class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-sm"
                :class="getTypeBadgeClasses(item.type)"
              >
                <q-icon :name="getIconName(item.type, item.title)" size="16px" />
              </div>

              <!-- Content Body -->
              <div class="col min-w-0">
                <div class="row items-center justify-between no-wrap gap-2">
                  <div class="row items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold leading-tight truncate text-white group-hover:text-cyan-300 transition-colors"
                    >
                      {{ item.title }}
                    </span>
                    <span
                      v-if="!item.isRead"
                      class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0"
                    ></span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 flex-shrink-0 whitespace-nowrap">
                    {{ formatRelativeTime(item.createdAt) }}
                  </span>
                </div>

                <div class="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans line-clamp-2">
                  {{ item.message }}
                </div>

                <!-- Footer Quick Actions & Badges -->
                <div class="row items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                  <span
                    class="px-1.5 py-0.5 rounded uppercase tracking-wider text-[9px] font-semibold border"
                    :class="getTypeTagClasses(item.type)"
                  >
                    {{ item.type || 'INFO' }}
                  </span>

                  <div class="row items-center gap-1">
                    <!-- Quick Navigate Link -->
                    <span
                      v-if="getDeepLink(item.title, item.message)"
                      class="text-cyan-400 hover:underline flex items-center gap-0.5 q-mr-xs"
                      @click.stop="navigateDirect(item)"
                    >
                      <span>{{ getDeepLinkLabel(item.title, item.message) }}</span>
                      <q-icon name="arrow_forward" size="10px" />
                    </span>

                    <!-- Mark Single Read -->
                    <q-btn
                      v-if="!item.isRead"
                      flat
                      round
                      dense
                      icon="done"
                      size="xs"
                      color="cyan-4"
                      @click.stop="notifStore.markAsRead(item.id)"
                    >
                      <q-tooltip>Mark as Read</q-tooltip>
                    </q-btn>

                    <!-- Delete Notification -->
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      size="xs"
                      color="slate-500"
                      class="hover:text-rose-400"
                      @click.stop="notifStore.deleteNotification(item.id)"
                    >
                      <q-tooltip>Dismiss</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer Controls -->
      <div class="q-pa-sm bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div class="row items-center gap-2">
          <q-btn
            dense
            flat
            no-caps
            size="xs"
            color="cyan-4"
            icon="done_all"
            label="Mark All Read"
            :disable="notifStore.unreadCount === 0"
            @click="notifStore.markAllAsRead"
          />
          <q-btn
            dense
            flat
            no-caps
            size="xs"
            color="slate-400"
            icon="clear_all"
            label="Clear Read"
            @click="notifStore.clearRead"
          />
        </div>

        <div class="row items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Synced</span>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationsStore, NotificationItem } from '../stores/notifications';

const router = useRouter();
const notifStore = useNotificationsStore();
const isOpen = ref(false);
const activeTab = ref('all');

const filteredList = computed(() => {
  const list = notifStore.notifications;
  if (activeTab.value === 'unread') {
    return list.filter((n) => !n.isRead);
  }
  if (activeTab.value === 'critical') {
    return list.filter((n) => (n.type || '').toUpperCase() === 'CRITICAL');
  }
  if (activeTab.value === 'operations') {
    return list.filter((n) => (n.type || '').toUpperCase() === 'OPERATIONS');
  }
  if (activeTab.value === 'system') {
    return list.filter((n) => (n.type || '').toUpperCase() === 'SYSTEM');
  }
  return list;
});

function getIconName(type?: string, title = '') {
  const t = (type || '').toUpperCase();
  const text = title.toLowerCase();
  if (text.includes('gps') || text.includes('radar') || text.includes('deviation')) return 'gps_fixed';
  if (text.includes('pod') || text.includes('signature')) return 'draw';
  if (text.includes('invoice') || text.includes('sap') || text.includes('billing')) return 'receipt_long';
  if (text.includes('driver') || text.includes('transit') || text.includes('dispatched')) return 'local_shipping';

  switch (t) {
    case 'CRITICAL':
      return 'warning';
    case 'WARNING':
      return 'report_problem';
    case 'OPERATIONS':
      return 'route';
    case 'SYSTEM':
      return 'tune';
    default:
      return 'notifications';
  }
}

function getTypeBadgeClasses(type?: string) {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'CRITICAL':
      return 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
    case 'WARNING':
      return 'bg-amber-950/80 text-amber-400 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.25)]';
    case 'OPERATIONS':
      return 'bg-cyan-950/80 text-cyan-400 border-cyan-800 shadow-[0_0_8px_rgba(0,242,254,0.25)]';
    case 'SYSTEM':
      return 'bg-indigo-950/80 text-indigo-400 border-indigo-800';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
}

function getTypeTagClasses(type?: string) {
  const t = (type || '').toUpperCase();
  switch (t) {
    case 'CRITICAL':
      return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
    case 'WARNING':
      return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    case 'OPERATIONS':
      return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80';
    case 'SYSTEM':
      return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
}

function getCardBorderAccent(type?: string) {
  const t = (type || '').toUpperCase();
  if (t === 'CRITICAL') return 'border-l-4 border-l-rose-500';
  if (t === 'WARNING') return 'border-l-4 border-l-amber-500';
  if (t === 'OPERATIONS') return 'border-l-4 border-l-cyan-400';
  return 'border-l-2 border-l-slate-700';
}

function formatRelativeTime(dateStr?: string | Date) {
  if (!dateStr) return 'Just now';
  const time = new Date(dateStr).getTime();
  const diffSec = Math.floor((Date.now() - time) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function getDeepLink(title = '', message = '') {
  const text = (title + ' ' + message).toLowerCase();
  if (text.includes('corridor') || text.includes('deviation') || text.includes('radar') || text.includes('gps')) {
    return '/tracking';
  }
  if (text.includes('shp-') || text.includes('shipment') || text.includes('dispatched')) {
    return '/shipments';
  }
  if (text.includes('pod') || text.includes('signed') || text.includes('delivery')) {
    return '/pod';
  }
  if (text.includes('invoice') || text.includes('ledger') || text.includes('sap')) {
    return '/billing';
  }
  if (text.includes('dwell') || text.includes('trk-') || text.includes('fleet')) {
    return '/fleet';
  }
  return null;
}

function getDeepLinkLabel(title = '', message = '') {
  const text = (title + ' ' + message).toLowerCase();
  if (text.includes('deviation') || text.includes('radar')) return 'Track Radar';
  if (text.includes('shp-') || text.includes('shipment')) return 'View Shipment';
  if (text.includes('pod')) return 'Review POD';
  if (text.includes('invoice')) return 'Open Ledger';
  return 'Inspect';
}

function handleItemClick(item: NotificationItem) {
  if (!item.isRead) {
    notifStore.markAsRead(item.id);
  }
  const link = getDeepLink(item.title, item.message);
  if (link) {
    close();
    router.push(link);
  }
}

function navigateDirect(item: NotificationItem) {
  handleItemClick(item);
}

function refreshFeed() {
  notifStore.fetchNotifications(true);
}

async function simulateLiveAlert() {
  const randomAlerts = [
    {
      title: 'Geofence Entry: Chicago Gateway Hub',
      message: 'Vehicle TRK-108 entered inbound gate sensor with 28.5T consignment load.',
      type: 'OPERATIONS',
    },
    {
      title: 'Speed Threshold Advisory (72 MPH)',
      message: 'TRK-102 registered speed advisory on I-80 Western corridor. Weather: Clear.',
      type: 'WARNING',
    },
    {
      title: 'Driver Assignment Dispatched',
      message: 'Marcus Vance confirmed departure on Chicago → Dallas linehaul lane.',
      type: 'OPERATIONS',
    },
  ];

  const pick = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
  const dummy: NotificationItem = {
    id: `local-${Date.now()}`,
    title: pick.title,
    message: pick.message,
    type: pick.type,
    channel: 'IN_APP',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notifStore.notifications.unshift(dummy);
}

function open() {
  isOpen.value = true;
  notifStore.fetchNotifications();
}

function close() {
  isOpen.value = false;
}

onMounted(() => {
  notifStore.startPolling(30000);
});

onUnmounted(() => {
  notifStore.stopPolling();
});

defineExpose({ open, close, unreadCount: notifStore.unreadCount });
</script>

<style scoped>
.notifications-cyber-drawer {
  background: #080e1c !important;
}

.notif-card {
  transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.notif-card:hover {
  transform: translateX(-2px);
  border-color: rgba(0, 242, 254, 0.4);
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 242, 254, 0.4);
}
</style>
