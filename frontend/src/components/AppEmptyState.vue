<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
      <q-icon :name="icon || 'inbox'" size="24px" />
    </div>
    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
      {{ title }}
    </h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: string;
}>();
</script>
