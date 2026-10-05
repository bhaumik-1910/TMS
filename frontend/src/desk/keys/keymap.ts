export interface DeskCommand {
  id: string;
  label: string;
  description?: string;
  category: 'NAVIGATION' | 'DATA' | 'WORKFLOW' | 'SYSTEM';
  keys: string[]; // e.g. ['ctrl+s', 'cmd+s']
  roleRequired?: string[];
  permissionRequired?: string;
  scope?: 'GLOBAL' | 'FORM' | 'GRID' | 'DIALOG';
}

export const DEFAULT_KEYMAP: Record<string, DeskCommand> = {
  // Navigation & Search
  GLOBAL_SEARCH: {
    id: 'GLOBAL_SEARCH',
    label: 'Open Command Palette',
    category: 'NAVIGATION',
    keys: ['ctrl+k', 'meta+k'],
    scope: 'GLOBAL',
  },
  DISMISS_LAYER: {
    id: 'DISMISS_LAYER',
    label: 'Close Active Layer / Modal',
    category: 'NAVIGATION',
    keys: ['escape'],
    scope: 'GLOBAL',
  },

  // Data & Forms
  SAVE_FORM: {
    id: 'SAVE_FORM',
    label: 'Save Current Record (Tally Accept)',
    category: 'DATA',
    keys: ['ctrl+a', 'alt+s', 'ctrl+s', 'meta+s'],
    scope: 'FORM',
  },
  NEW_RECORD: {
    id: 'NEW_RECORD',
    label: 'New Record / Voucher Create',
    category: 'DATA',
    keys: ['alt+c', 'ctrl+alt+n', 'insert', 'ctrl+n'],
    scope: 'GLOBAL',
  },
  EDIT_CELL: {
    id: 'EDIT_CELL',
    label: 'Edit Grid Cell / Quick Date',
    category: 'DATA',
    keys: ['f2'],
    scope: 'GRID',
  },
  SWITCH_TENANT: {
    id: 'SWITCH_TENANT',
    label: 'Switch Company / Tenant',
    category: 'SYSTEM',
    keys: ['f3'],
    scope: 'GLOBAL',
  },
  FILTER_SEARCH: {
    id: 'FILTER_SEARCH',
    label: 'Filter Active Table / Search',
    category: 'NAVIGATION',
    keys: ['alt+f'],
    scope: 'GLOBAL',
  },

  // Workflow Actions
  PLAN_LOAD: {
    id: 'PLAN_LOAD',
    label: 'Consolidate & Plan Load',
    category: 'WORKFLOW',
    keys: ['ctrl+shift+p'],
    roleRequired: ['TRANSPORT_PLANNER', 'SUPER_ADMIN', 'TMS_ADMIN'],
    scope: 'GLOBAL',
  },
  RELEASE_DISPATCH: {
    id: 'RELEASE_DISPATCH',
    label: 'Release Dispatch to Driver',
    category: 'WORKFLOW',
    keys: ['ctrl+shift+d'],
    roleRequired: ['DISPATCHER', 'SUPER_ADMIN', 'OPERATIONS_MANAGER'],
    scope: 'GLOBAL',
  },
  PRINT_INVOICE: {
    id: 'PRINT_INVOICE',
    label: 'Preview / Print Invoice PDF',
    category: 'WORKFLOW',
    keys: ['ctrl+shift+i'],
    scope: 'GLOBAL',
  },
};
