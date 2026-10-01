<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20">
    <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
      {{ title || 'Unable to load records' }}
    </h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-3">
      {{ message || 'A network error occurred while communicating with the telematics service.' }}
    </p>
    <button
      type="button"
      class="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 rounded-md shadow-sm transition"
      @click="$emit('retry')"
    >
      Try Again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  message?: string;
}>();

defineEmits<{
  (e: 'retry'): void;
}>();
</script>
