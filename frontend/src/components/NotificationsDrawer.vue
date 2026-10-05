<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    behavior="mobile"
    :width="490"
    class="notifications-cyber-drawer text-white shadow-24"
    style="max-width: 96vw; background: #060b17 !important; border-left: 1px solid rgba(0, 242, 254, 0.28); box-shadow: -12px 0 40px rgba(0, 0, 0, 0.85);"
  >
    <div class="column full-height" style="overflow-x: hidden;">
      <!-- Drawer Header -->
      <div class="notif-drawer-header">
        <div class="row items-center q-gutter-x-sm no-wrap">
          <div class="notif-header-icon-box flex-shrink-0">
            <q-icon name="notifications_active" size="18px" class="text-cyan-300" />
          </div>
          <div class="min-w-0">
            <div class="row items-center gap-2 no-wrap">
              <span class="text-sm font-bold text-white tracking-wide truncate">Live Notification Feed</span>
              <span
                v-if="notifStore.unreadCount > 0"
                class="unread-pill-counter flex-shrink-0"
              >
                {{ notifStore.unreadCount }} NEW
              </span>
            </div>
            <div class="text-[10px] font-mono text-slate-400 truncate">Real-time telematics & operational alerts</div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-xs flex-shrink-0">
          <!-- Quick Mark All Read -->
          <button
            v-if="notifStore.unreadCount > 0"
            type="button"
            class="header-quick-action-btn flex-shrink-0"
            title="Mark all notifications as read"
            @click="notifStore.markAllAsRead"
          >
            <q-icon name="done_all" size="13px" class="q-mr-xs text-cyan-300" />
            <span>Read All</span>
          </button>

          <!-- Refresh Feed -->
          <button
            type="button"
            class="header-icon-btn flex-shrink-0"
            title="Refresh Live Notifications"
            :disabled="notifStore.isRefreshing"
            @click="refreshFeed"
          >
            <q-spinner v-if="notifStore.isRefreshing" size="14px" color="primary" />
            <q-icon v-else name="refresh" size="16px" class="text-sky-700" />
          </button>

          <!-- Close Drawer -->
          <button
            type="button"
            class="header-icon-btn flex-shrink-0"
            title="Close"
            @click="close"
          >
            <q-icon name="close" size="16px" class="text-slate-400" />
          </button>
        </div>
      </div>

      <!-- Quick Category Filter Bar with Inline Counts -->
      <div class="notif-filter-bar">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          class="notif-pill-btn"
          :class="{ 'notif-pill-btn--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="pill-title">{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            class="pill-count"
            :class="tab.badgeClass"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Notifications Scroll List -->
      <div class="col overflow-y-auto overflow-x-hidden p-3 custom-scroll relative-position">
        <!-- Inner Loading Indicator -->
        <AppLoadingOverlay
          :showing="notifStore.loading"
          title="Syncing Live Events..."
          subtitle="Connecting to real-time notification socket"
          spinner-size="40px"
        />

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
        <div v-else class="space-y-2.5 w-full">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="notif-card p-3 rounded-lg border transition-all cursor-pointer relative group"
            :class="[
              !item.isRead ? 'notif-card-unread' : 'notif-card-read',
              getCardBorderAccent(item.type)
            ]"
            @click="handleItemClick(item)"
          >
            <div class="row items-start no-wrap gap-2.5">
              <!-- Type Icon Avatar -->
              <div
                class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-sm"
                :class="getTypeBadgeClasses(item.type)"
              >
                <q-icon :name="getIconName(item.type, item.title)" size="16px" />
              </div>

              <!-- Content Body -->
              <div class="col min-w-0" style="overflow: hidden;">
                <!-- Title & Relative Time Row -->
                <div class="row items-center justify-between no-wrap gap-2">
                  <div class="row items-center gap-1.5 min-w-0 col">
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
                  <span class="text-[10px] font-mono text-slate-400 flex-shrink-0 whitespace-nowrap pl-1">
                    {{ formatRelativeTime(item.createdAt) }}
                  </span>
                </div>

                <!-- Message Snippet -->
                <div class="text-[11.5px] text-slate-300 mt-1 leading-relaxed font-sans line-clamp-2 break-words">
                  {{ item.message }}
                </div>

                <!-- Footer Quick Actions & Badges -->
                <div class="row items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono gap-1 no-wrap">
                  <span
                    class="px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-bold border flex-shrink-0"
                    :class="getTypeTagClasses(item.type)"
                  >
                    {{ item.type || 'INFO' }}
                  </span>

                  <div class="row items-center gap-1 flex-shrink-0">
                    <!-- Quick Navigate Link -->
                    <span
                      v-if="getDeepLink(item.title, item.message)"
                      class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold transition-colors q-mr-xs"
                      @click.stop="navigateDirect(item)"
                    >
                      <span>{{ getDeepLinkLabel(item.title, item.message) }}</span>
                      <q-icon name="arrow_forward" size="10px" />
                    </span>

                    <!-- Mark Single Read -->
                    <button
                      v-if="!item.isRead"
                      type="button"
                      class="icon-action-btn hover:text-cyan-300 hover:bg-cyan-500/10"
                      title="Mark as Read"
                      @click.stop="notifStore.markAsRead(item.id)"
                    >
                      <q-icon name="done" size="13px" />
                    </button>

                    <!-- Delete Notification -->
                    <button
                      type="button"
                      class="icon-action-btn hover:text-rose-400 hover:bg-rose-500/10"
                      title="Dismiss"
                      @click.stop="notifStore.deleteNotification(item.id)"
                    >
                      <q-icon name="close" size="13px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer Controls -->
      <div class="notif-drawer-footer">
        <div class="row items-center q-gutter-x-sm">
          <button
            type="button"
            class="footer-pill-btn flex items-center gap-1"
            :disabled="notifStore.unreadCount === 0"
            @click="notifStore.markAllAsRead"
          >
            <q-icon name="done_all" size="13px" class="text-cyan-300" />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            class="footer-pill-btn flex items-center gap-1"
            @click="notifStore.clearRead"
          >
            <q-icon name="clear_all" size="13px" class="text-slate-400" />
            <span>Clear Read</span>
          </button>
        </div>

        <div class="row items-center gap-1.5 text-[10.5px] font-mono text-emerald-400 flex-shrink-0">
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

const filterTabs = computed(() => [
  {
    key: 'all',
    label: 'All',
    count: notifStore.notifications.length,
    badgeClass: 'pill-count-neutral',
  },
  {
    key: 'unread',
    label: 'Unread',
    count: notifStore.unreadCount,
    badgeClass: 'pill-count-cyan',
  },
  {
    key: 'critical',
    label: 'Critical',
    count: notifStore.criticalCount,
    badgeClass: notifStore.criticalCount > 0 ? 'pill-count-rose' : 'pill-count-neutral',
  },
  {
    key: 'operations',
    label: 'Operations',
    count: notifStore.operationsCount,
    badgeClass: 'pill-count-neutral',
  },
  {
    key: 'system',
    label: 'System',
    count: notifStore.systemCount,
    badgeClass: 'pill-count-neutral',
  },
]);

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
  if (text.includes('pod') || text.includes('signature') || text.includes('epod')) return 'draw';
  if (text.includes('invoice') || text.includes('sap') || text.includes('ledger') || text.includes('billing')) return 'receipt_long';
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
    case 'SUCCESS':
      return 'verified';
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
    case 'SUCCESS':
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
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
    case 'SUCCESS':
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
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
  if (t === 'SUCCESS') return 'border-l-4 border-l-emerald-400';
  if (t === 'SYSTEM') return 'border-l-4 border-l-indigo-400';
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
  if (text.includes('invoice') || text.includes('sap') || text.includes('ledger')) return 'Open Ledger';
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
  background: #060b17 !important;
}

/* Header */
.notif-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(11, 20, 42, 0.95);
  border-bottom: 1px solid rgba(0, 242, 254, 0.18);
  box-sizing: border-box;
}

.notif-header-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-pill-counter {
  padding: 2px 7px;
  border-radius: 9999px;
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.25);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.header-quick-action-btn {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-quick-action-btn:hover {
  background: rgba(0, 242, 254, 0.18);
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.3);
}

.header-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 242, 254, 0.3);
}

/* Modern Cyber Filter Bar */
.notif-filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #070e1e;
  border-bottom: 1px solid rgba(0, 242, 254, 0.15);
  overflow-x: auto;
  scrollbar-width: none;
}

.notif-filter-bar::-webkit-scrollbar {
  display: none;
}

.notif-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-family: monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.notif-pill-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 242, 254, 0.3);
  color: #e2e8f0;
}

.notif-pill-btn--active {
  background: rgba(0, 242, 254, 0.12) !important;
  border-color: #00f2fe !important;
  color: #00f2fe !important;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
  font-weight: 700;
}

.pill-title {
  display: inline-block;
  line-height: 1;
}

.pill-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9999px;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1;
}

.pill-count-neutral {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.notif-pill-btn--active .pill-count-neutral {
  background: rgba(0, 242, 254, 0.25);
  color: #00f2fe;
}

.pill-count-cyan {
  background: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.4);
}

.pill-count-rose {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

/* Notification Cards */
.notif-card {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(12, 21, 44, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.18);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.notif-card-unread {
  background: linear-gradient(135deg, rgba(14, 27, 56, 0.98) 0%, rgba(9, 17, 36, 0.98) 100%);
  border-color: rgba(0, 242, 254, 0.32);
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.08);
}

.notif-card-read {
  opacity: 0.82;
}

.notif-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 242, 254, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  opacity: 1;
}

.icon-action-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

/* Footer */
.notif-drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #040813;
  border-top: 1px solid rgba(0, 242, 254, 0.18);
  box-sizing: border-box;
}

.footer-pill-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 11px;
  font-family: monospace;
  padding: 4px 9px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.footer-pill-btn:hover:not(:disabled) {
  background: rgba(0, 242, 254, 0.1);
  border-color: rgba(0, 242, 254, 0.35);
  color: #00f2fe;
}

.footer-pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(8, 14, 28, 0.6);
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 254, 0.25);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 242, 254, 0.5);
}
</style>
