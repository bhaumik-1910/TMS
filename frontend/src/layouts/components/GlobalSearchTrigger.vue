<template>
  <div class="gt-xs" style="width: 400px; max-width: 40vw;">
    <div
      class="row items-center justify-between q-px-sm cursor-pointer rounded-borders bg-dark"
      style="height: 38px; border: 1px solid rgba(255, 255, 255, 0.1);"
      @click="$emit('trigger')"
    >
      <div class="row items-center q-gutter-x-xs text-caption text-grey-5">
        <q-icon name="search" size="16px" color="cyan" />
        <span>Search orders, shipments, drivers...</span>
      </div>
      <div class="row items-center q-gutter-x-xs">
        <kbd class="text-caption text-grey-5 q-px-xs rounded-borders bg-black" style="font-size: 0.65rem; border: 1px solid rgba(255, 255, 255, 0.1);">Ctrl</kbd>
        <kbd class="text-caption text-grey-5 q-px-xs rounded-borders bg-black" style="font-size: 0.65rem; border: 1px solid rgba(255, 255, 255, 0.1);">K</kbd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'trigger'): void;
}>();
</script>
