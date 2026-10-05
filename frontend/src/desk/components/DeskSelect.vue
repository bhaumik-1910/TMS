<template>
  <div
    class="desk-select-wrapper"
    :class="{
      'is-focused': isFocused,
      'is-open': isOpen,
      'has-error': !!error,
      'is-disabled': disabled,
    }"
  >
    <div class="desk-select-label-row">
      <label :for="fieldId" class="desk-select-label">
        {{ label }}
        <span v-if="required" class="required-star">*</span>
      </label>
      <span v-if="error" class="desk-select-error-msg">{{ error }}</span>
    </div>

    <div
      :id="fieldId"
      ref="triggerRef"
      tabindex="0"
      class="desk-select-control"
      @click="toggleDropdown"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    >
      <span v-if="displayValue" class="desk-select-value">{{ displayValue }}</span>
      <span v-else class="desk-select-placeholder">{{ placeholder }}</span>

      <span class="desk-select-arrow" :class="{ 'rotate-180': isOpen }">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </div>

    <!-- Dropdown List Overlay -->
    <div v-if="isOpen" class="desk-select-dropdown">
      <div v-if="filterable" class="desk-select-search-box">
        <input
          ref="searchRef"
          v-model="searchQuery"
          type="text"
          placeholder="Type to filter..."
          class="desk-select-search-input"
          @keydown="handleSearchKeyDown"
        />
      </div>

      <div ref="listRef" class="desk-select-options-list">
        <div
          v-for="(opt, idx) in filteredOptions"
          :key="idx"
          class="desk-select-option"
          :class="{
            'is-selected': isSelected(opt),
            'is-highlighted': highlightedIndex === idx,
          }"
          @mousedown.prevent="selectOption(opt)"
          @mouseenter="highlightedIndex = idx"
        >
          {{ getOptionLabel(opt) }}
        </div>
        <div v-if="filteredOptions.length === 0" class="desk-select-empty">
          No matches
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { DeskFormContext } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: any;
    options: any[];
    label?: string;
    required?: boolean;
    placeholder?: string;
    optionValue?: string;
    optionLabel?: string;
    name?: string;
    error?: string;
    disabled?: boolean;
    filterable?: boolean;
  }>(),
  {
    label: '',
    required: false,
    placeholder: '— Select —',
    name: '',
    error: '',
    disabled: false,
    filterable: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'change', val: any): void;
}>();

const triggerRef = ref<HTMLDivElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLDivElement | null>(null);

const isFocused = ref(false);
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(0);
const fieldId = `desk-select-${Math.random().toString(36).substring(2, 9)}`;

const formContext = inject<DeskFormContext | null>('deskFormContext', null);

const isObjectOptions = computed(() => {
  return props.options && props.options.length > 0 && typeof props.options[0] === 'object' && props.options[0] !== null;
});

function getOptionVal(opt: any): any {
  if (!isObjectOptions.value) return opt;
  const key = props.optionValue || 'value';
  return opt[key] !== undefined ? opt[key] : opt;
}

function getOptionLabel(opt: any): string {
  if (!isObjectOptions.value) return String(opt);
  const key = props.optionLabel || 'label';
  return opt[key] !== undefined ? String(opt[key]) : String(opt);
}

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return '';
  }
  if (!isObjectOptions.value) {
    return String(props.modelValue);
  }
  const match = props.options.find((o) => getOptionVal(o) === props.modelValue);
  return match ? getOptionLabel(match) : String(props.modelValue);
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase();
  return props.options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
});

function isSelected(opt: any): boolean {
  return getOptionVal(opt) === props.modelValue;
}

function toggleDropdown() {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown() {
  if (props.disabled) return;
  isOpen.value = true;
  searchQuery.value = '';
  const currentIdx = filteredOptions.value.findIndex((o) => isSelected(o));
  highlightedIndex.value = currentIdx >= 0 ? currentIdx : 0;
  if (props.filterable) {
    nextTick(() => searchRef.value?.focus());
  }
  scrollHighlightedIntoView();
}

function closeDropdown() {
  isOpen.value = false;
  searchQuery.value = '';
}

function selectOption(opt: any) {
  const val = getOptionVal(opt);
  emit('update:modelValue', val);
  emit('change', val);
  closeDropdown();
  // In Tally: Selecting an option immediately advances to the next field!
  nextTick(() => {
    formContext?.nextField(fieldId);
  });
}

function scrollHighlightedIntoView() {
  nextTick(() => {
    if (!listRef.value) return;
    const items = listRef.value.querySelectorAll('.desk-select-option');
    if (items[highlightedIndex.value]) {
      items[highlightedIndex.value].scrollIntoView({ block: 'nearest' });
    }
  });
}

function handleFocus() {
  isFocused.value = true;
  formContext?.setActiveFieldId(fieldId);
}

function handleBlur() {
  setTimeout(() => {
    // Only blur if active element is not inside our dropdown
    if (!triggerRef.value?.contains(document.activeElement) && !listRef.value?.contains(document.activeElement)) {
      isFocused.value = false;
      closeDropdown();
    }
  }, 100);
}

function handleKeyDown(e: KeyboardEvent) {
  if (isOpen.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++;
        scrollHighlightedIntoView();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
        scrollHighlightedIntoView();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      } else {
        closeDropdown();
        formContext?.nextField(fieldId);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeDropdown();
    }
  } else {
    // Dropdown is closed
    if (e.key === 'Enter') {
      e.preventDefault();
      formContext?.nextField(fieldId);
    } else if (e.key === 'ArrowDown' || e.key === ' ' || (e.altKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      openDropdown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      formContext?.prevField(fieldId);
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      formContext?.prevField(fieldId);
    }
  }
}

function handleSearchKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
    handleKeyDown(e);
  }
}

function focus() {
  triggerRef.value?.focus();
}

onMounted(() => {
  if (formContext) {
    formContext.registerField({
      id: fieldId,
      name: props.name || props.label,
      focus,
      el: triggerRef.value,
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
  open: openDropdown,
  close: closeDropdown,
});
</script>

<style scoped>
.desk-select-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  font-family: inherit;
}

.desk-select-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.desk-select-label {
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

.desk-select-error-msg {
  font-size: 0.7rem;
  color: #f43f5e;
  font-weight: 600;
}

.desk-select-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #091322;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  height: 38px;
  padding: 0 10px;
  transition: all 0.15s ease;
  cursor: pointer;
  outline: none;
  user-select: none;
}

.desk-select-wrapper.is-focused .desk-select-control {
  border-color: #00f2fe;
  background: #0c1a30;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.35);
}

.desk-select-value {
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 500;
}

.desk-select-placeholder {
  color: #475569;
  font-size: 0.88rem;
}

.desk-select-arrow {
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: transform 0.15s ease;
}

.desk-select-arrow.rotate-180 {
  transform: rotate(180deg);
}

.desk-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #0d172b;
  border: 1.5px solid #00f2fe;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 12px rgba(0, 242, 254, 0.25);
  border-radius: 6px;
  z-index: 1000;
  overflow: hidden;
  max-height: 220px;
  display: flex;
  flex-direction: column;
}

.desk-select-search-box {
  padding: 6px;
  background: #080e1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.desk-select-search-input {
  width: 100%;
  background: #111d33;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 4px 8px;
  color: #ffffff;
  font-size: 0.8rem;
  outline: none;
}

.desk-select-options-list {
  overflow-y: auto;
  max-height: 180px;
}

.desk-select-option {
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.1s ease;
}

.desk-select-option.is-highlighted {
  background: #0284c7;
  color: #ffffff;
}

.desk-select-option.is-selected {
  font-weight: 700;
  color: #38bdf8;
}

.desk-select-option.is-selected.is-highlighted {
  color: #ffffff;
}

.desk-select-empty {
  padding: 10px;
  text-align: center;
  color: #64748b;
  font-size: 0.8rem;
}
</style>
