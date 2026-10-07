export {
  type DeskKeyInput,
  type DeskKeyCombo,
  commandStandsForCtrl,
  isModifierKey,
  toCombo,
  keyInputOf,
  presetToCombo,
  comboToPreset,
  formatCombo,
  isBareCombo,
  mayDispatch,
  isEditableTarget,
} from './combo';
export * from './keymap';
export * from './presets';
export * from './labels';
export * from './deskKeymap';
export * from './dispatcher';
export * from './keyboard';
export * from './jump';
export { default as DeskKeysDialog } from './DeskKeysDialog.vue';
