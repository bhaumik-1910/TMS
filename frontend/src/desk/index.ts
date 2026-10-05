// ============================================================================
// ENTERPRISE DESK FRAMEWORK - TALLY PRIME / ERP KEYBOARD-FIRST ARCHITECTURE
// ============================================================================

// Theme & Tokens
import './theme/desk-tokens.css';
export * from './theme';

// Focus Management
export * from './focus';

// Form System (Keyboard Input, Combo, Lookup, Date, Number)
export * from './form';

// Data Grid (High-Density Keyboard-Navigable Table)
export * from './grid';

// Keyboard Engine (Global Keymap, Hotkeys, Jump Shortcuts)
export * from './keys';

// Composables
export * from './composables/useDeskKeyboard';
export * from './composables/useDeskPageShortcuts';

// Layout & Dialogs (Shell, Drawer/Dialog, Layer Manager, KeyStrip)
export * from './layout';

// Menus & Navigation
export * from './menu';

// Pivot Analysis Engine
export * from './pivot';

// Storage & Form Draft Persistence
export * from './storage';

// Legacy / Component Views
export { default as VehicleMasterDeskModal } from './views/VehicleMasterDeskModal.vue';
