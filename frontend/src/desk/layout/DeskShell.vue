<template>
  <div class="desk-shell bg-slate-50 text-slate-900" style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Top Tally Ribbon Slot -->
    <slot name="ribbon">
      <TallyTopRibbon v-if="showRibbon" />
    </slot>

    <!-- Active Layer / Main Application Content Slot -->
    <main class="desk-shell-viewport flex-1" role="main" style="position: relative;">
      <slot />
    </main>

    <!-- Bottom Global Tally Key Strip -->
    <slot name="bar">
      <DeskKeyStrip v-if="showKeyStrip" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import DeskKeyStrip from './DeskKeyStrip.vue';
import TallyTopRibbon from './TallyTopRibbon.vue';
import { initDeskKeyboard, destroyDeskKeyboard } from '../keys/keyboard';
import { useDeskJump } from '../keys/jump';

withDefaults(
  defineProps<{
    showRibbon?: boolean;
    showKeyStrip?: boolean;
  }>(),
  {
    showRibbon: false,
    showKeyStrip: true,
  }
);

onMounted(() => {
  initDeskKeyboard();
});

onUnmounted(() => {
  destroyDeskKeyboard();
});

// Activate Alt-key quick jump navigation across TMS
useDeskJump();
</script>

<style scoped>
.desk-shell {
  font-family: var(--tms-font-sans, sans-serif);
}
kbd {
  border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
