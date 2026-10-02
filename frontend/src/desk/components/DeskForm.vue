<template>
  <form
    ref="formRef"
    class="desk-form-container"
    @submit.prevent="handleSubmit"
    @keydown="handleKeyDown"
  >
    <slot />

    <!-- Classic Tally Accept Modal Prompt -->
    <DeskAcceptPrompt
      v-model="showAcceptPrompt"
      @accept="handleSubmit"
      @reject="handleRejectAccept"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, nextTick } from 'vue';
import type { DeskFieldContext, DeskFormContext } from '../types';
import { useDeskKeyboard } from '../composables/useDeskKeyboard';
import DeskAcceptPrompt from './DeskAcceptPrompt.vue';

const props = withDefaults(
  defineProps<{
    promptOnComplete?: boolean;
  }>(),
  {
    promptOnComplete: true,
  }
);

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<HTMLFormElement | null>(null);
const showAcceptPrompt = ref(false);

const {
  fields,
  activeFieldId,
  registerField,
  unregisterField,
  focusFirst,
  nextField,
  prevField,
  setActiveFieldId,
} = useDeskKeyboard({
  onSave: handleSubmit,
  onCancel: () => emit('cancel'),
  onPromptAccept: () => {
    if (props.promptOnComplete) {
      showAcceptPrompt.value = true;
    } else {
      handleSubmit();
    }
  },
});

const formContext: DeskFormContext = {
  registerField,
  unregisterField,
  nextField,
  prevField,
  activeFieldId: activeFieldId.value,
  setActiveFieldId,
  requestSave: handleSubmit,
  requestCancel: () => emit('cancel'),
};

provide('deskFormContext', {
  ...formContext,
  activeFieldId,
});

function handleKeyDown(e: KeyboardEvent) {
  // If Accept modal is open, let DeskAcceptPrompt handle it
  if (showAcceptPrompt.value) return;

  // Ctrl+A or Alt+S: Save immediately
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    handleSubmit();
    return;
  }
  if (e.altKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    handleSubmit();
    return;
  }

  // Escape: Close / Cancel
  if (e.key === 'Escape') {
    e.preventDefault();
    emit('cancel');
  }
}

function handleSubmit() {
  emit('submit');
}

function handleRejectAccept() {
  // Focus back to the last field
  nextTick(() => {
    if (fields.value.length > 0) {
      const last = fields.value[fields.value.length - 1];
      last.focus();
    }
  });
}

onMounted(() => {
  focusFirst();
});

defineExpose({
  focusFirst,
  submit: handleSubmit,
});
</script>

<style scoped>
.desk-form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
