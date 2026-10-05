<template>
  <q-drawer
    :model-value="modelValue"
    show-if-above
    :mini="mini"
    :width="280"
    :mini-width="72"
    class="tms-sidebar column justify-between bg-black text-white"
    style="border-right: 1px solid rgba(255, 255, 255, 0.08);"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Navigation Items Container -->
    <div class="col overflow-auto q-py-xs">
      <q-list padding class="q-gutter-y-none">
        <template v-for="group in filteredSidebarGroups" :key="group.id">
          <!-- Group Header (Hidden in mini mode) -->
          <div
            v-if="!mini"
            class="text-caption text-weight-bold q-px-md q-pt-md q-pb-xs text-uppercase text-grey-6"
            style="letter-spacing: 0.08em; font-size: 0.68rem;"
          >
            {{ group.label }}
          </div>
          <q-separator v-else dark class="q-my-sm" />

          <!-- Group Navigation Links -->
          <template v-for="item in group.items" :key="item.id">
            <q-item
              v-if="!item.children || item.children.length === 0"
              clickable
              v-ripple
              :to="item.route"
              class="tms-nav-item"
              :active="$route.path === item.route"
              active-class="tms-nav-item--active"
            >
              <q-item-section avatar style="min-width: 32px;">
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section v-if="!mini">
                <div class="row items-center justify-between full-width no-wrap">
                  <span class="ellipsis q-pr-xs">{{ item.label }}</span>
                  <div class="row items-center q-gutter-x-xs no-wrap flex-shrink-0">
                    <kbd v-if="item.shortcut" class="desk-nav-kbd flex-shrink-0">{{ item.shortcut }}</kbd>
                    <q-badge
                      v-if="item.badge"
                      :color="item.badgeColor || 'primary'"
                      text-color="white"
                      class="font-mono q-px-xs q-py-none rounded-borders flex-shrink-0"
                      style="font-size: 0.65rem;"
                    >
                      {{ item.badge }}
                    </q-badge>
                  </div>
                </div>
              </q-item-section>

              <q-tooltip v-if="mini" anchor="center right" self="center left" :offset="[10, 10]">
                {{ item.label }}
              </q-tooltip>
            </q-item>

            <!-- Nested Children (Collapsible) -->
            <q-expansion-item
              v-else-if="!mini"
              dense
              dense-toggle
              :icon="item.icon"
              :label="item.label"
              class="tms-nav-expansion text-caption"
            >
              <q-item
                v-for="child in item.children"
                :key="child.id"
                clickable
                v-ripple
                :to="child.route"
                class="tms-nav-subitem"
                :active="$route.path === child.route"
                active-class="tms-nav-item--active"
              >
                <q-item-section>{{ child.label }}</q-item-section>
                <q-item-section v-if="child.shortcut || child.badge" side>
                  <kbd v-if="child.shortcut" class="desk-nav-kbd">{{ child.shortcut }}</kbd>
                  <q-badge v-else-if="child.badge" :color="child.badgeColor || 'primary'" size="xs">{{ child.badge }}</q-badge>
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>
        </template>
      </q-list>
    </div>

    <!-- Bottom Mini/Expand Toggle & App Version -->
    <div class="q-pa-sm bg-dark" style="border-top: 1px solid rgba(255, 255, 255, 0.08);">
      <div class="row items-center" :class="mini ? 'justify-center' : 'justify-between'">
        <span v-if="!mini" class="text-caption font-mono text-grey-6" style="font-size: 0.68rem;">
          Ankpal TMS v3.2
        </span>
        <q-btn
          flat
          dense
          round
          :icon="mini ? 'chevron_right' : 'chevron_left'"
          size="sm"
          color="cyan"
          @click="$emit('update:mini', !mini)"
        >
          <q-tooltip>{{ mini ? 'Expand Sidebar' : 'Collapse Sidebar' }}</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { SIDEBAR_STRUCTURE, filterSidebar } from '../../constants/sidebar';

defineProps<{
  modelValue: boolean;
  mini: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:mini', value: boolean): void;
}>();

const authStore = useAuthStore();

const filteredSidebarGroups = computed(() => {
  return filterSidebar(
    SIDEBAR_STRUCTURE,
    (perm: string) => authStore.hasPermission(perm),
    authStore.currentRole,
  );
});
</script>

<style scoped>
.tms-nav-item {
  color: #94a3b8;
  border-radius: 8px;
  margin: 2px 8px;
  min-height: 38px;
  transition: all 0.15s ease;
}
.tms-nav-item:hover {
  background: rgba(0, 242, 254, 0.08);
  color: #00f2fe;
}
.tms-nav-item--active {
  background: linear-gradient(90deg, rgba(0, 242, 254, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%) !important;
  color: #00f2fe !important;
  border-left: 3px solid #00f2fe;
}
.tms-nav-subitem {
  color: #94a3b8;
  margin-left: 20px;
  border-radius: 6px;
  font-size: 0.8rem;
}
.desk-nav-kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: #0f1c2e;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  letter-spacing: 0.05em;
  opacity: 0.85;
  transition: all 0.15s ease;
}
.tms-nav-item:hover .desk-nav-kbd,
.tms-nav-item--active .desk-nav-kbd {
  border-color: #00f2fe;
  color: #00f2fe;
  box-shadow: 0 0 6px rgba(0, 242, 254, 0.4);
  opacity: 1;
}
</style>
