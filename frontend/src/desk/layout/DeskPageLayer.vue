<template>
  <div ref="layerRef" class="desk-page-layer w-full h-full" :tabindex="-1">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDeskLayers, DeskLayerType } from './layers';

const props = withDefaults(
  defineProps<{
    id: string;
    type?: DeskLayerType;
    trapFocus?: boolean;
  }>(),
  {
    type: 'PAGE',
    trapFocus: false,
  },
);

const emit = defineEmits<{
  (e: 'dismiss'): void;
}>();

const layerRef = ref<HTMLElement | null>(null);
const { pushLayer, popLayer } = useDeskLayers();

onMounted(() => {
  pushLayer({
    id: props.id,
    type: props.type,
    openerElement: document.activeElement as HTMLElement | null,
    onDismiss: () => emit('dismiss'),
    trapFocus: props.trapFocus,
  });
});

onUnmounted(() => {
  popLayer(props.id);
});
</script>
