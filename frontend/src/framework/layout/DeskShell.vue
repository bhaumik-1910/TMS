<template>
  <div class="desk-shell bg-black text-white" style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Active Layer / Main Application Content Slot -->
    <main class="desk-shell-viewport flex-1" role="main" style="position: relative;">
      <slot />
    </main>

    <!-- Bottom Status Bar with Shortcut Hints -->
    <footer
      class="desk-status-bar row items-center justify-between q-px-md text-caption font-mono"
      style="height: 26px; background: #070c18; border-top: 1px solid rgba(255, 255, 255, 0.08); color: #64748b; font-size: 0.72rem;"
    >
      <div class="row items-center q-gutter-x-md">
        <span class="row items-center q-gutter-x-xs">
          <kbd class="bg-slate-800 text-cyan-4 q-px-xs rounded text-weight-bold" style="font-size: 0.68rem;">Ctrl+K</kbd>
          <span>Palette</span>
        </span>
        <span class="row items-center q-gutter-x-xs">
          <kbd class="bg-slate-800 text-cyan-4 q-px-xs rounded text-weight-bold" style="font-size: 0.68rem;">Alt+O</kbd>
          <span>Orders</span>
        </span>
        <span class="row items-center q-gutter-x-xs">
          <kbd class="bg-slate-800 text-cyan-4 q-px-xs rounded text-weight-bold" style="font-size: 0.68rem;">Alt+S</kbd>
          <span>Shipments</span>
        </span>
        <span class="row items-center q-gutter-x-xs">
          <kbd class="bg-slate-800 text-cyan-4 q-px-xs rounded text-weight-bold" style="font-size: 0.68rem;">Alt+D</kbd>
          <span>Dispatch</span>
        </span>
      </div>

      <div class="row items-center q-gutter-x-md text-grey-5">
        <span class="row items-center q-gutter-x-xs">
          <kbd class="bg-slate-800 text-grey-3 q-px-xs rounded" style="font-size: 0.68rem;">ESC</kbd>
          <span>Close Layer</span>
        </span>
        <span class="text-cyan-4 text-weight-medium">⚡ Keyboard-First Active</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { initDeskKeyboard, destroyDeskKeyboard } from '../keys/keyboard';
import { useDeskJump } from '../keys/jump';

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
