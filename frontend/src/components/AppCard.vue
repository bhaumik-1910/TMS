<template>
  <div :class="cardClasses">
    <!-- Header Slot -->
    <div v-if="$slots.header || title" class="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
      <div>
        <h3 v-if="title" class="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.action" class="flex items-center space-x-2">
        <slot name="action" />
      </div>
      <slot v-else name="header" />
    </div>

    <!-- Body Content -->
    <div :class="bodyClasses">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="px-5 py-3 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 rounded-b-lg flex items-center justify-between">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../design-system/utils';

export interface CardProps {
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
  hoverable?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  noPadding: false,
  hoverable: false,
});

const cardClasses = computed(() => {
  return cn(
    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-all duration-150',
    props.hoverable && 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md',
    props.class,
  );
});

const bodyClasses = computed(() => {
  return cn(
    !props.noPadding && 'p-5',
  );
});
</script>
