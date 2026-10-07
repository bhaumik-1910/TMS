import type { DeskBindings } from './keymap';

/** Page actions shared by every preset. */
const ACTIONS: DeskBindings = {
  'action-form-save': ['ctrl', 's'],
  'action-edit': ['ctrl', 'enter'],
  'action-delete': ['delete'],
  'action-refresh': ['alt', 'r'],
  'action-search': ['alt', 'f'],
  'action-export': ['alt', 'e'],
  'action-print': ['alt', 'p'],
  'action-help': ['f1'],
  'switch-company': ['alt', 'f3'],
};

/** Shell shortcuts that open a page from anywhere in the ERP. */
const NAV: DeskBindings = {
  'nav-dashboard': ['ctrl', 'shift', 'd'],
  'nav-lrs': ['f8'],
  'nav-trips': ['f7'],
  'nav-fuel': ['f9'],
  'nav-advances': ['f5'],
  'nav-pods': ['f6'],
  'nav-invoices': ['ctrl', 'f8'],
  'nav-purchase-bills': ['ctrl', 'f9'],
  'nav-settlements': ['ctrl', 'f5'],
  'nav-vehicles': ['ctrl', 'shift', 'v'],
  'nav-drivers': ['ctrl', 'shift', 'w'],
  'nav-parties': ['ctrl', 'shift', 'a'],
  'nav-customers': ['ctrl', 'shift', 'c'],
  'nav-carriers': ['ctrl', 'shift', 'p'],
  'nav-routes': ['ctrl', 'shift', 'r'],
  'nav-branches': ['ctrl', 'shift', 'b'],
  'nav-tyres': ['ctrl', 'shift', 'y'],
  'nav-maintenance': ['ctrl', 'shift', 'm'],
  'nav-reports': ['ctrl', 'alt', 'r'],
  'nav-exceptions': ['ctrl', 'shift', 'x'],
  'nav-copilot': ['ctrl', 'shift', 'g'],
  'nav-users': ['ctrl', 'shift', 'u'],
  'nav-roles': ['ctrl', 'shift', 'l'],
  'nav-company-settings': ['ctrl', 'shift', 's'],
  'nav-period-lock': ['ctrl', 'shift', 'k'],
};

export const TMS_PRESET_BINDINGS: Record<string, DeskBindings> = {
  tms: {
    ...ACTIONS,
    ...NAV,
    'action-new': ['alt', 'n'],
    'action-save': ['f12'],
    'action-cancel': ['ctrl', 'x'],
  },
  tally: {
    ...ACTIONS,
    ...NAV,
    'action-new': ['alt', 'c'],
    'action-save': ['ctrl', 'a'],
    'action-cancel': ['ctrl', 'q'],
  },
};

export const TMS_PRESETS = [
  { id: 'tms', label: 'TMS Standard' },
  { id: 'tally', label: 'Tally Prime Style' },
];

export const DEFAULT_TMS_PRESET = 'tally';
