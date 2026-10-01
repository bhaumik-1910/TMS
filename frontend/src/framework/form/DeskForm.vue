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
const { focusNext, focusFirstInvalid } = useDeskFocus();

function handleKeyDown(event: KeyboardEvent) {
  // Enter key advances focus unless it's a textarea or button
  if (event.key === 'Enter' && props.enterAdvances) {
    const active = document.activeElement as HTMLElement | null;
    if (active && active.tagName.toLowerCase() !== 'textarea' && active.getAttribute('type') !== 'submit') {
      const advanced = focusNext(formRef.value || document.body);
      if (advanced) {
        event.preventDefault();
      }
    }
  }

  // Ctrl+S saves the form
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    handleSubmit();
  }

  // Escape cancels/closes
  if (event.key === 'Escape') {
    emit('cancel');
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
