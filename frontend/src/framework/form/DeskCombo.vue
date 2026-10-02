<template>
  <q-select
    ref="selectRef"
    v-model="modelValueComputed"
    :options="options"
    :option-value="isObjectOptions ? resolvedOptionValue : undefined"
    :option-label="isObjectOptions ? resolvedOptionLabel : undefined"
    :emit-value="isObjectOptions ? emitValue : false"
    :map-options="isObjectOptions ? mapOptions : false"
    :placeholder="placeholder"
    :display-value="displayLabel"
    :disable="disable"
    :loading="loading"
    dropdown-icon="keyboard_arrow_down"
    dense
    outlined
    behavior="menu"
    no-error-icon
    class="desk-combo text-body2 font-sans"
    popup-content-class="desk-select-menu"
    @update:model-value="onModelUpdate"
    @popup-show="onPopupShow"
    @popup-hide="onPopupHide"
    @keydown.capture="handleKeyDown"
  >
    <template #no-option>
      <q-item dense>
        <q-item-section class="text-grey-5 text-caption">
          No matching records
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useDeskFocus } from '../focus/useDeskFocus';

const props = withDefaults(
  defineProps<{
    modelValue: any;
    options: any[];
    optionValue?: string;
    optionLabel?: string;
    emitValue?: boolean;
    mapOptions?: boolean;
    placeholder?: string;
    disable?: boolean;
    loading?: boolean;
  }>(),
  {
    optionValue: 'id',
    optionLabel: 'name',
    emitValue: true,
    mapOptions: true,
    placeholder: 'Select...',
    disable: false,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
}>();

const selectRef = ref<any>(null);
const isPopupOpen = ref(false);
let valueJustSelected = false;

const { focusNextInput, focusPreviousInput } = useDeskFocus();

const isObjectOptions = computed(() => {
  return props.options && props.options.length > 0 && typeof props.options[0] === 'object' && props.options[0] !== null;
});

const resolvedOptionValue = computed(() => {
  if (props.optionValue && props.optionValue !== 'id') return props.optionValue;
  if (isObjectOptions.value && props.options[0]) {
    if ('value' in props.options[0]) return 'value';
    if ('id' in props.options[0]) return 'id';
  }
  return props.optionValue || 'id';
});

const resolvedOptionLabel = computed(() => {
  if (props.optionLabel && props.optionLabel !== 'name') return props.optionLabel;
  if (isObjectOptions.value && props.options[0]) {
    if ('label' in props.options[0]) return 'label';
    if ('name' in props.options[0]) return 'name';
  }
  return props.optionLabel || 'name';
});

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (val) => {
    valueJustSelected = true;
    emit('update:modelValue', val);
  },
});

const displayLabel = computed(() => {
  if (!isObjectOptions.value) {
    return modelValueComputed.value || props.placeholder;
  }
  const match = props.options.find((opt) => opt && opt[resolvedOptionValue.value] === modelValueComputed.value);
  if (match) {
    return match[resolvedOptionLabel.value];
  }
  return modelValueComputed.value || props.placeholder;
});

function onModelUpdate(val: any) {
  valueJustSelected = true;
  emit('update:modelValue', val);
}

function getInitialTargetIndex(): number {
  if (!props.options || props.options.length === 0) return 0;

  const currentVal = props.modelValue;
  if (currentVal && currentVal !== '— Select —') {
    const found = props.options.findIndex((opt) => {
      const v = isObjectOptions.value ? opt[resolvedOptionValue.value] : opt;
      return v === currentVal;
    });
    if (found >= 0) return found;
  }

  // If first item is placeholder '— Select —' and there are more options, highlight the first real option!
  if (props.options[0] === '— Select —' && props.options.length > 1) {
    return 1;
  }

  return 0;
}

function onPopupShow() {
  isPopupOpen.value = true;
  nextTick(() => {
    const targetIdx = getInitialTargetIndex();
    if (selectRef.value && typeof selectRef.value.setOptionIndex === 'function') {
      selectRef.value.setOptionIndex(targetIdx);
    }

    setTimeout(() => {
      const menuEl = document.querySelector('.desk-select-menu');
      if (menuEl) {
        const items = menuEl.querySelectorAll<HTMLElement>('.q-item');
        if (items[targetIdx]) {
          items.forEach((it) => it.classList.remove('q-manual-focus--is-focused', 'desk-option-active'));
          items[targetIdx].classList.add('q-manual-focus--is-focused', 'desk-option-active');
          items[targetIdx].scrollIntoView({ block: 'nearest' });
        }
      }
    }, 30);
  });
}

function onPopupHide() {
  isPopupOpen.value = false;
  if (valueJustSelected) {
    valueJustSelected = false;
    nextTick(() => {
      setTimeout(() => {
        const form = selectRef.value?.$el?.closest('form') || document.body;
        focusNextInput(form);
      }, 40);
    });
  }
}

function handleKeyDown(e: KeyboardEvent) {
  // Shift + Enter navigates backwards to previous form field
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    if (isPopupOpen.value) {
      selectRef.value?.hidePopup();
    }
    const form = selectRef.value?.$el?.closest('form') || document.body;
    focusPreviousInput(form);
    return;
  }

  if (e.key === 'Enter') {
    if (!isPopupOpen.value) {
      // If dropdown is closed, pressing Enter opens it with 1st value selected!
      e.preventDefault();
      e.stopPropagation();
      selectRef.value?.showPopup();
    } else {
      // Dropdown is open: select current highlighted option and advance!
      let idx = typeof selectRef.value?.getOptionIndex === 'function' ? selectRef.value.getOptionIndex() : -1;
      if (idx < 0) idx = getInitialTargetIndex();
      if (idx >= 0 && props.options && props.options[idx] !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        const selectedOpt = props.options[idx];
        const val = isObjectOptions.value ? (props.optionValue ? selectedOpt[props.optionValue] : selectedOpt.id) : selectedOpt;
        valueJustSelected = true;
        emit('update:modelValue', val);
        selectRef.value?.hidePopup();
      }
    }
  } else if (e.key === 'ArrowUp' && (e.shiftKey || e.altKey)) {
    e.preventDefault();
    e.stopPropagation();
    const form = selectRef.value?.$el?.closest('form') || document.body;
    focusPreviousInput(form);
  } else if ((e.key === 'ArrowDown' || e.key === ' ') && !isPopupOpen.value) {
    // Arrow Down or Space opens the dropdown list
    e.preventDefault();
    selectRef.value?.showPopup();
  }
}
</script>

<style scoped>
.desk-combo :deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  background: #0d172b !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 8px !important;
  padding: 0 10px !important;
  transition: all 0.15s ease;
}

/* Remove Quasar default pseudo borders to completely eliminate double borders */
.desk-combo :deep(.q-field__control:before),
.desk-combo :deep(.q-field__control:after) {
  display: none !important;
  border: none !important;
  content: none !important;
}

.desk-combo :deep(.q-field__control:hover) {
  border-color: rgba(0, 242, 254, 0.4) !important;
}

.desk-combo :deep(.q-field--focused .q-field__control),
.desk-combo :deep(.q-field:focus-within .q-field__control),
.desk-combo :deep(.q-field.q-field--focused .q-field__control) {
  border: 1.5px solid #00f2fe !important;
  border-color: #00f2fe !important;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25) !important;
  outline: none !important;
}

.desk-combo :deep(.q-field__native),
.desk-combo :deep(.q-field__input),
.desk-combo :deep(input) {
  color: #ffffff !important;
  font-size: 0.85rem !important;
  height: 40px !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
  border: none !important;
  padding-left: 0 !important;
}

.desk-combo :deep(input:focus),
.desk-combo :deep(input:focus-visible),
.desk-combo :deep(.q-field__native:focus),
.desk-combo :deep(.q-field__native:focus-visible) {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.desk-combo :deep(.q-field__marginal) {
  height: 40px !important;
}

.desk-combo :deep(.q-field__append .q-icon) {
  color: #ffffff !important;
  font-size: 20px !important;
  transition: transform 0.2s ease !important;
}

:global(.desk-select-menu .q-item.desk-option-active) {
  background: rgba(0, 242, 254, 0.25) !important;
  color: #00f2fe !important;
  font-weight: 700 !important;
}
</style>
