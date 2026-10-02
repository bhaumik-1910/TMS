<template>
  <div
    class="desk-input-wrapper"
    :class="{
      'is-focused': isFocused,
      'has-error': !!error,
      'is-disabled': disabled,
    }"
  >
    <div class="desk-input-label-row">
      <label :for="fieldId" class="desk-input-label">
        {{ label }}
        <span v-if="required" class="required-star">*</span>
      </label>
      <span v-if="error" class="desk-input-error-msg">{{ error }}</span>
    </div>

    <div class="desk-input-control" @click="focus">
      <span v-if="prefix" class="desk-input-affix prefix">{{ prefix }}</span>
      <input
        :id="fieldId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="desk-native-input"
        :class="{ 'font-mono uppercase': uppercase }"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />
      <span v-if="suffix" class="desk-input-affix suffix">{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import type { DeskFormContext } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;
    label?: string;
    required?: boolean;
    placeholder?: string;
    uppercase?: boolean;
    type?: 'text' | 'number' | 'password';
    prefix?: string;
    suffix?: string;
    name?: string;
    error?: string;
    disabled?: boolean;
  }>(),
  {
    label: '',
    required: false,
    placeholder: '',
    uppercase: false,
    type: 'text',
    prefix: '',
    suffix: '',
    name: '',
    error: '',
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void;
  (e: 'enter'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const fieldId = `desk-input-${Math.random().toString(36).substring(2, 9)}`;

const formContext = inject<DeskFormContext | null>('deskFormContext', null);

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  let val: string | number = target.value;
  if (props.uppercase && typeof val === 'string') {
    val = val.toUpperCase();
    target.value = val;
  }
  emit('update:modelValue', val);
}

function handleFocus() {
  isFocused.value = true;
  formContext?.setActiveFieldId(fieldId);
}

function handleBlur() {
  isFocused.value = false;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    emit('enter');
    formContext?.nextField(fieldId);
  } else if (e.key === 'ArrowUp' && (e.shiftKey || inputRef.value?.selectionStart === 0)) {
    e.preventDefault();
    formContext?.prevField(fieldId);
  } else if (e.key === 'Enter' && e.shiftKey) {
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
  inputEl: inputRef,
});
</script>

<style scoped>
.desk-input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  font-family: inherit;
}

.desk-input-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.desk-input-label {
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

.desk-input-error-msg {
  font-size: 0.7rem;
  color: #f43f5e;
  font-weight: 600;
}

.desk-input-control {
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

.desk-input-wrapper.is-focused .desk-input-control {
  border-color: #00f2fe;
  background: #0c1a30;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.35);
}

.desk-input-wrapper.has-error .desk-input-control {
  border-color: #f43f5e;
}

.desk-native-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.88rem;
  width: 100%;
  font-family: inherit;
}

.desk-native-input::placeholder {
  color: #475569;
}

.desk-input-affix {
  font-size: 0.78rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #64748b;
  font-weight: 600;
}

.desk-input-affix.prefix {
  margin-right: 6px;
}

.desk-input-affix.suffix {
  margin-left: 6px;
}
</style>
