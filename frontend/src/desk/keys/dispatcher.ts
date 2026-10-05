import { useDeskLayers } from '../layout/layers';
import { DEFAULT_KEYMAP, DeskCommand } from './keymap';

export type ShortcutHandler = (event: KeyboardEvent) => boolean | void;

interface RegisteredHandler {
  id: string;
  commandId: string;
  handler: ShortcutHandler;
  allowInInputs?: boolean;
}

const registeredHandlers: RegisteredHandler[] = [];
const { dismissTopLayer } = useDeskLayers();

export function normalizeKeyEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.metaKey) parts.push('meta');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey && event.key.length > 1) parts.push('shift');

  const key = event.key.toLowerCase();
  if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
    parts.push(key);
  }
  return parts.join('+');
}

export function isEditableElement(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || el.isContentEditable) return true;
  if (tag === 'input') {
    const input = el as HTMLInputElement;
    const nonTextTypes = ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color'];
    return !nonTextTypes.includes(input.type);
  }
  return false;
}

export function dispatchKeyboardEvent(event: KeyboardEvent): boolean {
  const keyCombo = normalizeKeyEvent(event);
  const activeEl = document.activeElement as HTMLElement | null;
  const inInput = isEditableElement(activeEl);

  // 1. Special Handling: ESCAPE key dismisses active layers / modals first
  if (keyCombo === 'escape') {
    if (inInput) {
      // If typing in input, first blur or let modal handle
      activeEl?.blur();
      event.preventDefault();
      return true;
    }
    const dismissed = dismissTopLayer();
    if (dismissed) {
      event.preventDefault();
      return true;
    }
  }

  // 2. Find matching commands in registered handlers
  for (const reg of registeredHandlers) {
    const cmd: DeskCommand | undefined = DEFAULT_KEYMAP[reg.commandId];
    const match = cmd ? cmd.keys.includes(keyCombo) : reg.commandId === keyCombo;

    if (match) {
      if (inInput && !reg.allowInInputs) {
        // Skip shortcuts inside input fields unless explicitly permitted (like Ctrl+S, Ctrl+K)
        continue;
      }

      const result = reg.handler(event);
      if (result !== false) {
        event.preventDefault();
        return true;
      }
    }
  }

  // 3. Fallback: Broadcast global Tally events
  if (
    (keyCombo === 'ctrl+a' || keyCombo === 'alt+c' || keyCombo === 'alt+n' || keyCombo === 'ctrl+n' || keyCombo === 'insert') &&
    !inInput
  ) {
    window.dispatchEvent(new CustomEvent('desk:new-record'));
    event.preventDefault();
    return true;
  }

  if ((keyCombo === 'alt+f' || keyCombo === 'ctrl+f' || keyCombo === 'f3') && !inInput) {
    window.dispatchEvent(new CustomEvent('desk:focus-search'));
    event.preventDefault();
    return true;
  }

  return false;
}

export function registerShortcut(
  commandId: string,
  handler: ShortcutHandler,
  options: { allowInInputs?: boolean } = {},
): () => void {
  const id = `sh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  registeredHandlers.push({
    id,
    commandId,
    handler,
    allowInInputs: options.allowInInputs ?? (commandId === 'SAVE_FORM' || commandId === 'GLOBAL_SEARCH'),
  });

  return () => {
    const idx = registeredHandlers.findIndex((h) => h.id === id);
    if (idx >= 0) registeredHandlers.splice(idx, 1);
  };
}