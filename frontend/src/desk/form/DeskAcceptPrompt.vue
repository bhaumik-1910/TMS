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
  background: rgba(3, 7, 18, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

.desk-accept-box {
  background: #0d172b;
  border: 2px solid #00f2fe;
  box-shadow: 0 10px 30px rgba(0, 242, 254, 0.25), 0 0 20px rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px 28px;
  min-width: 280px;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.desk-accept-header {
  margin-bottom: 14px;
}

.desk-accept-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.05em;
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
  background: #00f2fe;
  color: #070c18;
  border: 1px solid #38bdf8;
}

.desk-btn-yes:hover,
.desk-btn-yes:focus {
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
  transform: translateY(-1px);
}

.desk-btn-no {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #475569;
}

.desk-btn-no:hover,
.desk-btn-no:focus {
  background: #334155;
  color: #ffffff;
  border-color: #94a3b8;
}

.key-indicator {
  text-decoration: underline;
  font-weight: 900;
}

.desk-accept-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 6px;
}

.desk-accept-hint strong {
  color: #38bdf8;
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
