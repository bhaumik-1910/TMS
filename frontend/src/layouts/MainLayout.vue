<template>
  <DeskShell :show-ribbon="false" :show-key-strip="false">
    <q-layout view="hHh lpR fFf" class="tally-application-root">
      <!-- 1. Tally Top Navbar with Dropdown Submenus Underneath -->
      <q-header class="bg-white text-slate-900" style="overflow: visible; z-index: 1000; border-bottom: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
        <DeskMenuBar
          :items="TMS_MENU_TREE"
          :current-path="route.path"
          @go="navigate"
        >
          <template #right>
            <OrgContextDropdown />
            <PersonaSwitcherDropdown />

            <q-btn
              flat
              round
              dense
              icon="notifications"
              :color="unreadCount > 0 ? 'primary' : 'grey-7'"
              size="sm"
              class="q-mx-xs relative-position"
              @click="notificationsDrawerRef?.open()"
            >
              <q-badge
                v-if="unreadCount > 0"
                color="negative"
                floating
                rounded
                class="font-mono text-[10px] font-bold"
              >
                {{ unreadCount }}
              </q-badge>
            </q-btn>

            <UserAvatarMenu />
          </template>
        </DeskMenuBar>
      </q-header>

      <!-- 2. Main Page Container - 100% Full Width Tally Workspace -->
      <q-page-container class="tally-page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </q-page-container>

      <!-- 3. Tally Bottom Footer: Status Bar + Function Key Strip -->
      <q-footer class="bg-transparent" style="z-index: 900;">
        <TmsStatusBar />
        <DeskKeyStrip />
      </q-footer>

      <!-- Global Quick Command Palette (Alt+G / Ctrl+K) -->
      <CommandPalette ref="commandPaletteRef" />

      <!-- Notification Center Drawer -->
      <NotificationsDrawer ref="notificationsDrawerRef" />
    </q-layout>
  </DeskShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import OrgContextDropdown from './components/OrgContextDropdown.vue';
import PersonaSwitcherDropdown from './components/PersonaSwitcherDropdown.vue';
import UserAvatarMenu from './components/UserAvatarMenu.vue';
import CommandPalette from '../components/CommandPalette.vue';
import NotificationsDrawer from '../components/NotificationsDrawer.vue';
import { DeskShell } from '../desk';
import DeskMenuBar from '../desk/menu/DeskMenuBar.vue';
import { TMS_MENU_TREE } from '../desk/menu/tmsMenu';
import TmsStatusBar from '../desk/layout/TmsStatusBar.vue';
import DeskKeyStrip from '../desk/layout/DeskKeyStrip.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notifStore = useNotificationsStore();

const commandPaletteRef = ref<any | null>(null);
const notificationsDrawerRef = ref<any | null>(null);

const unreadCount = computed(() => notifStore.unreadCount);

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await authStore.loadOrganizations();
  }
  notifStore.fetchNotifications(true);
});

function navigate(path: string) {
  void router.push(path);
}
</script>

<style scoped>
.tally-application-root {
  background: #ffffff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  color: #0f172a;
}

.tally-page-container {
  min-height: calc(100vh - 36px - 26px - 33px) !important;
  background: #f8fafc;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
