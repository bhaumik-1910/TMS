/** A typed company setting, declared in code. Values live in `company_settings`. */
export interface SettingDef<T = unknown> {
  key: string;
  type: 'boolean' | 'number' | 'string';
  default: T;
  label?: string;
  group?: string;
  description?: string;
}

/** Declares a setting with its type inferred from the default: `defineSetting({ key: 'branch.scopeEnabled', type: 'boolean', default: true })`. */
export function defineSetting<T extends boolean | number | string>(def: SettingDef<T> & { default: T }): SettingDef<T> {
  return def;
}
