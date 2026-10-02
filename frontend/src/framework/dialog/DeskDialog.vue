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
          <q-icon v-if="icon" :name="icon" size="22px" class="text-cyan-400" />
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
import { useDeskLayers } from '../layout/layers';
import { trapFocus, FocusTrapController } from '../focus/trap';

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

function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key.toLowerCase() === 's') {
    event.preventDefault();
    event.stopPropagation();
    confirm();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    cancel();
    return;
  }

  const activeEl = document.activeElement as HTMLElement | null;

  // If focus is specifically on the cancel or close button, Enter MUST cancel!
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

  // If focus is on the confirm button, Enter confirms!
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
      activeEl.isContentEditable);

  if (!isInsideTextInput) {
    // Explicit Y / N hotkeys
    if (event.key.toLowerCase() === 'y') {
      event.preventDefault();
      event.stopPropagation();
      confirm();
      return;
    }
    if (event.key.toLowerCase() === 'n') {
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
    if (dialogCardRef.value) {
      const cancelBtn = isDeleteAction.value
        ? (dialogCardRef.value.querySelector('.modal-btn-cancel') as HTMLElement | null)
        : null;
      trapController = trapFocus(dialogCardRef.value, {
        initialFocus: cancelBtn,
      });
    }
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
  background: #091024 !important;
  color: #f1f5f9;
  overflow: hidden;
}

/* Right Slide-over Drawer Mode */
.desk-dialog--drawer {
  height: 100vh !important;
  max-height: 100vh !important;
  border-radius: 16px 0 0 16px !important;
  border-left: 1px solid rgba(0, 242, 254, 0.28) !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.85) !important;
}

/* Centered Standard Modal Mode (for Delete / Alerts) */
.desk-dialog--standard {
  border-radius: 14px !important;
  border: 1px solid rgba(0, 242, 254, 0.3) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85) !important;
}

.desk-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #070c18;
  flex-shrink: 0;
}

.desk-dialog-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.btn-dialog-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-dialog-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.desk-dialog-body {
  flex: 1 1 auto;
  padding: 1.5rem;
  overflow-y: auto;
  background: #091024;
}

.desk-dialog-body::-webkit-scrollbar {
  width: 6px;
}
.desk-dialog-body::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.desk-dialog-body::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 3px;
}
.desk-dialog-body::-webkit-scrollbar-thumb:hover {
  background: #00f2fe;
}

.desk-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #070c18;
  flex-shrink: 0;
}

.modal-btn-cancel {
  background: #131d35;
  color: #cbd5e1;
  border: 1px solid #223253;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #1e293b;
  color: #ffffff;
  border-color: #334155;
}

.modal-btn-confirm {
  background: #00f2fe;
  color: #070c18;
  border: none;
  padding: 0.6rem 1.6rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 242, 254, 0.35);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-confirm:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(0, 242, 254, 0.55);
  filter: brightness(1.05);
}

.modal-btn-danger {
  background: #ef4444 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35) !important;
}

.modal-btn-danger:hover:not(:disabled) {
  background: #dc2626 !important;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.55) !important;
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
