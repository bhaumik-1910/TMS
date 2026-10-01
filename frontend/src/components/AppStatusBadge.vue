<template>
  <q-badge
    :color="style.color"
    :text-color="style.textColor || 'white'"
    class="q-px-sm q-py-xs text-weight-medium rounded-borders row items-center no-wrap q-gutter-x-xs"
  >
    <q-icon :name="style.icon" size="12px" />
    <span>{{ style.label }}</span>
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStatusStyle } from '../composables/useStatusStyle';

const props = defineProps<{
  status: string;
}>();

const { getStatusStyle } = useStatusStyle();

const style = computed(() => getStatusStyle(props.status));
</script>
