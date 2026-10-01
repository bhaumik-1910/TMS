<template>
  <div class="desk-menubar row items-center no-wrap" ref="menuBarRef">
    <div
      v-for="(section, sIdx) in sections"
      :key="section.id"
      class="desk-menu-item-wrapper"
    >
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        class="desk-menubar-btn q-px-sm"
        :class="{ 'desk-menubar-btn-active': activeMenuIndex === sIdx }"
        @click="toggleMenu(sIdx)"
      >
        <span v-html="formatMnemonic(section.label, section.mnemonic)"></span>

        <!-- Dropdown Menu -->
        <q-menu
          v-model="menuStates[sIdx]"
          no-parent-event
          transition-show="jump-down"
          transition-hide="jump-up"
          class="desk-menu-popup"
        >
          <q-list dense class="desk-menu-list">
            <template v-for="item in section.items" :key="item.id">
              <q-separator v-if="item.divider" class="q-my-xs" />
              <q-item
                v-else
                clickable
                v-close-popup
                :disable="item.disabled"
                class="desk-menu-list-item items-center"
                @click="onItemClick(item)"
              >
                <q-item-section avatar v-if="item.icon" class="min-width-auto q-pr-sm">
                  <q-icon :name="item.icon" size="14px" />
                </q-item-section>

                <q-item-section>
                  <span v-html="formatMnemonic(item.label, item.mnemonic)"></span>
                </q-item-section>

                <q-item-section side v-if="item.shortcut">
                  <span class="desk-menu-shortcut">{{ item.shortcut }}</span>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { DeskMenuSection, DeskMenuItem } from './deskMenu';

const props = defineProps<{
  sections: DeskMenuSection[];
}>();

const router = useRouter();
const menuBarRef = ref<HTMLElement | null>(null);
const activeMenuIndex = ref<number | null>(null);
const menuStates = ref<Record<number, boolean>>({});

function formatMnemonic(label: string, mnemonic?: string): string {
  if (!mnemonic) return label;
  const idx = label.toLowerCase().indexOf(mnemonic.toLowerCase());
  if (idx === -1) return label;
  return `${label.slice(0, idx)}<u>${label[idx]}</u>${label.slice(idx + 1)}`;
}

function toggleMenu(idx: number) {
  if (menuStates.value[idx]) {
    menuStates.value[idx] = false;
    activeMenuIndex.value = null;
  } else {
    // Close all others
    Object.keys(menuStates.value).forEach((k) => {
      menuStates.value[Number(k)] = false;
    });
    menuStates.value[idx] = true;
    activeMenuIndex.value = idx;
  }
}

function onItemClick(item: DeskMenuItem) {
  if (item.disabled) return;
  if (item.action) {
    item.action();
  } else if (item.to) {
    router.push(item.to);
  }
}

function handleGlobalAltKeys(event: KeyboardEvent) {
  if (!event.altKey || event.ctrlKey || event.metaKey) return;

  const key = event.key.toLowerCase();
  for (let i = 0; i < props.sections.length; i++) {
    const sec = props.sections[i];
    if (sec.mnemonic && sec.mnemonic.toLowerCase() === key) {
      event.preventDefault();
      toggleMenu(i);
      return;
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalAltKeys);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalAltKeys);
});
</script>

<style scoped>
.desk-menubar {
  background: #070c18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 8px;
  height: 28px;
  user-select: none;
}

.desk-menubar-btn {
  height: 22px;
  min-height: 22px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  color: #94a3b8;
}

.desk-menubar-btn:hover,
.desk-menubar-btn-active {
  background-color: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
}

:deep(.desk-menu-popup) {
  background: #0d1527 !important;
  color: #f1f5f9 !important;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
  min-width: 220px;
}

:deep(.desk-menu-list) {
  padding: 4px 0;
  background: #0d1527;
}

:deep(.desk-menu-list-item) {
  min-height: 28px;
  height: 28px;
  font-size: 12px;
  padding: 2px 12px;
  color: #e2e8f0;
}

:deep(.desk-menu-list-item:hover) {
  background: rgba(0, 242, 254, 0.1) !important;
  color: #00f2fe !important;
}

:deep(.desk-menu-shortcut) {
  font-size: 10px;
  color: #94a3b8;
  font-family: var(--desk-font-mono, monospace);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.min-width-auto {
  min-width: auto;
}
</style>
