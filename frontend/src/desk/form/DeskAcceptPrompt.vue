<template>
  <div v-if="modelValue" class="desk-accept-overlay" @click.self="reject">
    <div class="desk-accept-box">
      <div class="desk-accept-header">
        <span class="desk-accept-title">Accept?</span>
      </div>
      <div class="desk-accept-actions">
        <button
          ref="yesBtnRef"
          type="button"
          class="desk-btn-yes"
          @click="accept"
        >
          <span class="key-indicator">Y</span>es
        </button>
        <button
          type="button"
          class="desk-btn-no"
          @click="reject"
        >
          <span class="key-indicator">N</span>o
        </button>
      </div>
      <div class="desk-accept-hint">
        Press <strong>[Enter]</strong> or <strong>[Y]</strong> to Save &bull; <strong>[Esc]</strong> or <strong>[N]</strong> to Return
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'accept'): void;
  (e: 'reject'): void;
}>();

const yesBtnRef = ref<HTMLButtonElement | null>(null);

function accept() {
  emit('update:modelValue', false);
  emit('accept');
}

function reject() {
  emit('update:modelValue', false);
  emit('reject');
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.modelValue) return;

  const key = e.key.toLowerCase();
  if (key === 'enter' || key === 'y') {
    e.preventDefault();
    e.stopPropagation();
    accept();
  } else if (key === 'escape' || key === 'n') {
    e.preventDefault();
    e.stopPropagation();
    reject();
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      setTimeout(() => {
        yesBtnRef.value?.focus();
      }, 50);
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown, true);
});
</script>

<style scoped>
.desk-accept-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

.desk-accept-box {
  background: #ffffff;
  border: 1.5px solid #0284c7;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 18px 30px;
  min-width: 300px;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.desk-accept-header {
  margin-bottom: 14px;
}

.desk-accept-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.desk-accept-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.desk-btn-yes,
.desk-btn-no {
  min-width: 90px;
  padding: 8px 18px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: all 0.15s ease;
}

.desk-btn-yes {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
}

.desk-btn-yes:hover,
.desk-btn-yes:focus {
  background: #0369a1;
  box-shadow: 0 0 8px rgba(2, 132, 199, 0.4);
  transform: translateY(-1px);
}

.desk-btn-no {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.desk-btn-no:hover,
.desk-btn-no:focus {
  background: #e2e8f0;
  color: #0f172a;
  border-color: #94a3b8;
}

.key-indicator {
  text-decoration: underline;
  font-weight: 900;
}

.desk-accept-hint {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 6px;
}

.desk-accept-hint strong {
  color: #0284c7;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
