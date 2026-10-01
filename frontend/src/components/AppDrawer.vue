<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out transform"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="modelValue"
            class="w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col"
            :class="widthClasses[width]"
          >
            <!-- Drawer Header -->
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  {{ title }}
                </h3>
                <p v-if="description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ description }}
                </p>
              </div>
              <button
                type="button"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                @click="close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Drawer Body -->
            <div class="p-5 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300">
              <slot />
            </div>

            <!-- Drawer Footer -->
            <div v-if="$slots.footer" class="p-4 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              <slot name="footer" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export interface DrawerProps {
  modelValue: boolean;
  title: string;
  description?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

withDefaults(defineProps<DrawerProps>(), {
  width: 'md',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
};

function close() {
  emit('update:modelValue', false);
}
</script>
