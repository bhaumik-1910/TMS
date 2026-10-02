<template>
  <form
    ref="formRef"
    class="desk-form"
    @submit.prevent="handleSubmit"
    @keydown="handleKeyDown"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDeskFocus } from '../focus/useDeskFocus';

const props = withDefaults(
  defineProps<{
    enterAdvances?: boolean;
  }>(),
  {
    enterAdvances: true,
  },
);

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<HTMLFormElement | null>(null);
const { focusNextInput, focusPreviousInput, focusFirstInvalid } = useDeskFocus();

function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+A, Alt+S or Ctrl+S saves the form immediately
  if (
    ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'a')) ||
    (event.altKey && event.key.toLowerCase() === 's')
  ) {
    event.preventDefault();
    handleSubmit();
    return;
  }

  // Escape cancels/closes
  if (event.key === 'Escape') {
    emit('cancel');
    return;
  }

  // Shift+Enter or Up Arrow moves focus back
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    focusPreviousInput(formRef.value || document.body);
    return;
  }

  // Enter key advances focus
  if (event.key === 'Enter' && props.enterAdvances) {
    const active = document.activeElement as HTMLElement | null;
    if (active && active.tagName.toLowerCase() !== 'textarea' && active.getAttribute('type') !== 'submit') {
      const advanced = focusNextInput(formRef.value || document.body);
      if (advanced) {
        event.preventDefault();
      } else {
        // At the last field -> Submit form!
        event.preventDefault();
        handleSubmit();
      }
    }
  }
}

function handleSubmit() {
  if (formRef.value) {
    const isInvalid = formRef.value.checkValidity ? !formRef.value.checkValidity() : false;
    if (isInvalid) {
      focusFirstInvalid(formRef.value);
      return;
    }
  }
  emit('submit');
}

defineExpose({
  formRef,
  focusFirstInvalid: () => formRef.value && focusFirstInvalid(formRef.value),
  submit: handleSubmit,
});
</script>
