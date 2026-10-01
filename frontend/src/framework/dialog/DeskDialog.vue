<template>
  <q-dialog
    v-model="isOpen"
    :persistent="persistent"
    no-backdrop-dismiss
    @show="onShow"
    @hide="onHide"
  >
    <div
      class="desk-dialog"
      :style="{ width: width || '560px', maxWidth: '95vw' }"
      ref="dialogCardRef"
      @keydown="handleKeyDown"
    >
      <!-- Dialog Header matching Image 1 -->
      <div class="desk-dialog-header">
        <h2 class="text-lg font-bold text-white font-sans">{{ title }}</h2>
        <button class="btn-dialog-close" @click="cancel" aria-label="Close dialog">✕</button>
      </div>

      <!-- Dialog Body -->
      <div class="desk-dialog-body scroll" :style="{ maxHeight: maxHeight || '75vh' }">
        <slot></slot>
      </div>

      <!-- Dialog Footer matching Image 1 -->
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
  }>(),
  {
    persistent: true,
    loading: false,
    showFooter: true,
    width: '560px',
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
  set: (val: boolean) => emit('update:modelValue', val),
});

const isDeleteAction = computed(() => {
  const lbl = (props.confirmLabel || '').toLowerCase();
  const tit = (props.title || '').toLowerCase();
  return lbl.includes('delete') || lbl.includes('remove') || tit.includes('delete');
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
      trapController = trapFocus(dialogCardRef.value);
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
  background: #0d172b !important;
  border: 1px solid rgba(0, 242, 254, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8) !important;
  overflow: hidden;
  color: #f1f5f9;
}

.desk-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
}

.btn-dialog-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.15rem;
  line-height: 1;
  padding: 4px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.btn-dialog-close:hover {
  color: #ffffff;
}

.desk-dialog-body {
  padding: 1.25rem;
  overflow-y: auto;
  background: #0d172b;
}

.desk-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
}

.modal-btn-cancel {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #334155;
  color: #ffffff;
}

.modal-btn-confirm {
  background: #00f2fe;
  color: #070c18;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 242, 254, 0.3);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-confirm:hover:not(:disabled) {
  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.5);
  filter: brightness(1.05);
}

.modal-btn-danger {
  background: #ef4444 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35) !important;
}

.modal-btn-danger:hover:not(:disabled) {
  background: #dc2626 !important;
  box-shadow: 0 4px 18px rgba(239, 68, 68, 0.55) !important;
}

.footer-hint-text {
  font-size: 11px;
  color: #64748b;
}
</style>
