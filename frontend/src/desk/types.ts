export interface DeskFieldContext {
  id: string;
  name: string;
  focus: () => void;
  validate?: () => boolean | string;
  el?: HTMLElement | null;
}

export interface DeskFormContext {
  registerField: (field: DeskFieldContext) => void;
  unregisterField: (id: string) => void;
  nextField: (currentId: string) => void;
  prevField: (currentId: string) => void;
  activeFieldId: string | null;
  setActiveFieldId: (id: string) => void;
  requestSave: () => void;
  requestCancel: () => void;
}

export interface ShortcutKey {
  key: string;
  label: string;
  action?: () => void;
  color?: string;
}
