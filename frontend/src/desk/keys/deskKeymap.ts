import { onMounted, onUnmounted } from 'vue';
import { registerShortcut, ShortcutHandler } from './dispatcher';

export interface ShortcutBinding {
  commandId: string;
  handler: ShortcutHandler;
  allowInInputs?: boolean;
}

export function useDeskKeymap(bindings: ShortcutBinding[]) {
  const cleanups: Array<() => void> = [];

  onMounted(() => {
    for (const binding of bindings) {
      const cleanup = registerShortcut(binding.commandId, binding.handler, {
        allowInInputs: binding.allowInInputs,
      });
      cleanups.push(cleanup);
    }
  });

  onUnmounted(() => {
    while (cleanups.length > 0) {
      const fn = cleanups.pop();
      if (fn) fn();
    }
  });
}
