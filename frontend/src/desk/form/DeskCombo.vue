<template>
  <q-select
    ref="selectRef"
    v-model="modelValueComputed"
    :options="filteredOptions"
    :option-value="(opt: any) => (isObjectOptions && opt ? (opt[resolvedOptionValue] ?? opt.value ?? opt.id) : opt)"
    :option-label="(opt: any) => (isObjectOptions && opt ? (opt[resolvedOptionLabel] ?? opt.label ?? opt.name) : opt)"
    :emit-value="isObjectOptions ? emitValue : false"
    :map-options="isObjectOptions ? mapOptions : false"
    :placeholder="placeholder"
    :display-value="displayLabel"
    :disable="disable"
    :loading="loading"
    use-input
    fill-input
    hide-selected
    input-debounce="0"
    dropdown-icon="keyboard_arrow_down"
    dense
    outlined
    behavior="menu"
    no-error-icon
    tabindex="0"
    class="desk-combo text-body2 font-sans"
    popup-content-class="desk-select-menu"
    @filter="onFilter"
    @input-value="onInputValue"
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
import { ref, computed, nextTick, watch } from 'vue';
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
const filterText = ref('');
let shouldAdvanceOnClose = false;

const { focusNextInput, focusPreviousInput } = useDeskFocus();

const isObjectOptions = computed(() => {
  return props.options && props.options.length > 0 && typeof props.options[0] === 'object' && props.options[0] !== null;
});

const resolvedOptionValue = computed(() => {
  if (props.optionValue && props.optionValue !== 'id') return props.optionValue;
  if (isObjectOptions.value && props.options && props.options[0]) {
    if ('value' in props.options[0]) return 'value';
    if ('id' in props.options[0]) return 'id';
  }
  return props.optionValue || 'id';
});

const resolvedOptionLabel = computed(() => {
  if (props.optionLabel && props.optionLabel !== 'name') return props.optionLabel;
  if (isObjectOptions.value && props.options && props.options[0]) {
    if ('label' in props.options[0]) return 'label';
    if ('name' in props.options[0]) return 'name';
  }
  return props.optionLabel || 'name';
});

function getOptionValue(opt: any) {
  if (!opt) return opt;
  if (!isObjectOptions.value) return opt;
  return opt[resolvedOptionValue.value] !== undefined
    ? opt[resolvedOptionValue.value]
    : (opt.value ?? opt.id ?? opt);
}

function getOptionLabel(opt: any): string {
  if (!opt) return '';
  if (!isObjectOptions.value) return String(opt);
  return opt[resolvedOptionLabel.value] !== undefined
    ? String(opt[resolvedOptionLabel.value])
    : String(opt.label ?? opt.name ?? opt);
}

const filteredOptions = computed(() => {
  if (!filterText.value) return props.options || [];
  const needle = filterText.value.toLowerCase().trim();
  return (props.options || []).filter((opt) => {
    const lbl = getOptionLabel(opt).toLowerCase();
    return lbl.includes(needle);
  });
});

function onFilter(val: string, update: (fn: () => void) => void) {
  update(() => {
    filterText.value = val;
  });
}

function onInputValue(val: string) {
  filterText.value = val;
}

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
  },
});

const displayLabel = computed(() => {
  if (!isObjectOptions.value) {
    return modelValueComputed.value || props.placeholder;
  }
  const match = props.options.find((opt) => opt && getOptionValue(opt) === modelValueComputed.value);
  if (match) {
    return getOptionLabel(match);
  }
  return modelValueComputed.value || props.placeholder;
});

function onModelUpdate(val: any) {
  emit('update:modelValue', val);
}

function getInitialTargetIndex(): number {
  const currentList = filteredOptions.value;
  if (!currentList || currentList.length === 0) return 0;

  const currentVal = props.modelValue;
  if (currentVal !== undefined && currentVal !== null && currentVal !== '— Select —') {
    const found = currentList.findIndex((opt) => getOptionValue(opt) === currentVal);
    if (found >= 0) return found;
  }

  // If first item is placeholder '— Select —' and there are more options, highlight the first real option!
  if (currentList[0] === '— Select —' && currentList.length > 1) {
    return 1;
  }

  return 0;
}

function highlightPopupItem(targetIdx: number) {
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
  }, 25);
}

function onPopupShow() {
  isPopupOpen.value = true;
  nextTick(() => {
    const targetIdx = getInitialTargetIndex();
    if (selectRef.value && typeof selectRef.value.setOptionIndex === 'function') {
      selectRef.value.setOptionIndex(targetIdx);
    }
    highlightPopupItem(targetIdx);
  });
}

function advanceFocus(direction: 1 | -1 = 1) {
  const rootEl = selectRef.value?.$el as HTMLElement | undefined;
  if (!rootEl) return;

  // 1. If inside a form, dialog, or drawer
  const container = (rootEl.closest('form') ||
    rootEl.closest('.desk-dialog') ||
    rootEl.closest('.q-dialog') ||
    rootEl.closest('.desk-form') ||
    rootEl.closest('.q-card')) as HTMLElement | null;

  if (container) {
    if (direction === 1) {
      const advanced = focusNextInput(container);
      if (!advanced) {
        // Last field: trigger accept / confirm / save!
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
      focusPreviousInput(container);
    }
    return;
  }

  // 2. If inside table toolbar (.desk-grid-toolbar)
  const toolbar = rootEl.closest('.desk-grid-toolbar') as HTMLElement | null;
  if (toolbar) {
    const focusableList: HTMLElement[] = [];

    // Search input first
    const searchInput = toolbar.querySelector<HTMLElement>('.desk-grid-search input');
    if (searchInput && searchInput.offsetParent !== null) focusableList.push(searchInput);

    // Each DeskCombo / filter combo in DOM order
    const comboRoots = Array.from(toolbar.querySelectorAll<HTMLElement>('.desk-filter-select, .desk-combo'));
    const seen = new Set<HTMLElement>();
    for (const combo of comboRoots) {
      const native =
        combo.querySelector<HTMLElement>('.q-field__native[tabindex="0"]') ||
        combo.querySelector<HTMLElement>('.q-field__control[tabindex="0"]') ||
        combo.querySelector<HTMLElement>('[tabindex="0"]') ||
        (combo.getAttribute('tabindex') !== null ? combo : null);
      if (native && native.offsetParent !== null && !seen.has(native)) {
        seen.add(native);
        focusableList.push(native);
      }
    }

    const activeEl = document.activeElement as HTMLElement | null;
    const currentIdx = focusableList.findIndex(
      (el) => el === activeEl || el.contains(activeEl) || (activeEl && activeEl.contains(el))
    );

    if (direction === 1) {
      if (currentIdx >= 0 && currentIdx < focusableList.length - 1) {
        focusableList[currentIdx + 1].focus();
        return;
      } else {
        const grid = toolbar.closest('.desk-grid') as HTMLElement | null;
        if (grid) { grid.focus(); return; }
      }
    } else {
      if (currentIdx > 0) {
        focusableList[currentIdx - 1].focus();
        return;
      }
    }
    return;
  }

  // Fallback
  if (direction === 1) focusNextInput(document.body);
  else focusPreviousInput(document.body);
}

function onPopupHide() {
  isPopupOpen.value = false;
  filterText.value = '';
  if (shouldAdvanceOnClose) {
    shouldAdvanceOnClose = false;
    nextTick(() => {
      setTimeout(() => {
        advanceFocus(1);
      }, 50);
    });
  }
}

function handleKeyDown(e: KeyboardEvent) {
  // 1. Shift + Enter -> go backwards immediately
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    if (isPopupOpen.value) {
      selectRef.value?.hidePopup();
    }
    advanceFocus(-1);
    return;
  }

  // 2. Tab key -> advance cleanly
  if (e.key === 'Tab') {
    if (isPopupOpen.value) {
      let idx = typeof selectRef.value?.getOptionIndex === 'function' ? selectRef.value.getOptionIndex() : -1;
      if (idx < 0) idx = getInitialTargetIndex();
      const currentList = filteredOptions.value;
      if (idx >= 0 && currentList && currentList[idx] !== undefined) {
        const val = getOptionValue(currentList[idx]);
        emit('update:modelValue', val);
      }
      selectRef.value?.hidePopup();
    }

    const rootEl = selectRef.value?.$el as HTMLElement | undefined;
    const inToolbar = !!rootEl?.closest('.desk-grid-toolbar');
    if (inToolbar) {
      e.preventDefault();
      e.stopPropagation();
      advanceFocus(e.shiftKey ? -1 : 1);
      return;
    }
    return;
  }

  // 3. Escape key -> close popup without advancing
  if (e.key === 'Escape') {
    if (isPopupOpen.value) {
      e.preventDefault();
      e.stopPropagation();
      selectRef.value?.hidePopup();
      return;
    }
  }

  // 4. Enter key -> Tally rapid data entry
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();

    if (isPopupOpen.value) {
      // Popup open: pick highlighted item, close and advance!
      let idx = typeof selectRef.value?.getOptionIndex === 'function'
        ? selectRef.value.getOptionIndex()
        : -1;
      if (idx < 0) idx = getInitialTargetIndex();

      const currentList = filteredOptions.value;
      if (idx >= 0 && currentList && currentList[idx] !== undefined) {
        const val = getOptionValue(currentList[idx]);
        emit('update:modelValue', val);
      }
      shouldAdvanceOnClose = true;
      selectRef.value?.hidePopup();
    } else {
      // Popup closed: user hit Enter to accept current value and move to next field!
      advanceFocus(1);
    }
    return;
  }

  // 5. Shift+ArrowUp or Alt+ArrowUp -> previous field
  if (e.key === 'ArrowUp' && (e.shiftKey || e.altKey)) {
    e.preventDefault();
    e.stopPropagation();
    advanceFocus(-1);
    return;
  }

  // 6. ArrowDown or Alt+ArrowDown or Space when closed -> open dropdown
  if ((e.key === 'ArrowDown' || (e.key === 'ArrowDown' && e.altKey) || e.key === ' ') && !isPopupOpen.value) {
    e.preventDefault();
    selectRef.value?.showPopup();
    return;
  }

  // 7. Left / Right Arrow when closed -> cycle options immediately
  if (!isPopupOpen.value && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const list = props.options;
    if (list && list.length > 0) {
      e.preventDefault();
      const currentVal = props.modelValue;
      let curIdx = list.findIndex((opt) => getOptionValue(opt) === currentVal);
      if (curIdx < 0) curIdx = 0;
      const nextIdx = e.key === 'ArrowRight'
        ? Math.min(list.length - 1, curIdx + 1)
        : Math.max(0, curIdx - 1);
      const val = getOptionValue(list[nextIdx]);
      emit('update:modelValue', val);
      return;
    }
  }
}

function focus(andOpen = false) {
  if (selectRef.value && typeof selectRef.value.focus === 'function') {
    selectRef.value.focus();
  } else {
    const root = selectRef.value?.$el as HTMLElement | undefined;
    const el =
      (root?.querySelector(
        '.q-field__native[tabindex], .q-field__control[tabindex], input:not([type="hidden"])'
      ) as HTMLElement | null) ?? root;
    el?.focus();
  }
  if (andOpen) {
    setTimeout(() => selectRef.value?.showPopup(), 60);
  }
}

defineExpose({
  focus,
  focusAndOpen: () => focus(true),
  showPopup: () => selectRef.value?.showPopup(),
  hidePopup: () => selectRef.value?.hidePopup(),
  selectRef,
});
</script>

<style scoped>
.desk-combo :deep(.q-field__control) {
  height: 38px !important;
  min-height: 38px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  padding: 0 10px !important;
  transition: all 0.15s ease;
}

.desk-combo :deep(.q-field__control:before),
.desk-combo :deep(.q-field__control:after) {
  display: none !important;
  border: none !important;
  content: none !important;
}

.desk-combo :deep(.q-field__control:hover) {
  border-color: #0284c7 !important;
}

.desk-combo :deep(.q-field--focused .q-field__control),
.desk-combo :deep(.q-field:focus-within .q-field__control),
.desk-combo :deep(.q-field.q-field--focused .q-field__control) {
  border: 1.5px solid #0284c7 !important;
  border-color: #0284c7 !important;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15) !important;
  outline: none !important;
}

.desk-combo :deep(.q-field__native),
.desk-combo :deep(.q-field__input),
.desk-combo :deep(input) {
  color: #0f172a !important;
  font-size: 0.85rem !important;
  height: 38px !important;
  min-height: 38px !important;
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
  height: 38px !important;
}

.desk-combo :deep(.q-field__append .q-icon) {
  color: #64748b !important;
  font-size: 20px !important;
  transition: transform 0.2s ease !important;
}

:global(.desk-select-menu) {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

:global(.desk-select-menu .q-item) {
  color: #1e293b !important;
  min-height: 30px;
  font-size: 0.82rem;
}

:global(.desk-select-menu .q-item.q-manual-focus--is-focused),
:global(.desk-select-menu .q-item.q-item--active),
:global(.desk-select-menu .q-item:hover),
:global(.desk-select-menu .q-item.desk-option-active) {
  background: #e0f2fe !important;
  color: #0284c7 !important;
  font-weight: 700 !important;
}
</style>
