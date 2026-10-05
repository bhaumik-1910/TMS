<template>
  <q-inner-loading
    :showing="showing"
    class="app-loading-overlay"
    style="background: #ffffff !important; background-color: #ffffff !important; opacity: 1 !important; z-index: 60; border-radius: 8px;"
  >
    <div class="column items-center justify-center q-pa-lg text-center bg-white">
      <q-spinner-dots :size="spinnerSize" color="primary" />
      <div class="text-body2 text-weight-bold text-slate-900 q-mt-md tracking-wide">
        {{ title }}
      </div>
      <div v-if="subtitle" class="text-caption text-slate-500 q-mt-xs">
        {{ subtitle }}
      </div>
    </div>
  </q-inner-loading>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    showing: boolean;
    title?: string;
    subtitle?: string;
    spinnerSize?: string;
  }>(),
  {
    showing: false,
    title: 'Loading Records...',
    subtitle: 'Syncing live telemetry, status & master data',
    spinnerSize: '48px',
  }
);
</script>
