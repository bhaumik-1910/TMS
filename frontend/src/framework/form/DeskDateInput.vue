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
      input-class="font-mono font-bold text-white text-sm"
      @update:model-value="onInput"
    >
      <template #append>
        <q-icon
          name="calendar_today"
          size="16px"
          class="desk-date-icon cursor-pointer text-white hover:text-cyan-400 transition-colors"
          @click="openPicker"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
  color: #00f2fe !important;
  filter: drop-shadow(0 0 5px rgba(0, 242, 254, 0.8));
  transform: scale(1.1);
}
</style>
