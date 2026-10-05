<template>
  <div
    ref="root"
    class="desk-menu-bar font-sans select-none"
  >
    <!-- Left: Tally Logo Badge -->
    <div
      class="tally-logo-badge flex flex-center cursor-pointer"
      @click="navigate('/dashboard')"
      title="Gateway of Tally (Alt+G)"
    >
      <span>T</span>
    </div>

    <!-- Center: Horizontal Top Menu Items with Dropdowns Underneath -->
    <div class="desk-menu-items row items-center no-wrap">
      <template v-for="item in items" :key="item.label">
        <!-- Single Direct Route Item (e.g. Dashboard) -->
        <q-btn
          v-if="!item.children || item.children.length === 0"
          flat
          no-caps
          dense
          class="desk-top-btn"
          :class="{ 'is-active': isCurrent(item) }"
          @click="navigate(item.route)"
        >
          <span class="desk-btn-content">
            <template
              v-for="(part, partIndex) in splitAccessLabel(item.label, item.letter)"
              :key="partIndex"
            >
              <u v-if="part.mark" class="text-primary text-weight-bold">{{ part.text }}</u>
              <template v-else>{{ part.text }}</template>
            </template>
          </span>
        </q-btn>

        <!-- Dropdown Menu Item (Masters, Operations, Fleet Expenses, Finance, Insights, Admin) -->
        <q-btn
          v-else
          flat
          no-caps
          dense
          class="desk-top-btn desk-top-dropdown-btn"
          :class="{ 'is-active': isCurrent(item) }"
        >
          <span class="desk-btn-content">
            <template
              v-for="(part, partIndex) in splitAccessLabel(item.label, item.letter)"
              :key="partIndex"
            >
              <u v-if="part.mark" class="text-primary text-weight-bold">{{ part.text }}</u>
              <template v-else>{{ part.text }}</template>
            </template>
          </span>

          <q-icon name="arrow_drop_down" size="16px" class="q-ml-xs text-slate-500" />

          <!-- High-Contrast Clean White Dropdown Menu -->
          <q-menu
            anchor="bottom start"
            self="top start"
            :offset="[0, 2]"
            auto-close
            class="tally-prime-dropdown-menu"
          >
            <q-list dense class="tally-menu-dropdown-list">
              <q-item
                v-for="sub in item.children"
                :key="sub.label"
                clickable
                v-close-popup
                :to="sub.route"
                :disable="sub.disabled"
                class="tally-dropdown-item"
              >
                <q-item-section avatar v-if="sub.icon" class="tally-sub-icon">
                  <q-icon :name="sub.icon" size="16px" color="primary" />
                </q-item-section>

                <q-item-section class="tally-sub-label">
                  <span>
                    <template
                      v-for="(sp, sIdx) in splitAccessLabel(sub.label, sub.letter)"
                      :key="sIdx"
                    >
                      <u v-if="sp.mark" class="text-primary text-weight-bold">{{ sp.text }}</u>
                      <template v-else>{{ sp.text }}</template>
                    </template>
                  </span>
                </q-item-section>

                <q-item-section side v-if="sub.letter">
                  <kbd class="tally-sub-kbd">{{ sub.letter.toUpperCase() }}</kbd>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </div>

    <!-- Spacer -->
    <div class="spacer" />

    <!-- Right Side Actions & Tools -->
    <div class="row items-center q-gutter-x-xs no-wrap desk-menu-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { splitAccessLabel, type DeskMenuNode } from './deskMenu';

const props = withDefaults(
  defineProps<{
    items: DeskMenuNode[];
    armed?: boolean;
    currentPath?: string;
  }>(),
  {
    armed: false,
    currentPath: '',
  },
);

const emit = defineEmits<{
  go: [path: string];
}>();

const router = useRouter();
const root = ref<HTMLElement | null>(null);

function isCurrent(item: DeskMenuNode | undefined): boolean {
  if (!item) return false;
  if (item.route && (props.currentPath === item.route || props.currentPath.startsWith(`${item.route}/`))) {
    return true;
  }
  return item.children?.some((c) => isCurrent(c)) ?? false;
}

function navigate(path?: string) {
  if (!path) return;
  emit('go', path);
  void router.push(path);
}

function handleGlobalKey(e: KeyboardEvent) {
  // Alt + single letter accelerator
  if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.length === 1) {
    const letter = e.key.toLowerCase();
    const idx = props.items.findIndex((item) => item.letter?.toLowerCase() === letter);
    if (idx >= 0 && root.value) {
      e.preventDefault();
      e.stopPropagation();
      const btns = root.value.querySelectorAll<HTMLElement>('.desk-top-btn');
      if (btns[idx]) {
        btns[idx].click();
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKey);
});
</script>

<style scoped>
.desk-menu-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  background: #ffffff !important;
  border-bottom: 1px solid #cbd5e1;
  padding: 0 10px;
  color: #0f172a;
  position: relative;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.tally-logo-badge {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 900;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.35);
  margin-right: 8px;
}

.desk-menu-items {
  display: flex;
  align-items: center;
  gap: 2px;
}

.desk-top-btn {
  display: inline-flex;
  align-items: center;
  height: 28px;
  min-height: 28px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
  padding: 0 8px;
  border-radius: 4px;
  white-space: nowrap;
  transition: all 0.12s ease;
  font-family: inherit;
}

.desk-btn-content {
  display: inline-flex;
  align-items: center;
}

.desk-top-btn u {
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 700;
  color: #0284c7;
}

.desk-top-btn:hover,
.desk-top-btn.is-active {
  background: #e0f2fe !important;
  color: #0284c7 !important;
  border-color: #bae6fd !important;
}

.spacer {
  flex: 1;
}

.desk-menu-right {
  display: flex;
  align-items: center;
}
</style>

<style>
/* Global Popups Styling for Tally Prime Dropdown in Pure White Theme */
.tally-prime-dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
  min-width: 260px !important;
  padding: 4px 0 !important;
  overflow: hidden !important;
}

.tally-menu-dropdown-list {
  padding: 2px 0 !important;
  background: #ffffff !important;
}

.tally-dropdown-item {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 12px !important;
  font-size: 0.8125rem !important;
  color: #0f172a !important;
  font-family: inherit !important;
  transition: all 0.1s ease !important;
}

.tally-dropdown-item:hover,
.tally-dropdown-item.q-router-link--active,
.tally-dropdown-item.q-manual-focus--is-focused {
  background: #e0f2fe !important;
  color: #0284c7 !important;
}

.tally-sub-icon {
  min-width: 24px !important;
  padding-right: 8px !important;
}

.tally-sub-icon .q-icon {
  color: #0284c7 !important;
}

.tally-sub-label {
  font-weight: 500 !important;
  color: inherit !important;
}

.tally-sub-label u {
  text-decoration: underline !important;
  text-underline-offset: 2px !important;
  font-weight: 700 !important;
  color: #0284c7 !important;
}

.tally-sub-kbd {
  font-size: 10px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #0284c7 !important;
  padding: 1px 5px !important;
  border-radius: 3px !important;
  font-weight: 700 !important;
}
</style>
