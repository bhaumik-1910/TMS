<template>
  <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {{ title }}
      </span>
      <div v-if="icon || $slots.icon" class="w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300">
        <slot name="icon">
          <q-icon v-if="typeof icon === 'string' && !icon.includes('-')" :name="icon" size="18px" />
          <component :is="icon" v-else-if="icon" class="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </slot>
      </div>
    </div>

    <!-- Value Row -->
    <div class="mt-2 flex items-baseline justify-between">
      <div class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
        {{ value }}
      </div>

      <!-- Trend / Change Indicator -->
      <div v-if="change" class="flex items-center text-xs font-medium" :class="isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
        <svg v-if="isPositive" class="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <svg v-else class="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>{{ change }}</span>
      </div>
    </div>

    <!-- Subtitle / Meta -->
    <div v-if="subtitle" class="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StatProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
  change?: string;
  isPositive?: boolean;
}

withDefaults(defineProps<StatProps>(), {
  isPositive: true,
});
</script>
