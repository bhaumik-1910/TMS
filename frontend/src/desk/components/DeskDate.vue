<template>
  <div
    class="desk-date-wrapper"
    :class="{
      'is-focused': isFocused,
      'has-error': !!error,
      'is-disabled': disabled,
    }"
  >
    <div class="desk-date-label-row">
      <label :for="fieldId" class="desk-date-label">
        {{ label }}
        <span v-if="required" class="required-star">*</span>
      </label>
      <span v-if="error" class="desk-date-error-msg">{{ error }}</span>
    </div>

    <div class="desk-date-control" @click="focus">
      <input
        :id="fieldId"
        ref="inputRef"
        :value="modelValue"
        type="date"
        :disabled="disabled"
        class="desk-native-date-input font-mono"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />
      <button
        type="button"
        tabindex="-1"
        class="desk-date-btn"
        title="Open Calendar (F2)"
        @click.stop="openPicker"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import type { DeskFormContext } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    label?: string;
    required?: boolean;
    name?: string;
    error?: string;
    disabled?: boolean;
  }>(),
  {
    label: '',
    required: false,
    name: '',
    error: '',
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'enter'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const fieldId = `desk-date-${Math.random().toString(36).substring(2, 9)}`;

const formContext = inject<DeskFormContext | null>('deskFormContext', null);

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleFocus() {
  isFocused.value = true;
  formContext?.setActiveFieldId(fieldId);
}

function handleBlur() {
  isFocused.value = false;
}

function openPicker() {
  if (props.disabled) return;
  if (inputRef.value) {
    if (typeof inputRef.value.showPicker === 'function') {
      try {
        inputRef.value.showPicker();
      } catch {
        inputRef.value.focus();
      }
    } else {
      inputRef.value.focus();
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'F2') {
    e.preventDefault();
    openPicker();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    emit('enter');
    formContext?.nextField(fieldId);
  } else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
    e.preventDefault();
    formContext?.prevField(fieldId);
  }
}

function focus() {
  inputRef.value?.focus();
}

onMounted(() => {
  if (formContext) {
    formContext.registerField({
      id: fieldId,
      name: props.name || props.label,
      focus,
      el: inputRef.value,
    });
  }
});

onBeforeUnmount(() => {
  if (formContext) {
    formContext.unregisterField(fieldId);
  }
});

defineExpose({
  focus,
  openPicker,
});
</script>

<style scoped>
.desk-date-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  font-family: inherit;
}

.desk-date-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.desk-date-label {
  font-size: 0.73rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
  text-transform: uppercase;
}

.required-star {
  color: #f43f5e;
  margin-left: 2px;
}

.desk-date-error-msg {
  font-size: 0.7rem;
  color: #f43f5e;
  font-weight: 600;
}

.desk-date-control {
  display: flex;
  align-items: center;
  background: #091322;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  height: 38px;
  padding: 0 10px;
  transition: all 0.15s ease;
  cursor: text;
}

.desk-date-wrapper.is-focused .desk-date-control {
  border-color: #00f2fe;
  background: #0c1a30;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.35);
}

.desk-native-date-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.88rem;
  width: 100%;
  color-scheme: dark;
}

.desk-native-date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  display: none;
}

.desk-date-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.15s ease;
}

.desk-date-btn:hover {
  color: #00f2fe;
}
</style>
