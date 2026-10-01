import { ref } from 'vue';
import { getFocusableElements } from './trap';

const savedFocusElement = ref<HTMLElement | null>(null);

export function useDeskFocus() {
  function saveFocus(el?: HTMLElement | null) {
    savedFocusElement.value = el || (document.activeElement as HTMLElement | null);
  }

  function restoreFocus() {
    if (savedFocusElement.value && typeof savedFocusElement.value.focus === 'function') {
      savedFocusElement.value.focus();
      savedFocusElement.value = null;
    }
  }

  function focusFirst(container: HTMLElement = document.body) {
    const focusables = getFocusableElements(container);
    if (focusables[0]) {
      focusables[0].focus();
      return true;
    }
    return false;
  }

  function focusNext(container: HTMLElement = document.body): boolean {
    const focusables = getFocusableElements(container);
    const currentIndex = focusables.findIndex((el) => el === document.activeElement);
    if (currentIndex >= 0 && currentIndex < focusables.length - 1) {
      focusables[currentIndex + 1].focus();
      return true;
    }
    return false;
  }

  function focusPrevious(container: HTMLElement = document.body): boolean {
    const focusables = getFocusableElements(container);
    const currentIndex = focusables.findIndex((el) => el === document.activeElement);
    if (currentIndex > 0) {
      focusables[currentIndex - 1].focus();
      return true;
    }
    return false;
  }

  function focusFirstInvalid(formElement: HTMLElement): boolean {
    const invalidSelector =
      '.q-field--error input, .q-field--error select, .q-field--error textarea, [aria-invalid="true"], :invalid';
    const firstInvalid = formElement.querySelector<HTMLElement>(invalidSelector);
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
      return true;
    }
    return false;
  }

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusNext,
    focusPrevious,
    focusFirstInvalid,
  };
}
