<template>
  <div class="flex flex-center full-height q-pa-lg text-white font-mono">
    Redirecting to Dashboard...
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  router.replace('/dashboard');
});
</script>
