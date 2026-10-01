import { dispatchKeyboardEvent } from './dispatcher';

let isListening = false;

export function initDeskKeyboard() {
  if (isListening || typeof window === 'undefined') return;

  window.addEventListener('keydown', onRootKeyDown, { capture: false });
  isListening = true;
}

export function destroyDeskKeyboard() {
  if (!isListening || typeof window === 'undefined') return;

  window.removeEventListener('keydown', onRootKeyDown);
  isListening = false;
}

function onRootKeyDown(event: KeyboardEvent) {
  // Let browser native DevTools / Page Zoom / Refresh pass through
  if (event.key === 'F12' || (event.ctrlKey && ['r', 'F5'].includes(event.key))) {
    return;
  }

  dispatchKeyboardEvent(event);
}
