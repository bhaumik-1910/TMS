<template>
  <div class="tms-stat-card rounded-lg p-4 transition-all duration-150 relative overflow-hidden">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {{ title }}
      </span>
      <div class="w-7 h-7 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
        <q-icon :name="icon" size="16px" :color="iconColor || 'cyan'" />
      </div>
    </div>

    <div class="mt-2 flex items-baseline justify-between">
      <div class="text-2xl font-bold tracking-tight text-white font-mono">
        {{ value }}
      </div>
      <div v-if="change" class="flex items-center text-xs font-medium" :class="isPositive ? 'text-emerald-400' : 'text-rose-400'">
        <q-icon :name="isPositive ? 'arrow_upward' : 'arrow_downward'" size="12px" class="mr-0.5" />
        <span>{{ change }}</span>
      </div>
    </div>

    <div v-if="subtitle" class="mt-1 text-xs text-slate-400 truncate">
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
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tms-stat-card:hover {
  border-color: rgba(0, 242, 254, 0.3);
  box-shadow: 0 6px 20px rgba(0, 242, 254, 0.12);
}

.stat-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 242, 254, 0.4) 0%, transparent 100%);
}
</style>
