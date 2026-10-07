import { ref, onMounted, onUnmounted } from 'vue';
import { formatCombo, presetToCombo, type DeskCombo } from './combo';
import {
  bindingSource,
  comboConflicts,
  indexBindings,
  mergeBindings,
  type DeskBindingSource,
  type DeskBindings,
} from './keymap';
import { DEFAULT_TMS_PRESET, TMS_PRESET_BINDINGS, TMS_PRESETS } from './presets';
import { tmsActionLabel } from './labels';
import { registerShortcut, type ShortcutHandler } from './dispatcher';

/** Bumped on every keymap change so labels re-render reactively. */
export const deskKeymapRevision = ref(0);

let storageKey = '';
let currentPreset = DEFAULT_TMS_PRESET;
let overrides: DeskBindings = {};
let bindings: DeskBindings = mergeBindings(TMS_PRESET_BINDINGS[currentPreset] ?? {}, {});
let index = indexBindings(bindings);
let jumpPreview = true;

interface StoredKeymap {
  preset?: unknown;
  bindings?: unknown;
  jumpPreview?: unknown;
}

function rebuild(): void {
  const base = TMS_PRESET_BINDINGS[currentPreset] ?? TMS_PRESET_BINDINGS[DEFAULT_TMS_PRESET] ?? {};
  bindings = mergeBindings(base, overrides);
  index = indexBindings(bindings);
  deskKeymapRevision.value += 1;
}

function parseBindings(raw: unknown): DeskBindings {
  if (!raw || typeof raw !== 'object') return {};
  const out: DeskBindings = {};
  for (const [id, keys] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(keys) && keys.every((key) => typeof key === 'string')) out[id] = keys;
  }
  return out;
}

function readStored(): StoredKeymap {
  if (!storageKey) return {};
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as StoredKeymap;
  } catch {
    return {};
  }
}

function write(): void {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify({ preset: currentPreset, bindings: overrides, jumpPreview }));
}

/**
 * Load this user's preset and custom bindings from localStorage.
 */
export function loadDeskKeymap(userId?: string | number | null): void {
  storageKey = userId === null || userId === undefined || userId === '' ? 'desk.keys.default' : `desk.keys.${String(userId)}`;
  const stored = readStored();
  const wanted = typeof stored.preset === 'string' ? stored.preset : DEFAULT_TMS_PRESET;
  currentPreset = TMS_PRESET_BINDINGS[wanted] ? wanted : DEFAULT_TMS_PRESET;
  overrides = parseBindings(stored.bindings);
  jumpPreview = stored.jumpPreview !== false;
  rebuild();
}

/** Whether holding the jump key outlines where it will land. */
export function deskJumpPreview(): boolean {
  void deskKeymapRevision.value;
  return jumpPreview;
}

export function setDeskJumpPreview(on: boolean): void {
  jumpPreview = on;
  write();
  deskKeymapRevision.value += 1;
}

export function deskPresetId(): string {
  void deskKeymapRevision.value;
  return currentPreset;
}

export function setDeskPreset(id: string): void {
  if (!TMS_PRESET_BINDINGS[id]) return;
  currentPreset = id;
  write();
  rebuild();
}

export function deskActionsFor(combo: DeskCombo): readonly string[] {
  return index.get(combo) ?? [];
}

export function deskComboFor(actionId: string): DeskCombo | null {
  return presetToCombo(bindings[actionId] ?? []);
}

/** Display label such as `Ctrl+S` or `Alt+F3`. Reactive through `deskKeymapRevision`. */
export function deskKeyLabel(actionId: string): string {
  void deskKeymapRevision.value;
  return formatCombo(deskComboFor(actionId));
}

/** An empty list unbinds the action. */
export function setDeskBinding(actionId: string, keys: string[]): void {
  overrides = { ...overrides, [actionId]: keys };
  write();
  rebuild();
}

export function resetDeskBindings(): void {
  overrides = {};
  write();
  rebuild();
}

export function deskConflicts(actionId: string, combo: DeskCombo): string[] {
  return comboConflicts(bindings, actionId, combo);
}

export interface DeskBindingRow extends Record<string, unknown> {
  id: string;
  action: string;
  keys: string;
  source: DeskBindingSource;
}

export function deskBindingRows(): DeskBindingRow[] {
  void deskKeymapRevision.value;
  return Object.keys(bindings)
    .map((id) => ({
      id,
      action: tmsActionLabel(id),
      keys: formatCombo(deskComboFor(id)),
      source: bindingSource(id, overrides),
    }))
    .sort((a, b) => a.action.localeCompare(b.action));
}

// Composition API hook for pages
export interface ShortcutBinding {
  commandId: string;
  handler: ShortcutHandler;
  allowInInputs?: boolean;
}

export function useDeskKeymap(hookBindings: ShortcutBinding[]) {
  const cleanups: Array<() => void> = [];

  onMounted(() => {
    for (const binding of hookBindings) {
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
