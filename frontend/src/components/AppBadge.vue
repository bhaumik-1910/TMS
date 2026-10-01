<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border font-sans select-none tracking-tight transition-colors duration-150"
    :class="badgeClasses"
  >
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../design-system/utils';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
  size?: 'xs' | 'sm';
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'neutral',
  size: 'sm',
});

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const badgeClasses = computed(() => {
  return cn(
    variantClasses[props.variant],
    props.size === 'xs' ? 'text-[11px] px-1.5 py-0.2' : 'text-xs px-2 py-0.5',
  );
});
</script>
