<template>
  <div class="desk-field q-mb-md" :class="{ 'desk-field-error': !!errorMessage }">
    <div v-if="label" class="desk-field-label-row row items-center justify-between q-mb-xs">
      <label class="desk-field-label">
        {{ cleanLabel }}
        <span v-if="required" class="text-cyan-4 text-weight-bold q-ml-xs">*</span>
      </label>
      <kbd v-if="hintKey" class="desk-field-kbd">
        {{ hintKey }}
      </kbd>
    </div>

    <div class="desk-field-control">
      <slot />
    </div>

    <div v-if="errorMessage" class="text-caption text-negative q-mt-xs text-weight-medium font-sans" style="font-size: 0.72rem;">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label?: string;
  required?: boolean;
  hintKey?: string;
  errorMessage?: string;
}>();

// Clean up duplicate asterisks if caller already put '*' in label
const cleanLabel = computed(() => {
  if (!props.label) return '';
  return props.label.replace(/\s*\*+\s*$/, '').trim();
});
</script>

<style scoped>
.desk-field {
  position: relative;
}

.desk-field-label-row {
  margin-bottom: 0.35rem;
}

.desk-field-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #38bdf8;
  margin: 0;
  user-select: none;
  font-family: var(--tms-font-sans, inherit);
}

.desk-field-kbd {
  font-size: 10px;
  font-family: var(--desk-font-mono, monospace);
  color: #00f2fe;
  background: #111a33;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.desk-field-control :deep(.q-field__control) {
  background: #0d172b !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 8px !important;
  min-height: 40px !important;
  height: 40px !important;
  padding: 0 10px !important;
  transition: all 0.15s ease;
}

/* Remove Quasar default pseudo borders to completely prevent double borders */
.desk-field-control :deep(.q-field__control:before),
.desk-field-control :deep(.q-field__control:after) {
  display: none !important;
  border: none !important;
  content: none !important;
}

.desk-field-control :deep(.q-field__control:hover) {
  border-color: rgba(0, 242, 254, 0.4) !important;
}

.desk-field-control :deep(.q-field--focused .q-field__control),
.desk-field-control :deep(.q-field:focus-within .q-field__control),
.desk-field-control :deep(.q-field.q-field--focused .q-field__control) {
  border: 1.5px solid #00f2fe !important;
  border-color: #00f2fe !important;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25) !important;
  outline: none !important;
}

.desk-field-control :deep(.q-field__native),
.desk-field-control :deep(.q-field__input),
.desk-field-control :deep(input) {
  color: #ffffff !important;
  font-size: 0.85rem !important;
  min-height: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
  border: none !important;
  padding-left: 0 !important;
}

.desk-field-control :deep(input:focus),
.desk-field-control :deep(input:focus-visible),
.desk-field-control :deep(.q-field__native:focus),
.desk-field-control :deep(.q-field__native:focus-visible) {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.desk-field-control :deep(input::placeholder) {
  color: #64748b !important;
  font-size: 0.82rem !important;
}

.desk-field-control :deep(.q-field__marginal) {
  height: 40px !important;
}

.desk-field-error :deep(.q-field__control) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3) !important;
}
</style>
