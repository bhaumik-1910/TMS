<template>
  <div class="desk-flyout font-sans select-none">
    <div
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      class="desk-flyout-row"
    >
      <button
        type="button"
        class="desk-flyout-btn"
        :class="{
          'is-active': path[0] === index,
          'is-disabled': item.disabled,
        }"
        :disabled="item.disabled"
        @mouseenter="onHover(index)"
        @click="choose(item, index)"
      >
        <span class="desk-flyout-left">
          <q-icon v-if="item.icon" :name="item.icon" size="13px" class="q-mr-xs text-cyan-4" />
          <span class="desk-flyout-label">
            <template
              v-for="(part, partIndex) in splitAccessLabel(item.label, item.letter)"
              :key="partIndex"
            >
              <u v-if="part.mark" class="text-cyan-3 text-weight-bold">{{ part.text }}</u>
              <template v-else>{{ part.text }}</template>
            </template>
          </span>
        </span>

        <span class="desk-flyout-right">
          <kbd v-if="item.letter" class="desk-flyout-kbd">{{ item.letter.toUpperCase() }}</kbd>
          <span v-if="item.children?.length" class="desk-flyout-arrow">▶</span>
        </span>
      </button>

      <!-- Nested Submenu -->
      <DeskMenuFlyout
        v-if="showChildren(item, index)"
        :items="item.children ?? []"
        :path="path.slice(1)"
        class="desk-flyout--nested"
        @path="(next) => emit('path', [index, ...next])"
        @pick="emit('pick', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { splitAccessLabel, type DeskMenuNode } from './deskMenu';

const props = defineProps<{
  items: DeskMenuNode[];
  path: number[];
}>();

const emit = defineEmits<{
  path: [path: number[]];
  pick: [route: string];
}>();

const hovering = ref(-1);

watch(
  () => props.path[0],
  (index) => {
    if (index !== hovering.value) hovering.value = -1;
  },
);

function showChildren(item: DeskMenuNode, index: number): boolean {
  if (!item.children?.length || props.path[0] !== index) return false;
  return props.path.length > 1 || hovering.value === index;
}

function onHover(index: number): void {
  hovering.value = index;
  emit('path', [index]);
}

function choose(item: DeskMenuNode, index: number): void {
  if (item.disabled) return;
  if (item.route) {
    emit('pick', item.route);
    return;
  }
  emit('path', [index]);
}
</script>

<style scoped>
.desk-flyout {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 9999;
  min-width: 240px;
  background: #091322;
  border: 1px solid rgba(0, 242, 254, 0.28);
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
  padding: 4px 0;
}

.desk-flyout--nested {
  top: 0;
  left: 100%;
  margin-left: 2px;
}

.desk-flyout-row {
  position: relative;
}

.desk-flyout-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 28px;
  height: 28px;
  padding: 0 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  color: #cbd5e1;
  transition: all 0.1s ease;
}

.desk-flyout-btn:hover,
.desk-flyout-btn.is-active {
  background: rgba(0, 242, 254, 0.16);
  color: #ffffff;
}

.desk-flyout-btn.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.desk-flyout-left {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.desk-flyout-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.desk-flyout-kbd {
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #0f1c32;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #38bdf8;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 700;
}

.desk-flyout-arrow {
  font-size: 9px;
  color: #64748b;
}

.desk-flyout-btn:hover .desk-flyout-arrow,
.desk-flyout-btn.is-active .desk-flyout-arrow {
  color: #00f2fe;
}
</style>
