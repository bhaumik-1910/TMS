import { ref, computed } from 'vue';

export type DeskLayerType = 'SHELL' | 'PAGE' | 'DRAWER' | 'MODAL' | 'FLYOUT';

export interface DeskLayer {
  id: string;
  type: DeskLayerType;
  openerElement?: HTMLElement | null;
  onDismiss?: () => void;
  trapFocus?: boolean;
}

const layerStack = ref<DeskLayer[]>([
  { id: 'desk-shell-root', type: 'SHELL' },
]);

export function useDeskLayers() {
  const activeLayer = computed(() => {
    return layerStack.value[layerStack.value.length - 1] || null;
  });

  const isModalActive = computed(() => {
    return layerStack.value.some((l) => l.type === 'MODAL');
  });

  function pushLayer(layer: DeskLayer) {
    layerStack.value.push(layer);
  }

  function popLayer(id?: string): DeskLayer | undefined {
    if (layerStack.value.length <= 1) return undefined; // Never pop the SHELL

    let popped: DeskLayer | undefined;
    if (id) {
      const idx = layerStack.value.findIndex((l) => l.id === id);
      if (idx > 0) {
        popped = layerStack.value.splice(idx, 1)[0];
      }
    } else {
      popped = layerStack.value.pop();
    }

    // Restore focus to opener element if provided
    if (popped && popped.openerElement && typeof popped.openerElement.focus === 'function') {
      setTimeout(() => {
        popped?.openerElement?.focus();
      }, 50);
    }

    return popped;
  }

  function dismissTopLayer(): boolean {
    if (layerStack.value.length <= 1) return false;
    const top = layerStack.value[layerStack.value.length - 1];
    if (top.onDismiss) {
      top.onDismiss();
      return true;
    }
    popLayer();
    return true;
  }

  return {
    layerStack,
    activeLayer,
    isModalActive,
    pushLayer,
    popLayer,
    dismissTopLayer,
  };
}
