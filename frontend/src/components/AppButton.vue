<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-0.5 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Prepend Icon Slot -->
    <span v-if="$slots.icon && !loading" class="mr-1.5 flex items-center">
      <slot name="icon" />
    </span>

    <!-- Content Slot -->
    <slot />

    <!-- Append Icon Slot -->
    <span v-if="$slots['icon-right']" class="ml-1.5 flex items-center">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../design-system/utils';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'sm',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm border border-transparent focus-visible:ring-blue-500',
  secondary: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm focus-visible:ring-slate-400',
  outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
  ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent focus-visible:ring-slate-400',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent focus-visible:ring-red-500',
  link: 'bg-transparent text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline border border-transparent p-0 h-auto focus-visible:ring-blue-500',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-7 px-2.5 text-xs rounded',
  sm: 'h-8 px-3 text-xs font-medium rounded-md',
  md: 'h-9 px-4 text-sm font-medium rounded-md',
  lg: 'h-10 px-5 text-sm font-semibold rounded-md',
  icon: 'h-8 w-8 p-0 flex items-center justify-center rounded-md',
};

const buttonClasses = computed(() => {
  return cn(
    'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
    variantClasses[props.variant],
    props.variant !== 'link' && sizeClasses[props.size],
    props.block && 'w-full',
  );
});
</script>
