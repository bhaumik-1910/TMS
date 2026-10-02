<template>
  <div v-if="modelValue" class="desk-modal-backdrop" @click.self="handleBackdropClick">
    <div
      class="desk-modal-panel"
      :style="{ maxWidth: width || '620px' }"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Header -->
      <div class="desk-modal-header">
        <div class="desk-modal-title-wrap">
          <span class="desk-modal-indicator"></span>
          <h2 class="desk-modal-title">{{ title }}</h2>
          <span v-if="subtitle" class="desk-modal-subtitle">{{ subtitle }}</span>
        </div>
        <button
          type="button"
          class="desk-modal-close-btn"
          title="Close (Esc)"
          @click="close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Modal Body (Scrollable form content) -->
      <div class="desk-modal-body">
        <slot />
      </div>

      <!-- Modal Footer Keyboard Shortcuts Strip -->
      <div class="desk-modal-footer">
        <slot name="footer">
          <DeskKeyStrip />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DeskKeyStrip from './DeskKeyStrip.vue';

withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    subtitle?: string;
    width?: string;
    persistent?: boolean;
  }>(),
  {
    subtitle: '',
    width: '620px',
    persistent: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'close'): void;
}>();

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick() {
  close();
}
</script>

<style scoped>
.desk-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 20, 0.75);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.15s ease-out;
}

.desk-modal-panel {
  width: 100%;
  height: 100vh;
  background: #0a1120;
  border-left: 1px solid rgba(0, 242, 254, 0.25);
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.8), -1px 0 0 rgba(0, 242, 254, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.desk-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #070d18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.desk-modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desk-modal-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
}

.desk-modal-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-transform: uppercase;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.desk-modal-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.desk-modal-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.desk-modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.desk-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
}

.desk-modal-footer {
  margin-top: auto;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
