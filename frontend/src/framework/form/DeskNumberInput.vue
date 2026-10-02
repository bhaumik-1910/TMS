<template>
  <div class="desk-number-input">
    <q-input
      :model-value="modelValue"
      type="number"
      dense
      outlined
      :placeholder="placeholder"
      :step="step"
      :min="min"
      :max="max"
      :readonly="readonly"
      :disable="disable"
      class="font-mono"
      input-class="font-mono font-bold text-white text-sm"
      @update:model-value="onInput"
    >
      <template #append>
        <div class="desk-num-stepper-col">
          <q-btn
            flat
            dense
            round
            icon="keyboard_arrow_up"
            size="8px"
            color="cyan"
            class="desk-num-stepper-btn"
            :disable="disable || readonly || (max !== undefined && numValue >= max)"
            @click.stop.prevent="increment"
          >
            <q-tooltip v-if="!disable && !readonly">Increment</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="keyboard_arrow_down"
            size="8px"
            color="grey-5"
            class="desk-num-stepper-btn text-slate-400 hover:text-white"
            :disable="disable || readonly || (min !== undefined && numValue <= min)"
            @click.stop.prevent="decrement"
          >
            <q-tooltip v-if="!disable && !readonly">Decrement</q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number | string | undefined | null;
    placeholder?: string;
    step?: number;
    min?: number;
    max?: number;
    readonly?: boolean;
    disable?: boolean;
  }>(),
  {
    placeholder: '0',
    step: 1,
    readonly: false,
    disable: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void;
}>();

const numValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === null || props.modelValue === '') return 0;
  return Number(props.modelValue) || 0;
});

function onInput(val: string | number | null) {
  emit('update:modelValue', Number(val) || 0);
}

function increment() {
  const next = numValue.value + props.step;
  if (props.max !== undefined && next > props.max) return;
  emit('update:modelValue', parseFloat(next.toFixed(4)));
}

function decrement() {
  const next = numValue.value - props.step;
  if (props.min !== undefined && next < props.min) return;
  emit('update:modelValue', parseFloat(next.toFixed(4)));
}
</script>

<style scoped>
.desk-number-input {
  position: relative;
}

/* Hide native browser spinners */
.desk-number-input :deep(input[type='number']::-webkit-outer-spin-button),
.desk-number-input :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.desk-number-input :deep(input[type='number']) {
  -moz-appearance: textfield !important;
}

/* Custom Stepper Arrows Column - borderless clean look */
.desk-num-stepper-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-right: -4px;
}

.desk-num-stepper-btn {
  min-height: 13px !important;
  height: 13px !important;
  width: 18px !important;
  padding: 0 !important;
  line-height: 1 !important;
  border: none !important;
  border-radius: 3px !important;
  box-shadow: none !important;
}

.desk-num-stepper-btn:hover {
  background: rgba(0, 242, 254, 0.2) !important;
  color: #00f2fe !important;
}
</style>
