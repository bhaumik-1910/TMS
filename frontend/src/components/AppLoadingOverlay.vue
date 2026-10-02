<template>
  <q-inner-loading
    :showing="showing"
    class="app-loading-overlay"
    style="background: rgba(7, 12, 24, 0.82); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 60; border-radius: 16px;"
  >
    <div class="column items-center justify-center q-pa-lg text-center">
      <q-spinner-dots :size="spinnerSize" color="cyan" />
      <div class="text-body2 text-weight-bold font-mono text-cyan-3 q-mt-md tracking-wider">
        {{ title }}
      </div>
      <div v-if="subtitle" class="text-caption font-mono text-grey-5 q-mt-xs">
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
    title: 'Refreshing Workspace...',
    subtitle: 'Syncing live telemetry, status & master data',
    spinnerSize: '56px',
  }
);
</script>
