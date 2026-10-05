<template>
  <div class="desk-date-input">
    <q-input
      ref="inputRef"
      :model-value="modelValue"
      type="date"
      dense
      outlined
      :placeholder="placeholder"
      :readonly="readonly"
      :disable="disable"
      class="font-mono"
      input-class="font-mono font-bold text-slate-900 text-sm"
      @update:model-value="onInput"
      @keydown.capture="handleKeyDown"
    >
      <template #append>
        <q-icon
          name="calendar_today"
          size="16px"
          class="desk-date-icon cursor-pointer text-slate-600 hover:text-sky-600 transition-colors"
          @click="openPicker"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDeskFocus } from '../focus/useDeskFocus';

const { focusNextInput, focusPreviousInput } = useDeskFocus();

const props = withDefaults(
  defineProps<{
    modelValue: string | undefined | null;
    placeholder?: string;
    readonly?: boolean;
    disable?: boolean;
  }>(),
  {
    placeholder: '',
    readonly: false,
    disable: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const inputRef = ref();

function onInput(val: string | number | null) {
  emit('update:modelValue', String(val || ''));
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    const el = inputRef.value?.$el as HTMLElement | undefined;
    const container = (el?.closest('form') ||
      el?.closest('.desk-dialog') ||
      el?.closest('.q-dialog') ||
      el?.closest('.desk-form') ||
      el?.closest('.q-card')) as HTMLElement | null;
    if (container) {
      const advanced = focusNextInput(container);
      if (!advanced) {
        const confirmBtn = container.querySelector<HTMLButtonElement>(
          '.modal-btn-confirm, button[type="submit"], .btn-save, [data-desk-accept]'
        );
        if (confirmBtn) {
          confirmBtn.click();
        } else {
          container.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    } else {
      focusNextInput(document.body);
    }
  } else if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    const el = inputRef.value?.$el as HTMLElement | undefined;
    const container = (el?.closest('form') ||
      el?.closest('.desk-dialog') ||
      el?.closest('.q-dialog') ||
      el?.closest('.desk-form') ||
      el?.closest('.q-card')) as HTMLElement | null;
    if (container) {
      focusPreviousInput(container);
    } else {
      focusPreviousInput(document.body);
    }
  }
}

function openPicker() {
  if (props.readonly || props.disable) return;
  const inputEl = inputRef.value?.$el?.querySelector('input[type="date"]') as HTMLInputElement | null;
  if (inputEl) {
    if (typeof inputEl.showPicker === 'function') {
      try {
        inputEl.showPicker();
      } catch {
        inputEl.focus();
      }
    } else {
      inputEl.focus();
    }
  }
}
</script>

<style scoped>
.desk-date-input {
  position: relative;
  width: 100%;
}

/* Hide native picker indicator when using the custom Quasar #append icon */
.desk-date-input :deep(input[type='date']::-webkit-calendar-picker-indicator) {
  display: none !important;
  -webkit-appearance: none !important;
}

.desk-date-icon {
  opacity: 0.95;
  transition: all 0.15s ease;
}

.desk-date-icon:hover {
  opacity: 1;
  color: #0284c7 !important;
  transform: scale(1.05);
}
</style>
