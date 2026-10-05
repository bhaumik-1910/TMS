<template>
  <q-dialog
    v-model="isOpen"
    :position="dialogPosition"
    :full-height="isRightDrawer"
    :persistent="persistent"
    @show="onShow"
    @hide="onHide"
  >
    <div
      class="desk-dialog"
      :class="isRightDrawer ? 'desk-dialog--drawer' : 'desk-dialog--standard'"
      :style="dialogCardStyle"
      ref="dialogCardRef"
      @keydown="handleKeyDown"
    >
      <!-- Dialog Header matching Screenshot -->
      <div class="desk-dialog-header">
        <div class="desk-dialog-title">
          <q-icon v-if="icon" :name="icon" size="22px" class="text-sky-600" />
          <span>{{ title }}</span>
        </div>
        <button type="button" class="btn-dialog-close" @click="cancel" aria-label="Close dialog">
          <q-icon name="close" size="20px" />
        </button>
      </div>

      <!-- Dialog Body -->
      <div class="desk-dialog-body scroll" :style="bodyStyle">
        <slot></slot>
      </div>

      <!-- Dialog Footer matching Screenshot -->
      <div v-if="showFooter" class="desk-dialog-footer">
        <div v-if="footerHint" class="footer-hint-text">
          {{ footerHint }}
        </div>
        <div v-else></div>

        <div class="row items-center q-gutter-x-sm">
          <slot name="footer-actions">
            <button
              type="button"
              class="modal-btn-cancel"
              @click="cancel"
              :disabled="loading"
            >
              {{ cancelLabel || 'Cancel' }}
            </button>
            <button
              type="button"
              class="modal-btn-confirm"
              :class="{ 'modal-btn-danger': isDeleteAction }"
              @click="confirm"
              :disabled="loading"
            >
              <q-spinner v-if="loading" size="14px" class="q-mr-xs" />
              {{ confirmLabel || 'Save' }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useDeskLayers } from './layers';
import { trapFocus, FocusTrapController } from '../focus/trap';
import { useDeskFocus } from '../focus/useDeskFocus';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    icon?: string;
    width?: string;
    maxHeight?: string;
    persistent?: boolean;
    loading?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    showFooter?: boolean;
    footerHint?: string;
    position?: 'standard' | 'top' | 'right' | 'bottom' | 'left';
  }>(),
  {
    persistent: false, // Default false so clicking outside immediately closes the drawer!
    loading: false,
    showFooter: true,
    width: '620px',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const { pushLayer, popLayer } = useDeskLayers();
const dialogCardRef = ref<HTMLElement | null>(null);
let trapController: FocusTrapController | null = null;
let openerElement: HTMLElement | null = null;

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emit('update:modelValue', val);
    if (!val) {
      emit('cancel');
    }
  },
});

const isDeleteAction = computed(() => {
  const lbl = (props.confirmLabel || '').toLowerCase();
  const tit = (props.title || '').toLowerCase();
  return lbl.includes('delete') || lbl.includes('remove') || tit.includes('delete');
});

// If position is explicitly specified, use it. Otherwise, delete confirmations stay centered, while all add/edit forms slide out from the right drawer!
const dialogPosition = computed(() => {
  if (props.position) return props.position;
  return isDeleteAction.value ? 'standard' : 'right';
});

const isRightDrawer = computed(() => dialogPosition.value === 'right');

const dialogCardStyle = computed(() => {
  if (isRightDrawer.value) {
    return {
      width: props.width || '620px',
      maxWidth: '96vw',
    };
  }
  return {
    width: props.width || '520px',
    maxWidth: '95vw',
  };
});

const bodyStyle = computed(() => {
  if (isRightDrawer.value) {
    return {
      flex: '1 1 auto',
      maxHeight: 'none',
    };
  }
  return {
    maxHeight: props.maxHeight || '75vh',
  };
});

function confirm() {
  if (props.loading) return;
  emit('confirm');
}

function cancel() {
  emit('cancel');
  isOpen.value = false;
}

const { focusNextInput, focusPreviousInput } = useDeskFocus();

function handleKeyDown(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  // 1. Tally Accept shortcuts: Ctrl+A, Alt+S, or Ctrl+S immediately confirms
  if (
    ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 's')) ||
    (event.altKey && key === 's')
  ) {
    event.preventDefault();
    event.stopPropagation();
    confirm();
    return;
  }

  // 2. Escape closes dialog
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    cancel();
    return;
  }

  const activeEl = document.activeElement as HTMLElement | null;

  // 3. Close button or Cancel button explicit Enter
  if (
    activeEl &&
    (activeEl.classList.contains('modal-btn-cancel') ||
      activeEl.classList.contains('btn-dialog-close'))
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }
  }

  // 4. Confirm button explicit Enter
  if (activeEl && activeEl.classList.contains('modal-btn-confirm')) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      confirm();
      return;
    }
  }

  const isInsideTextInput =
    activeEl &&
    (activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable ||
      activeEl.closest('.q-field') !== null);

  // 5. Shift+Enter moves focus to previous input
  if (event.key === 'Enter' && event.shiftKey) {
    if (dialogCardRef.value) {
      event.preventDefault();
      event.stopPropagation();
      focusPreviousInput(dialogCardRef.value);
      return;
    }
  }

  // 6. Enter key navigation inside inputs:
  if (event.key === 'Enter' && isInsideTextInput) {
    // Let textarea handle normal Enter unless Ctrl+Enter
    if (activeEl && activeEl.tagName === 'TEXTAREA' && !event.ctrlKey) {
      return;
    }

    if (dialogCardRef.value) {
      const advanced = focusNextInput(dialogCardRef.value);
      event.preventDefault();
      event.stopPropagation();

      // If cannot advance further (on the last input field), trigger Save / Accept!
      if (!advanced) {
        confirm();
      }
      return;
    }
  }

  // 7. Explicit Y / N confirmation keys outside text inputs
  if (!isInsideTextInput) {
    if (key === 'y') {
      event.preventDefault();
      event.stopPropagation();
      confirm();
      return;
    }
    if (key === 'n') {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }
  }
}

function onShow() {
  openerElement = document.activeElement as HTMLElement | null;
  const layerId = `desk-dialog-${Date.now()}`;

  pushLayer({
    id: layerId,
    type: 'MODAL',
    openerElement,
    onDismiss: () => {
      cancel();
    },
  });

  nextTick(() => {
    if (!dialogCardRef.value) return;

    let initialFocus: HTMLElement | null = null;

    if (isDeleteAction.value) {
      // Delete confirmation: focus Cancel button so accidental Enter doesn't delete
      initialFocus = dialogCardRef.value.querySelector('.modal-btn-cancel') as HTMLElement | null;
    } else {
      // Add / Edit form: focus the very first visible input in the form body
      const body = dialogCardRef.value.querySelector('.desk-dialog-body');
      const container = body || dialogCardRef.value;
      const firstInput = container.querySelector<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea:not([disabled])'
      );
      if (firstInput && firstInput.offsetParent !== null) {
        initialFocus = firstInput;
      }
    }

    trapController = trapFocus(dialogCardRef.value, {
      initialFocus,
      // Delete: 50ms so cancel btn is ready; Add/Edit: 0ms so FleetPage's 200ms timer takes over
      focusDelay: isDeleteAction.value ? 50 : 0,
    });
  });
}

function onHide() {
  if (trapController) {
    trapController.release();
    trapController = null;
  }
  popLayer();
}
</script>

<style scoped>
.desk-dialog {
  display: flex;
  flex-direction: column;
  background: #ffffff !important;
  color: #0f172a;
  overflow: hidden;
}

/* Right Slide-over Drawer Mode */
.desk-dialog--drawer {
  height: 100vh !important;
  max-height: 100vh !important;
  border-radius: 12px 0 0 12px !important;
  border-left: 1px solid #cbd5e1 !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15) !important;
}

/* Centered Standard Modal Mode (for Delete / Alerts) */
.desk-dialog--standard {
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.desk-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #cbd5e1;
  background: #f8fafc;
  flex-shrink: 0;
}

.desk-dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.btn-dialog-close {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-dialog-close:hover {
  color: #0f172a;
  background: #e2e8f0;
}

.desk-dialog-body {
  flex: 1 1 auto;
  padding: 1.25rem;
  overflow-y: auto;
  background: #ffffff;
}

.desk-dialog-body::-webkit-scrollbar {
  width: 6px;
}
.desk-dialog-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.desk-dialog-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.desk-dialog-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.desk-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #cbd5e1;
  background: #f8fafc;
  flex-shrink: 0;
}

.modal-btn-cancel {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.modal-btn-confirm {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
  padding: 0.5rem 1.4rem;
  border-radius: 6px;
  font-size: 0.825rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #0369a1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-btn-danger {
  background: #dc2626 !important;
  color: #ffffff !important;
  border-color: #b91c1c !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.modal-btn-danger:hover:not(:disabled) {
  background: #b91c1c !important;
}

.footer-hint-text {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
}

@media (max-width: 640px) {
  .desk-dialog--drawer {
    width: 100vw !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
  }
}
</style>
