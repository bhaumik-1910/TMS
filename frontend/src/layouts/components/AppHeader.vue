<template>
  <q-header class="bg-white text-slate-800" style="border-bottom: 1px solid #cbd5e1; height: 50px;">
    <q-toolbar class="q-px-md full-height row items-center justify-between no-wrap">
      <!-- Left: Menu Toggle + Logo -->
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="primary"
          size="sm"
          class="q-mr-xs"
          @click="$emit('toggleSidebar')"
        />

        <div class="row items-center q-gutter-x-sm cursor-pointer" @click="$router.push('/dashboard')">
          <div
            class="flex flex-center rounded-borders"
            style="width: 28px; height: 28px; background: #0284c7; border-radius: 6px;"
          >
            <q-icon name="local_shipping" color="white" size="18px" />
          </div>
          <div>
            <div class="text-subtitle2 text-weight-bold text-slate-900 leading-tight font-sans" style="font-size: 0.95rem; letter-spacing: -0.01em;">
              Ankpal
            </div>
            <div class="text-caption font-mono" style="font-size: 0.65rem; margin-top: -2px; color: #0284c7;">
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
          :color="activeUnreadCount > 0 ? 'primary' : 'grey-7'"
          size="sm"
          class="q-mx-xs relative-position"
          @click="$emit('openNotifications')"
        >
          <q-badge
            v-if="activeUnreadCount > 0"
            color="negative"
            floating
            rounded
            class="font-mono text-[10px] font-bold"
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
