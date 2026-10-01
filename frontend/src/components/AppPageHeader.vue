<template>
  <div class="mb-5">
    <!-- Breadcrumb -->
    <div v-if="breadcrumb" class="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
      <router-link to="/dashboard" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        Console
      </router-link>
      <span class="text-slate-300 dark:text-slate-600">/</span>
      <span class="text-slate-300 font-medium">{{ breadcrumb }}</span>
    </div>

    <!-- Header Content & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1
            class="text-xl sm:text-2xl font-bold tracking-tight text-white m-0 leading-tight font-sans"
            style="font-size: 1.35rem; line-height: 1.3; font-weight: 700; margin: 0; color: #ffffff !important;"
          >
            {{ title }}
          </h1>
          <slot name="badge" />
        </div>
        <p v-if="subtitle" class="mt-1 text-xs sm:text-sm text-slate-400 m-0 leading-relaxed font-sans">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}>();
</script>
