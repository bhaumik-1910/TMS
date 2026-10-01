<template>
  <div class="border-b border-slate-200 dark:border-slate-800">
    <nav class="flex space-x-6 overflow-x-auto" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="py-3 px-1 inline-flex items-center text-xs font-medium border-b-2 transition-all duration-150 whitespace-nowrap focus:outline-none"
        :class="[
          modelValue === tab.value
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700',
        ]"
        @click="$emit('update:modelValue', tab.value)"
      >
        <component :is="tab.icon" v-if="tab.icon" class="w-4 h-4 mr-1.5" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge !== undefined"
          class="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-mono"
          :class="modelValue === tab.value ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
export interface TabItem {
  label: string;
  value: string;
  icon?: any;
  badge?: string | number;
}

defineProps<{
  tabs: TabItem[];
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
