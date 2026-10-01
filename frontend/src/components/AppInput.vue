<template>
  <div class="w-full">
    <!-- Optional Label -->
    <label v-if="label" :for="id" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative flex items-center">
      <!-- Leading Icon / Addon -->
      <div v-if="$slots.prepend || leadingIcon" class="absolute left-3 flex items-center pointer-events-none text-slate-400">
        <slot name="prepend">
          <component :is="leadingIcon" v-if="leadingIcon" class="w-4 h-4" />
        </slot>
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="onInput"
        @change="$emit('change', ($event.target as HTMLInputElement).value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Trailing Icon / Clear / Status -->
      <div v-if="$slots.append || trailingIcon || clearable" class="absolute right-3 flex items-center text-slate-400">
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="hover:text-slate-600 focus:outline-none"
          @click="$emit('update:modelValue', '')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
        <slot name="append">
          <component :is="trailingIcon" v-if="trailingIcon" class="w-4 h-4" />
        </slot>
      </div>
    </div>

    <!-- Error or Help Text -->
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../design-system/utils';

export interface InputProps {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leadingIcon?: any;
  trailingIcon?: any;
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  size: 'md',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}>();

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}

const sizeClasses = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-sm px-3', // ~36-38px compact enterprise input
  lg: 'h-10 text-sm px-3.5',
};

const inputClasses = computed(() => {
  return cn(
    'w-full bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 rounded-md font-sans tracking-tight transition-all duration-150 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500',
    sizeClasses[props.size],
    props.leadingIcon && 'pl-9',
    (props.trailingIcon || props.clearable) && 'pr-9',
    props.error
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-950'
      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/60',
    props.disabled && 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-75',
    props.readonly && 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 cursor-default',
  );
});
</script>
