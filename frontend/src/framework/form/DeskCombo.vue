<template>
  <q-select
    v-model="modelValueComputed"
    :options="options"
    :option-value="isObjectOptions ? optionValue : undefined"
    :option-label="isObjectOptions ? optionLabel : undefined"
    :emit-value="isObjectOptions ? emitValue : false"
    :map-options="isObjectOptions ? mapOptions : false"
    :placeholder="placeholder"
    :disable="disable"
    :loading="loading"
    dense
    outlined
    behavior="menu"
    no-error-icon
    class="desk-combo text-body2 font-sans"
    popup-content-class="desk-select-menu"
  >
    <template #no-option>
      <q-item dense>
        <q-item-section class="text-grey-5 text-caption">
          No matching records
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: any;
    options: any[];
    optionValue?: string;
    optionLabel?: string;
    emitValue?: boolean;
    mapOptions?: boolean;
    placeholder?: string;
    disable?: boolean;
    loading?: boolean;
  }>(),
  {
    optionValue: 'id',
    optionLabel: 'name',
    emitValue: true,
    mapOptions: true,
    placeholder: 'Select...',
    disable: false,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
}>();

const isObjectOptions = computed(() => {
  return props.options && props.options.length > 0 && typeof props.options[0] === 'object' && props.options[0] !== null;
});

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped>
.desk-combo :deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  background: #0d172b !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 8px !important;
  padding: 0 10px !important;
  transition: all 0.15s ease;
}

/* Remove Quasar default pseudo borders to completely eliminate double borders */
.desk-combo :deep(.q-field__control:before),
.desk-combo :deep(.q-field__control:after) {
  display: none !important;
  border: none !important;
  content: none !important;
}

.desk-combo :deep(.q-field__control:hover) {
  border-color: rgba(0, 242, 254, 0.4) !important;
}

.desk-combo :deep(.q-field--focused .q-field__control),
.desk-combo :deep(.q-field:focus-within .q-field__control),
.desk-combo :deep(.q-field.q-field--focused .q-field__control) {
  border: 1.5px solid #00f2fe !important;
  border-color: #00f2fe !important;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25) !important;
  outline: none !important;
}

.desk-combo :deep(.q-field__native),
.desk-combo :deep(.q-field__input),
.desk-combo :deep(input) {
  color: #ffffff !important;
  font-size: 0.85rem !important;
  height: 40px !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
  border: none !important;
  padding-left: 0 !important;
}

.desk-combo :deep(input:focus),
.desk-combo :deep(input:focus-visible),
.desk-combo :deep(.q-field__native:focus),
.desk-combo :deep(.q-field__native:focus-visible) {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.desk-combo :deep(.q-field__marginal) {
  height: 40px !important;
}
</style>
