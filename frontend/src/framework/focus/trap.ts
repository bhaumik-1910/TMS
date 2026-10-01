const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return elements.filter(
    (el) => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden',
  );
}

export interface FocusTrapController {
  release: () => void;
  focusFirst: () => void;
  focusLast: () => void;
}

export function trapFocus(
  container: HTMLElement,
  options: { initialFocus?: HTMLElement | null; returnFocusTo?: HTMLElement | null } = {},
): FocusTrapController {
  const previousActiveElement = options.returnFocusTo || (document.activeElement as HTMLElement | null);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusables = getFocusableElements(container);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusables[0];
    const lastElement = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Set initial focus
  const initial = options.initialFocus || getFocusableElements(container)[0];
  if (initial) {
    setTimeout(() => initial.focus(), 30);
  }

  return {
    release: () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    },
    focusFirst: () => {
      const focusables = getFocusableElements(container);
      if (focusables[0]) focusables[0].focus();
    },
    focusLast: () => {
      const focusables = getFocusableElements(container);
      const last = focusables[focusables.length - 1];
      if (last) last.focus();
    },
  };
}
