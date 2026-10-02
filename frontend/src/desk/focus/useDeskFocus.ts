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

  function getFormInputs(container: HTMLElement = document.body): HTMLElement[] {
    const qFields = Array.from(container.querySelectorAll<HTMLElement>('.q-field'));
    if (qFields.length > 0) {
      const inputs: HTMLElement[] = [];
      for (const field of qFields) {
        if (field.offsetParent === null || window.getComputedStyle(field).visibility === 'hidden') continue;
        const target = field.querySelector<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), .q-field__native[tabindex="0"], .q-field__control[tabindex="0"], textarea:not([disabled]), select:not([disabled])'
        );
        if (target && target.offsetParent !== null && window.getComputedStyle(target).visibility !== 'hidden') {
          inputs.push(target);
        } else {
          // If no specific target, check if any element has tabindex 0 inside field
          const tabEl = field.querySelector<HTMLElement>('[tabindex="0"]');
          if (tabEl && tabEl.offsetParent !== null && window.getComputedStyle(tabEl).visibility !== 'hidden') {
            inputs.push(tabEl);
          }
        }
      }
      if (inputs.length > 0) return inputs;
    }

    const selector =
      'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), .q-field__native[tabindex="0"], [role="combobox"]';
    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    return elements.filter((el) => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden');
  }

  function focusNextInput(container: HTMLElement = document.body): boolean {
    const inputs = getFormInputs(container);
    const active = document.activeElement as HTMLElement | null;
    const activeField = active?.closest('.q-field');
    const currentIndex = inputs.findIndex(
      (el) => el === active || el.contains(active) || (activeField && el.closest('.q-field') === activeField)
    );
    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      const next = inputs[currentIndex + 1];
      next.scrollIntoView?.({ block: 'nearest' });
      next.focus();
      return true;
    }
    return false;
  }

  function focusPreviousInput(container: HTMLElement = document.body): boolean {
    const inputs = getFormInputs(container);
    const active = document.activeElement as HTMLElement | null;
    const activeField = active?.closest('.q-field');
    const currentIndex = inputs.findIndex(
      (el) => el === active || el.contains(active) || (activeField && el.closest('.q-field') === activeField)
    );
    if (currentIndex > 0) {
      const prev = inputs[currentIndex - 1];
      prev.scrollIntoView?.({ block: 'nearest' });
      prev.focus();
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
    focusNextInput,
    focusPreviousInput,
    getFormInputs,
    focusFirstInvalid,
  };
}
