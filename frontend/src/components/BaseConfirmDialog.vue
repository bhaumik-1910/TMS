<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="bg-dark text-white rounded-borders q-pa-md" style="min-width: 380px; max-width: 500px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar :icon="icon" :color="iconColor" text-color="white" size="42px" class="q-mr-md" />
        <div>
          <div class="text-h6 text-weight-bold">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-grey-5">{{ subtitle }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md text-body2 text-grey-3">
        <slot>{{ message }}</slot>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-md q-gutter-x-sm">
        <q-btn flat no-caps label="Cancel" color="grey-5" :disable="loading" @click="$emit('cancel')" />
        <q-btn
          unelevated
          no-caps
          :label="confirmLabel"
          :color="confirmColor"
          :loading="loading"
          @click="$emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    subtitle?: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    confirmLabel?: string;
    confirmColor?: string;
    loading?: boolean;
  }>(),
  {
    icon: 'warning',
    iconColor: 'negative',
    confirmLabel: 'Confirm',
    confirmColor: 'negative',
    loading: false,
  },
);

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>
