<template>
  <div class="tms-stat-card rounded-lg p-4 transition-all duration-150 relative overflow-hidden">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {{ title }}
      </span>
      <div class="w-7 h-7 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
        <q-icon :name="icon" size="16px" :color="iconColor || 'primary'" />
      </div>
    </div>

    <div class="mt-2 flex items-baseline justify-between">
      <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono">
        {{ value }}
      </div>
      <div v-if="change" class="flex items-center text-xs font-medium" :class="isPositive ? 'text-emerald-600' : 'text-rose-600'">
        <q-icon :name="isPositive ? 'arrow_upward' : 'arrow_downward'" size="12px" class="mr-0.5" />
        <span>{{ change }}</span>
      </div>
    </div>

    <div v-if="subtitle" class="mt-1 text-xs text-slate-500 truncate">
      {{ subtitle }}
    </div>

    <div class="stat-accent-bar"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}>();
</script>

<style scoped>
.tms-stat-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tms-stat-card:hover {
  border-color: #0284c7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.stat-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #0284c7 0%, transparent 100%);
}
</style>
