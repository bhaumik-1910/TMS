<template>
  <div
    class="animate-pulse bg-slate-200 dark:bg-slate-800"
    :class="[
      shape === 'circle' ? 'rounded-full' : shape === 'text' ? 'rounded h-3 my-1' : 'rounded-md',
      widthClass,
      heightClass,
    ]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    shape?: 'rect' | 'circle' | 'text';
    width?: string;
    height?: string;
  }>(),
  {
    shape: 'rect',
  },
);

const widthClass = computed(() => props.width || (props.shape === 'circle' ? 'w-10' : 'w-full'));
const heightClass = computed(() => props.height || (props.shape === 'circle' ? 'h-10' : props.shape === 'text' ? 'h-3' : 'h-6'));
</script>
