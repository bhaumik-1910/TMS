export interface DeskMenuItem {
  id: string;
  label: string;
  mnemonic?: string; // The character activated with Alt key, e.g. 'O'
  icon?: string;
  shortcut?: string; // Key combination, e.g. 'Ctrl+Shift+O'
  action?: () => void;
  to?: string;
  disabled?: boolean;
  divider?: boolean;
  roles?: string[];
  children?: DeskMenuItem[];
}

export interface DeskMenuSection {
  id: string;
  label: string;
  mnemonic?: string;
  icon?: string;
  items: DeskMenuItem[];
}
