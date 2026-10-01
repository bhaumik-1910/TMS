<template>
  <q-header class="bg-black text-white" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); height: 60px;">
    <q-toolbar class="q-px-lg full-height row items-center justify-between no-wrap">
      <!-- Left: Menu Toggle + Logo -->
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="cyan"
          size="sm"
          class="q-mr-xs"
          @click="$emit('toggleSidebar')"
        />

        <div class="row items-center q-gutter-x-sm cursor-pointer" @click="$router.push('/dashboard')">
          <div
            class="flex flex-center rounded-borders"
            style="width: 34px; height: 34px; background: linear-gradient(135deg, #00f2fe 0%, #0284c7 100%); border-radius: 8px; box-shadow: 0 0 14px rgba(0, 242, 254, 0.4);"
          >
            <q-icon name="local_shipping" color="dark" size="20px" />
          </div>
          <div>
            <div class="text-subtitle2 text-weight-bold text-white leading-tight font-sans" style="font-size: 1.05rem; letter-spacing: -0.01em;">
              Ankpal
            </div>
            <div class="text-caption font-mono" style="font-size: 0.68rem; margin-top: -2px; color: #00f2fe;">
              Gati Shakti TMS
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Org Switcher, Persona Switcher, Notification, User Avatar -->
      <div class="row items-center q-gutter-x-sm">
        <OrgContextDropdown />

        <PersonaSwitcherDropdown />

        <q-btn
          flat
          round
          dense
          icon="notifications"
          :color="activeUnreadCount > 0 ? 'cyan' : 'grey-5'"
          size="sm"
          class="q-mx-xs relative-position"
          @click="$emit('openNotifications')"
        >
          <q-badge
            v-if="activeUnreadCount > 0"
            color="negative"
            floating
            rounded
            class="font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(244,63,94,0.6)]"
          >
            {{ activeUnreadCount }}
          </q-badge>
        </q-btn>

        <UserAvatarMenu />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OrgContextDropdown from './OrgContextDropdown.vue';
import PersonaSwitcherDropdown from './PersonaSwitcherDropdown.vue';
import UserAvatarMenu from './UserAvatarMenu.vue';
import { useNotificationsStore } from '../../stores/notifications';

const props = defineProps<{
  unreadCount?: number;
}>();

defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'openSearch'): void;
  (e: 'openNotifications'): void;
}>();

const notifStore = useNotificationsStore();
const activeUnreadCount = computed(() => {
  return typeof props.unreadCount === 'number' ? props.unreadCount : notifStore.unreadCount;
});
</script>
