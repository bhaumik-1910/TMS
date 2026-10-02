const DESK_STORAGE_PREFIX = 'tms_desk_';

export function deskSet<T = any>(key: string, value: T, sessionOnly = false): boolean {
  try {
    const storage = sessionOnly ? window.sessionStorage : window.localStorage;
    const serialized = JSON.stringify({
      data: value,
      timestamp: Date.now(),
    });
    storage.setItem(`${DESK_STORAGE_PREFIX}${key}`, serialized);
    return true;
  } catch (err) {
    console.warn(`[DeskStorage] Failed to save key "${key}":`, err);
    return false;
  }
}

export function deskGet<T = any>(key: string, defaultValue: T | null = null, sessionOnly = false): T | null {
  try {
    const storage = sessionOnly ? window.sessionStorage : window.localStorage;
    const item = storage.getItem(`${DESK_STORAGE_PREFIX}${key}`);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed.data ?? defaultValue;
  } catch (err) {
    console.warn(`[DeskStorage] Failed to read key "${key}":`, err);
    return defaultValue;
  }
}

export function deskRemove(key: string, sessionOnly = false): void {
  try {
    const storage = sessionOnly ? window.sessionStorage : window.localStorage;
    storage.removeItem(`${DESK_STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[DeskStorage] Failed to remove key "${key}":`, err);
  }
}

export function deskClearNamespace(sessionOnly = false): void {
  try {
    const storage = sessionOnly ? window.sessionStorage : window.localStorage;
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(DESK_STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
  } catch (err) {
    console.warn('[DeskStorage] Failed to clear namespace:', err);
  }
}
